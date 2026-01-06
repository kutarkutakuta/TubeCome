import Link from 'next/link';
import FetchForm from "@/components/FetchForm";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">TubeCome (ちゅーこめ)</h1>
        <p className="text-lg">
          個人YouTuberのためのコメント分析ツール
        </p>
        
        <div className="flex gap-8 items-start flex-col md:flex-row w-full">
          {/* 左側: データ取得 */}
          <section className="p-6 border rounded-lg flex-1 w-full bg-white shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📥</span> データ取得
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              チャンネルIDを指定して、直近10件の動画のコメントを一括取得します。
            </p>
            <FetchForm />
          </section>

          {/* 右側: 分析・一覧 */}
          <section className="p-6 border rounded-lg flex-1 w-full bg-gray-50">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>📊</span> 分析・可視化
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              保存された動画一覧と、各動画の感情分析レポートを確認できます。
            </p>
            <div className="text-center">
              <Link 
                href="/videos" 
                className="inline-block bg-white border border-gray-300 text-gray-700 font-medium py-2 px-6 rounded hover:bg-gray-50 transition-colors shadow-sm"
              >
                動画一覧を見る →
              </Link>
            </div>
            <div className="mt-6 text-xs text-gray-500 text-center">
                 Edge Function による自動感情分析もここから確認できます
            </div>
          </section>
        </div>

        <div className="w-full mt-8">
            <h3 className="text-lg font-bold mb-4">使い方のヒント</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                <li>チャンネルIDは YouTube チャンネルURLの <code>/channel/</code> の後ろにある <code>UC...</code> で始まるIDです。</li>
                <li>ハンドル名（@user-name）には現在対応していません。</li>
                <li>直近10本の動画から、それぞれ最大50件のコメントを取得します。</li>
            </ul>
        </div>
      </main>
    </div>
  );
}
