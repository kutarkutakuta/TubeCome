export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-bold">TubeCome</h1>
        <p className="text-lg">
          YouTube Comments Analyzer for Individual Creators.
        </p>
        
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <div className="p-6 border rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-2">Data Fetching</h2>
            <p className="text-sm text-gray-600 mb-4">
              Import comments from YouTube Data API manually.
            </p>
            {/* TODO: Add FetchButton component here */}
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled>
              Start Fetching (Setup Required)
            </button>
          </div>

          <div className="p-6 border rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-2">Analysis</h2>
            <p className="text-sm text-gray-600 mb-4">
              Visualize comment trends and user sentiments.
            </p>
            <div className="bg-gray-100 p-4 rounded text-center text-gray-500">
              No Data Available
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
