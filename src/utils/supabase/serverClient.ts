/**
 * YouTube Data API クォータ管理用 Supabase サーバークライアント
 * 
 * 概要:
 * - YouTube API の使用量を Supabase の youtube_quota_logs テーブルに記録します
 * - IP アドレス単位での使用量制限（警告/エラー閾値）を管理します
 * - 集計期間は JST（日本時間）17:00〜翌日17:00 を 1 日として扱います
 * 
 * 環境変数:
 * - SUPABASE_URL: Supabase プロジェクトの URL
 * - SUPABASE_SERVICE_ROLE_KEY: サービスロールキー（管理者権限）
 * - YT_QUOTA_WARN_PER_IP: IP ごとの警告閾値（デフォルト: 1000）
 * - YT_QUOTA_ERROR_PER_IP: IP ごとのエラー閾値（デフォルト: 5000）
 */
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
} else {
  console.warn('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL not set; quota logging will be no-op');
}

/**
 * 集計日ラベル（YYYY-MM-DD）を JST（日本時間）基準で返します
 * 
 * YouTube Data API のクォータは日次でリセットされますが、このアプリでは
 * 日本時間の 17:00 を日次の切替時刻として扱います。
 * つまり、JST 17:00〜翌日 16:59:59 を 1 つの集計日として扱います。
 * 
 * 例:
 * - 2026-01-02 16:30 JST → ラベル: "2026-01-02" (前日17:00から当日16:59の範囲)
 * - 2026-01-02 17:00 JST → ラベル: "2026-01-02" (当日17:00から翌日16:59の範囲)
 * - 2026-01-02 03:00 JST → ラベル: "2026-01-01" (前日17:00から当日16:59の範囲、まだ前日扱い)
 * 
 * 技術的な注意:
 * - この関数は UTC タイムスタンプを受け取り、JST に変換して判定します
 * - Supabase の date 列（DATE型）に格納されるラベルを算出します
 * - 実際の UTC タイムスタンプは created_at 列（TIMESTAMPTZ型）に記録されます
 * - date 列のみで集計しているため、遅延書き込みやラベル不整合があると誤集計の可能性があります
 * 
 * @param date - 対象の日時（省略時は現在時刻）
 * @returns YYYY-MM-DD 形式の集計日ラベル
 */
const getAggregationDateInJST = (date = new Date()): string => {
  // UTC タイムスタンプに +9時間を加算して JST 相当の時刻を作成
  // ※ Date オブジェクトは内部的に UTC で保持されるため、getUTCHours() で JST の時刻を取得できます
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  
  const hour = jst.getUTCHours(); // JST での時刻（0〜23）
  
  // 17時以降なら当日の日付をそのまま使用、17時より前なら前日の日付を使用
  // 例: JST 2026-01-02 16:00 → 前日（2026-01-01）の集計日
  //     JST 2026-01-02 17:00 → 当日（2026-01-02）の集計日
  const target = hour >= 17 ? jst : new Date(jst.getTime() - 24 * 60 * 60 * 1000);
  
  // YYYY-MM-DD 形式のラベルを作成
  const yyyy = target.getUTCFullYear();
  const mm = String(target.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(target.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * YouTube API のクォータ使用量を記録し、IP ごとの閾値を評価します
 * 
 * 処理フロー:
 * 1. クライアント IP を取得（引数で渡されない場合はヘッダから抽出）
 * 2. 集計日ラベルを算出（JST 17:00 起点）
 * 3. youtube_quota_logs テーブルに記録
 * 4. IP がある場合、当日の合計使用量を集計
 * 5. 閾値超過の場合は警告/エラーマーカーを挿入し、ステータスを返す
 * 
 * @param type - API 操作の種類（例: 'search', 'videos', 'channels'）
 * @param units - 消費クォータ単位数（デフォルト: 1）
 * @param details - 追加の詳細情報（JSONB として保存）
 * @param clientIp - クライアント IP アドレス（省略時は自動抽出）
 * @returns ステータスオブジェクト（noop/logged/ok/warn/error）
 */
export async function logYouTubeQuota(type: string, units = 1, details?: Record<string, any>, clientIp?: string) {
  // Supabase クライアントが初期化されていない場合は何もしない
  if (!supabaseAdmin) return { status: 'noop' as const };

  try {
    // クライアント IP アドレスを取得
    // 引数で渡されていない場合は、Next.js のヘッダから自動抽出を試みます
    let ip = clientIp;
    if (!ip) {
      try {
        const headersList = await headers();
        // IP アドレスを以下の優先順位で取得:
        // 1. x-forwarded-for: プロキシ/ロードバランサ経由の場合（カンマ区切りの最初を使用）
        // 2. x-real-ip: Nginx などが設定する実 IP
        // 3. cf-connecting-ip: Cloudflare 経由の場合
        ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim()
          || headersList.get('x-real-ip')
          || headersList.get('cf-connecting-ip')
          || undefined;
      } catch (e) {
        // headers() は静的生成（Static Site Generation）などの一部コンテキストでは失敗します
        // その場合は IP なしで続行します（閾値チェックはスキップされます）
      }
    }

    // JST 17:00 を起点とした集計日ラベルを算出（YYYY-MM-DD 形式）
    const today = getAggregationDateInJST();
    
    // youtube_quota_logs テーブルに使用量を記録
    // ※ date 列は集計用ラベル、created_at 列は実際の UTC タイムスタンプ
    await (supabaseAdmin as any).from('youtube_quota_logs').insert({ date: today, type, units, details, client_ip: ip ?? null });

    // IP アドレスがある場合、当日の合計使用量を集計して閾値を評価します
    // IP がない場合は閾値チェックをスキップします（匿名アクセスや開発環境など）
    if (ip) {
      const { data, error } = await (supabaseAdmin as any)
        .from('youtube_quota_logs')
        .select('units')
        .eq('date', today)
        .eq('client_ip', ip);

      if (error) {
        console.error('Failed to read quota total for IP:', error);
        return { status: 'logged' as const };
      }

      // 当日（date = today）の全レコードの units を合計
      const total = (data || []).reduce((s: number, r: any) => s + (r?.units || 0), 0);
      
      // 環境変数から閾値を取得（IP ごとの 1 日あたりの制限）
      // ※ YouTube Data API v3 の標準クォータは 1 日 10,000 units ですが、
      //   複数ユーザーで共有するため IP ごとに制限を設けています
      const warnThreshold = parseInt(process.env.YT_QUOTA_WARN_PER_IP || '1000', 10);
      const errorThreshold = parseInt(process.env.YT_QUOTA_ERROR_PER_IP || '5000', 10);

      // エラー閾値を超過した場合
      if (total >= errorThreshold) {
        // エラーマーカーを quota.error として記録（監視/分析用）
        try {
          await (supabaseAdmin as any).from('youtube_quota_logs').insert({ date: today, type: 'quota.error', units: 0, details: { ip, total, threshold: errorThreshold }, client_ip: ip });
        } catch (e) {
          console.error('Failed to insert quota.error marker:', e);
        }
        console.error('YouTube quota ERROR threshold exceeded', { clientIp: ip, total, threshold: errorThreshold });
        return { status: 'error' as const, total, threshold: errorThreshold };
      }

      // 警告閾値を超過した場合（エラー閾値未満）
      if (total >= warnThreshold) {
        // 警告マーカーを quota.warn として記録
        try {
          await (supabaseAdmin as any).from('youtube_quota_logs').insert({ date: today, type: 'quota.warn', units: 0, details: { ip, total, threshold: warnThreshold }, client_ip: ip });
        } catch (e) {
          console.error('Failed to insert quota.warn marker:', e);
        }
        console.warn('YouTube quota WARNING threshold exceeded', { clientIp: ip, total, threshold: warnThreshold });
        return { status: 'warn' as const, total, threshold: warnThreshold };
      }

      return { status: 'ok' as const, total };
    }

    return { status: 'logged' as const };
  } catch (err) {
    console.error('Failed to log YouTube quota to Supabase:', err);
    return { status: 'error' as const, reason: String(err) };
  }
}

/**
 * 指定された IP アドレスの当日クォータ使用量合計を取得します
 * 
 * 「当日」の定義: JST 17:00〜翌日 16:59:59 の範囲
 * 
 * @param clientIp - 対象の IP アドレス
 * @returns 当日の合計クォータ使用量（units の合計）、エラー時は 0
 */
export async function getDailyQuotaTotalByIp(clientIp: string) {
  if (!supabaseAdmin) return 0;
  try {
    // JST 17:00 起点の集計日ラベルを取得
    const today = getAggregationDateInJST();
    const { data, error } = await (supabaseAdmin as any)
      .from('youtube_quota_logs')
      .select('units')
      .eq('date', today)
      .eq('client_ip', clientIp);

    if (error) {
      console.error('Failed to read quota total for IP:', error);
      return 0;
    }

    return (data || []).reduce((s: number, r: any) => s + (r?.units || 0), 0);
  } catch (err) {
    console.error('Failed to getDailyQuotaTotalByIp:', err);
    return 0;
  }
}

/**
 * 全 IP アドレス合計の当日クォータ使用量を取得します
 * 
 * 「当日」の定義: JST 17:00〜翌日 16:59:59 の範囲
 * 
 * 用途:
 * - 全体的な API 使用状況の監視
 * - YouTube Data API のプロジェクト全体のクォータ上限（10,000 units/日）に対する使用率の確認
 * 
 * @returns 当日の全体合計クォータ使用量（units の合計）、エラー時は 0
 */
export async function getDailyQuotaTotalGlobal() {
  if (!supabaseAdmin) return 0;
  try {
    // JST 17:00 起点の集計日ラベルを取得
    const today = getAggregationDateInJST();
    const { data, error } = await (supabaseAdmin as any)
      .from('youtube_quota_logs')
      .select('units')
      .eq('date', today);

    if (error) {
      console.error('Failed to read global quota total:', error);
      return 0;
    }

    return (data || []).reduce((s: number, r: any) => s + (r?.units || 0), 0);
  } catch (err) {
    console.error('Failed to getDailyQuotaTotalGlobal:', err);
    return 0;
  }
}

// サービスロールキーを持つ管理用クライアントをエクスポート
// ※ この変数は直接操作せず、上記の関数を通じて使用することを推奨します
// サービスロールキーを持つ管理用クライアントをエクスポート
// ※ この変数は直接操作せず、上記の関数を通じて使用することを推奨します
// ※ クライアントサイドには絶対に公開しないでください（サーバーサイド専用）
export { supabaseAdmin };
