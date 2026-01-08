import React from 'react';
import Link from 'next/link';

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

      <div className="win-window win-inset p-4 space-y-3">
        <section>
          <h2 className="font-bold">使い方</h2>
          <p className="text-sm">TubeCome はレトロ風インターフェイスで YouTube チャンネルや動画を閲覧できるアプリです。サイドバーのメニューや画面内のボタンを使って操作してください。</p>
        </section>

        <section>
          <h2 className="font-bold">よくある質問</h2>
          <ul className="list-disc list-inside text-sm">
            <li>チャンネルを追加するには：右上の「+」ボタンを押してチャンネル ID を入力します。</li>
            <li>お気に入りはローカルに保存されます。ブラウザを変えると共有されません。</li>
            <li>データの更新や不具合は開発者に報告してください。</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold">開発者向け</h2>
          <p className="text-sm">リポジトリや issue は <Link href="/">README</Link> を参照してください。</p>
        </section>
      </div>

      <div className="h-20" />
    </div>
  );
}
