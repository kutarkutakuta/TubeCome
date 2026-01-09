import React from 'react';
import Link from 'next/link';
import QuotaUsageClient from '@/components/QuotaUsageClient';

export default function HelpPage() {
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="win-inset bg-white p-2 mb-4">
        <h1 className="text-2xl italic font-black text-slate-800 tracking-tighter">
          <span className="text-blue-700">Tube</span>Come
          <span className="text-red-500 text-xs ml-1">2000</span>
        </h1>
      </div>

      <div className="win-window win-title-bar mb-4">
        <div className="text-lg font-bold">ヘルプ</div>
      </div>

      <div className="win-window win-inset p-4 space-y-4">
        <section>
          <p className="text-sm">本アプリケーションはレトロ風インターフェイスで YouTube コメントを閲覧する軽量アプリです。</p>
          <br/>
          <h2 className="font-bold">使い方</h2>
          <ul className="list-disc list-inside text-sm mt-2">
            <li>チャンネルの登録：<Link href="/">ホーム</Link> のページでチャンネルURLまたはチャンネルIDを追加します。</li>
            <li>お気に入り：チャンネル一覧で <strong>★</strong> をクリックしてお気に入りに追加できます。サイドバーはお気に入りのみ表示します。</li>
            <li>並び替え：チャンネル一覧でドラッグ＆ドロップして順序を変更できます（サイドバーにも反映されます）。</li>
            <li>動画ページ：チャンネルに紐づく動画を直近50個まで閲覧できます。</li>
          </ul>
        </section>
        <section>
          <h2 className="font-bold">プライバシーポリシー</h2>
          <p className="text-sm">本アプリケーションはアカウントや個人を識別する情報を収集しません。次に保存・送信される可能性のあるデータを示します。</p>
          <ul className="list-disc list-inside text-sm mt-2">
            <li><strong>ローカルストレージ</strong>：チャンネル登録情報（IndexedDB: <code>tubecome_db</code> / store: <code>channels</code>）、お気に入り（localStorage: <code>tubecome-favorites</code>）、テーマ設定（localStorage: <code>theme</code>）、クライアント側の一時的な動画リスト（sessionStorage: <code>tubecome:video-list</code>）。</li>
            <li><strong>Cookie</strong>：内部 API 用に HTTPOnly cookie <code>tubecome_client_id</code> を利用することがあります（識別用途で、安全に扱います）。</li>
            <li><strong>外部API</strong>：チャンネル解決や動画統計取得のために YouTube の RSS あるいは Invidious などの外部サービスに問い合わせる場合があります。</li>
            <li><strong>第三者トラッキング</strong>：本アプリは分析ツールや広告のトラッキングを使用していません。</li>
            <li><strong>データ削除</strong>：チャンネルは <Link href="/">ホーム</Link> のページで削除可能です。ローカルストレージ（ブラウザのサイトデータ）を消去すると全データが削除されます。</li>
          </ul>
          <p className="text-sm mt-2">ご不明点やデータに関する要請（削除・エクスポートなど）がある場合は、管理者へお問い合わせください（連絡先は下記）。</p>
        </section>

        <section>
          <h2 className="font-bold">お問い合わせ</h2>
          <a href="https://x.com/kutakutar_ff11" target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">https://x.com/kutakutar_ff11</a>
        </section>

        <section>
          <QuotaUsageClient />
        </section>
      </div>

      <div className="h-20" />
    </div>
  );
}
