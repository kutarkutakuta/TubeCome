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

      <div className="win-window win-title-bar mb-4 bg-slate-100 border-b border-slate-200 px-3 py-1 rounded-sm">
        <div className="text-lg font-bold">ヘルプ</div>
      </div>

      <div className="space-y-4">
        <div className="win-window win-title-bar mb-2 bg-slate-100 border-b border-slate-200 px-3 py-1 rounded-sm">
        <div className="text-lg font-bold">🎯 サービス概要</div>
      </div>
      <div className="win-window win-inset p-4">
        <p className="text-sm text-[var(--fg-primary)] leading-relaxed"><strong>TubeCome</strong>（ちゅーこめ）は、某大型掲示板風インターフェイスで YouTubeコメントを閲覧できる軽量アプリケーションです。</p>
        <p className="text-sm text-[var(--fg-primary)] leading-relaxed">YouTubeチャンネルを登録することで新着・未読コメントを効率的にチェックできます。</p>
      </div> 

        <div className="win-window win-title-bar mb-2 bg-slate-100 border-b border-slate-200 px-3 py-1 rounded-sm">
          <div className="font-bold text-sm">💡 使い方</div>
        </div> 
        <div className="win-window win-inset p-4">
          <ul className="list-disc list-inside text-sm space-y-2 text-[var(--fg-primary)]">
            <li><strong>チャンネルの登録</strong>：<Link href="/" className="text-blue-600 underline">ホーム</Link> のページでYouTubeの「チャンネルURL」または「チャンネルID」を追加します。
            Androidの場合はYouTubeアプリの<strong>共有</strong>からチャンネル登録も可能です。</li>
            <li><strong>チャンネル一覧</strong>：<Link href="/" className="text-blue-600 underline">ホーム</Link> のページに登録したチャンネルの一覧が表示されます。チャンネル内に新着動画があればバッジが表示されます。</li>
            <li><strong>お気に入り</strong>：チャンネル一覧で <strong>★</strong> をクリックしてお気に入りに追加できます。</li>
            <li><strong>並び替え</strong>：チャンネル一覧でドラッグ＆ドロップして順序を変更できます（お気に入りの順序にも反映されます）。</li>
            <li><strong>動画一覧</strong>：チャンネルに紐づく動画を閲覧できます。新着・未読コメントがあればバッジが表示されます。</li>
            <li><strong>コメント一覧</strong>：動画の詳細情報とコメントを閲覧できます。読んだコメントの位置を記憶して再訪問時に位置を復元します。</li>
          </ul>
        </div> 

        {/* Android共有のやり方 */}
        <div className="win-window win-title-bar mb-2 bg-slate-100 border-b border-slate-200 px-3 py-1 rounded-sm">
          <div className="font-bold text-sm">📲 AndroidでYouTubeから共有してチャンネル登録</div>
        </div>
        <div className="win-window win-inset p-4">
          <ul className="list-disc list-inside text-sm space-y-2 text-[var(--fg-primary)]">
            <li><strong>インストール</strong>：Chromeで本Webサイトを開いた状態で、メニュー（︙）→『ホーム画面に追加』を選択してAndroidアプリとしてインストールします。</li>
            <li><strong>共有手順</strong>：YouTubeアプリでチャンネルページを開き、<strong>共有</strong>→共有先一覧から<strong>TubeCome</strong>を選択するとチャンネル登録ができます。</li>
          </ul>
        </div>

        <div className="win-window win-title-bar mb-2 bg-slate-100 border-b border-slate-200 px-3 py-1 rounded-sm">
          <div className="font-bold text-sm">📉 利用制限</div>
        </div>
        <div className="win-window win-inset p-4">
          <p className="text-sm text-[var(--fg-primary)] leading-relaxed">本アプリケーションで使用している YouTube Data API には日次の使用上限があるため、利用制限を行うことがあります。</p>
          <p className="text-sm text-[var(--fg-primary)] leading-relaxed">また、利用制限の都合上、古いコメントが一部欠落することがあります。</p>
          <div className="mt-4">
            <QuotaUsageClient />
          </div>
        </div>

        <div className="win-window win-title-bar mb-2 bg-slate-100 border-b border-slate-200 px-3 py-1 rounded-sm">
          <div className="font-bold text-sm">🔧 技術スタック</div>
        </div>
        <div className="win-window win-inset p-4">
          <ul className="list-disc list-inside text-sm space-y-2 text-[var(--fg-primary)]">
            <li>Next.js (App Router) / React / TypeScript</li>
            <li>Tailwind CSS / Ant Design</li>
            <li>Supabase (Postgres) で利用状況ログを管理</li>
            <li>IndexedDB をクライアントキャッシュに利用</li>
            <li>YouTube Data API / YouTube RSS を利用したチャンネル解決</li>
          </ul>
        </div>

        <div className="win-window win-title-bar mb-2 bg-slate-100 border-b border-slate-200 px-3 py-1 rounded-sm">
          <div className="font-bold text-sm">📝 免責事項</div>
        </div> 
        <div className="win-window win-inset p-4">
          <p className="text-sm text-[var(--fg-primary)] leading-relaxed">本サービスは公式 YouTube とは一切関係ありません。</p>
          <p className="text-sm text-[var(--fg-primary)] leading-relaxed">本サービスの利用によって生じたいかなる損害についても、運営者は責任を負いかねます。</p>
          <p className="text-sm text-[var(--fg-primary)] leading-relaxed">プライバシーポリシーの詳細は <a href="/privacy.html" className="text-blue-600 underline" target="_blank" rel="noreferrer">プライバシーポリシー</a> をご覧ください。</p>
        </div>



        <div className="win-window win-title-bar mb-2 bg-slate-100 border-b border-slate-200 px-3 py-1 rounded-sm">
          <div className="font-bold text-sm">📮 お問い合わせ</div>
        </div>
        <div className="win-window win-inset p-4">
          <p className="text-sm text-[var(--fg-primary)] leading-relaxed">ご意見・ご要望・不具合報告などは、以下の x.com アカウントまでお気軽にお寄せください</p>
          <a href="https://x.com/kutakutar_ff11" target="_blank" rel="noreferrer" className="text-blue-600 underline hover:brightness-75 transition-all text-sm">
            @kutakutar_ff11
          </a>
        </div>
      </div>

      <div className="h-5" />
    </div>
  );
}
