import React from 'react';
import Link from 'next/link';
import QuotaUsageClient from '@/components/QuotaUsageClient';
import { InfoCircleOutlined, QuestionCircleOutlined, LockOutlined, MailOutlined, BarChartOutlined } from '@ant-design/icons';

export default function HelpPage() {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="win-inset bg-white p-2 mb-4">
        <h1 className="text-2xl italic font-black text-slate-800 tracking-tighter">
          <span className="text-blue-700">Tube</span>Come
          <span className="text-red-500 text-xs ml-1">2000</span>
        </h1>
      </div>

      <div className="win-window win-title-bar mb-4 bg-slate-100 border-b border-slate-200 px-3 py-1 rounded-sm">
        <div className="text-lg font-bold">ヘルプ</div>
      </div>

      <div className="space-y-4">
        <div className="win-window win-inset p-4">
          <p className="text-sm text-[var(--fg-primary)] leading-relaxed">本アプリケーションはレトロ風インターフェイスで YouTube コメントを閲覧する軽量アプリです。</p>
        </div>

        <div className="win-window win-title-bar mb-2 bg-slate-500 border-b border-slate-200 px-3 py-1 rounded-sm">
          <div className="font-bold text-sm"><QuestionCircleOutlined className="mr-2 text-[var(--fg-secondary)] align-middle" />使い方</div>
        </div>
        <div className="win-window win-inset p-4">
          <ul className="list-disc list-inside text-sm space-y-2 text-[var(--fg-primary)]">
            <li><strong>チャンネルの登録</strong>：<Link href="/" className="text-blue-600 underline">ホーム</Link> のページでチャンネルURLまたはチャンネルIDを追加します。</li>
            <li><strong>お気に入り</strong>：チャンネル一覧で <strong>★</strong> をクリックしてお気に入りに追加できます。サイドバーはお気に入りのみ表示します。</li>
            <li><strong>並び替え</strong>：チャンネル一覧でドラッグ＆ドロップして順序を変更できます（サイドバーにも反映されます）。</li>
            <li><strong>動画ページ</strong>：チャンネルに紐づく動画を直近50個まで閲覧できます。</li>
          </ul>
        </div>

        <div className="win-window win-title-bar mb-2 bg-slate-100 border-b border-slate-200 px-3 py-1 rounded-sm">
          <div className="font-bold text-sm"><LockOutlined className="mr-2 text-[var(--fg-secondary)] align-middle" />プライバシーポリシー</div>
        </div>
        <div className="win-window win-inset p-4">
          <p className="text-sm text-[var(--fg-primary)] leading-relaxed mb-3">本アプリケーションはアカウントや個人を識別する情報を収集しません。次に保存・送信される可能性のあるデータを示します。</p>
          <ul className="list-disc list-inside text-sm space-y-2 text-[var(--fg-primary)]">
            <li><strong>ローカルストレージ</strong>：チャンネル登録情報（IndexedDB: <code className="bg-gray-100 px-1 py-0.5 rounded">tubecome_db</code> / store: <code className="bg-gray-100 px-1 py-0.5 rounded">channels</code>）、お気に入り（localStorage: <code className="bg-gray-100 px-1 py-0.5 rounded">tubecome-favorites</code>）、テーマ設定（localStorage: <code className="bg-gray-100 px-1 py-0.5 rounded">theme</code>）、クライアント側の一時的な動画リスト（sessionStorage: <code className="bg-gray-100 px-1 py-0.5 rounded">tubecome:video-list</code>）。</li>
            <li><strong>Cookie</strong>：内部 API 用に HTTPOnly cookie <code className="bg-gray-100 px-1 py-0.5 rounded">tubecome_client_id</code> を利用することがあります（識別用途で、安全に扱います）。</li>
            <li><strong>外部API</strong>：チャンネル解決や動画統計取得のために YouTube の RSS あるいは Invidious などの外部サービスに問い合わせる場合があります。</li>
            <li><strong>第三者トラッキング</strong>：本アプリは分析ツールや広告のトラッキングを使用していません。</li>
            <li><strong>データ削除</strong>：チャンネルは <Link href="/" className="text-blue-600 underline">ホーム</Link> のページで削除可能です。ローカルストレージ（ブラウザのサイトデータ）を消去すると全データが削除されます。</li>
          </ul>
          <p className="text-sm text-[var(--fg-secondary)] mt-4">ご不明点やデータに関する要請（削除・エクスポートなど）がある場合は、管理者へお問い合わせください（連絡先は下記）。</p>
        </div>

        <div className="win-window win-title-bar mb-2 bg-slate-100 border-b border-slate-200 px-3 py-1 rounded-sm">
          <div className="font-bold text-sm"><BarChartOutlined className="mr-2 text-[var(--fg-secondary)] align-middle" />API使用量</div>
        </div>
        <div className="win-window win-inset p-4">
          <QuotaUsageClient />
        </div>

        <div className="win-window win-title-bar mb-2 bg-slate-100 border-b border-slate-200 px-3 py-1 rounded-sm">
          <div className="font-bold text-sm"><MailOutlined className="mr-2 text-[var(--fg-secondary)] align-middle" />お問い合わせ</div>
        </div>
        <div className="win-window win-inset p-4">
          <a href="https://x.com/kutakutar_ff11" target="_blank" rel="noreferrer" className="text-blue-600 underline hover:brightness-75 transition-all text-sm">
            https://x.com/kutakutar_ff11
          </a>
        </div>
      </div>

      <div className="h-5" />
    </div>
  );
}
