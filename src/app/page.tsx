import React from 'react';

export default function Home() {
  const threads = [
    { title: 'Windows 2000風のサイトが完成した件について', count: 1002, icon: '', date: '2026/01/07' },
    { title: '今日の晩御飯を淡々と晒すスレ', count: 45, icon: '', date: '2026/01/07' },
    { title: 'プログラミング初心者が陥りやすい罠 34', count: 890, icon: '', date: '2026/01/06' },
    { title: 'おすすめのテキストエディタ教えてくれ', count: 12, icon: '', date: '2026/01/06' },
    { title: '眠い誰か起こして', count: 3, icon: '', date: '2026/01/05' },
    { title: '宇宙人が攻めてきたらどうする？', count: 567, icon: '', date: '2026/01/05' },
    { title: '昔のインターフェースの方が使いやすかった説', count: 123, icon: '', date: '2026/01/04' },
  ];

  return (
    <div className='p-4 md:p-8 max-w-5xl mx-auto'>
      
      {/* Welcome Window */}
      <div className='win-window mb-8'>
        <div className='win-title-bar'>
          <span>Welcome.exe</span>
          <div className='flex space-x-1'>
            <button className='w-4 h-4 text-xs win-btn flex items-center justify-center leading-none'>_</button>
            <button className='w-4 h-4 text-xs win-btn flex items-center justify-center leading-none'></button>
            <button className='w-4 h-4 text-xs win-btn flex items-center justify-center leading-none font-bold'></button>
          </div>
        </div>
        <div className='p-6 bg-[var(--win-gray)]'>
          <div className='flex flex-col md:flex-row items-center gap-6'>
            <div className='w-16 h-16 md:w-24 md:h-24 bg-white win-inset flex items-center justify-center text-4xl shadow-inner'>
               
            </div>
            <div>
                <h2 className='text-lg font-bold mb-2'>TubeCome へようこそ</h2>
                <p className='mb-2 text-sm leading-relaxed'>
                   ここはレトロな雰囲気の動画共有コミュニティです。<br/>
                   懐かしのインターフェースで、新しいコンテンツをお楽しみください。
                </p>
                <div className='flex gap-2 mt-4'>
                    <button className='win-btn min-w-[100px] font-bold'>ログイン</button>
                    <button className='win-btn min-w-[100px]'>キャンセル</button>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className='grid md:grid-cols-3 gap-4'>
        
        {/* Thread List Pane */}
        <div className='md:col-span-2 win-window'>
            <div className='win-title-bar'>
              <span>最新スレッド一覧</span>
              <span>Total: {threads.length}</span>
            </div>
            <div className='p-1'>
                <div className='win-inset bg-white p-2 h-[400px] overflow-y-auto'>
                    <table className='w-full text-sm border-collapse'>
                        <thead className='sticky top-0 bg-[var(--win-gray)] shadow-sm'>
                            <tr className='text-left text-xs'>
                                <th className='p-1 border-b border-gray-400 w-10 text-center'>No.</th>
                                <th className='p-1 border-b border-gray-400'>Title</th>
                                <th className='p-1 border-b border-gray-400 w-20 text-right'>Res</th>
                                <th className='p-1 border-b border-gray-400 w-24 text-right'>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {threads.map((thread, i) => (
                                <tr key={i} className='hover:bg-blue-100 group cursor-pointer'>
                                    <td className='p-1 border-b border-dotted border-gray-300 text-center text-gray-500 font-mono'>{i + 1}</td>
                                    <td className='p-1 border-b border-dotted border-gray-300'>
                                        <span className='mr-1'>{thread.icon}</span>
                                        <a href='#' className='text-blue-800 group-hover:underline group-hover:text-red-600 line-clamp-1'>{thread.title}</a>
                                    </td>
                                    <td className='p-1 border-b border-dotted border-gray-300 text-right font-mono'>{thread.count}</td>
                                    <td className='p-1 border-b border-dotted border-gray-300 text-right text-xs text-gray-500'>{thread.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='p-1 bg-[var(--win-gray)] border-t border-white text-xs flex justify-between items-center px-2'>
                <span>5 objects selected</span>
                <span className='win-inset px-2 py-0.5 bg-white'>12.4 MB</span>
            </div>
        </div>

        {/* Sidebar Widgets (Right) */}
        <div className='space-y-4'>
            {/* System Info Widget */}
            <div className='win-window'>
                <div className='win-title-bar bg-gradient-to-r from-teal-700 to-teal-500'>
                    <span>System Info</span>
                </div>
                <div className='p-2 text-xs'>
                    <div className='flex justify-between mb-1'>
                        <span>CPU Usage:</span>
                        <div className='w-24 h-3 bg-black win-inset relative'>
                            <div className='absolute top-0 left-0 h-full bg-green-500 w-[45%]'></div>
                            <div className='absolute top-0 left-0 w-full h-full grid grid-cols-10 pointer-events-none'>
                                {[...Array(10)].map((_, i) => <div key={i} className='border-r border-black/20 h-full'></div>)}
                            </div>
                        </div>
                    </div>
                    <div className='flex justify-between mb-1'>
                        <span>Memory:</span>
                        <div className='w-24 h-3 bg-black win-inset relative'>
                            <div className='absolute top-0 left-0 h-full bg-green-500 w-[72%]'></div>
                            <div className='absolute top-0 left-0 w-full h-full grid grid-cols-10 pointer-events-none'>
                                {[...Array(10)].map((_, i) => <div key={i} className='border-r border-black/20 h-full'></div>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hot Tags Widget */}
            <div className='win-window'>
                <div className='win-title-bar'>
                    <span>Hot Tags</span>
                </div>
                <div className='p-2 bg-white win-inset m-1 h-32 overflow-y-auto'>
                    <div className='flex flex-wrap gap-1'>
                        {['#Retro', '#NextJS', '#Tailwind', '#Windows', '#Design', '#Frontend', '#Supabase', '#React'].map((tag) => (
                            <span key={tag} className='bg-gray-200 border border-gray-400 text-xs px-1 hover:bg-yellow-100 cursor-pointer'>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

