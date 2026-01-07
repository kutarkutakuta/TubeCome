import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import './globals.css';
import Link from 'next/link';
import FavoritesList from '../components/FavoritesList';
import AddChannelForm from '../components/AddChannelForm';
import MobileActions from '../components/MobileActions';

export const metadata: Metadata = {
  title: 'TubeCome | Retro Edition',
  description: 'Retro Style Video Community',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Menu order: チャンネル登録, お気に入りチャンネル, 履歴, 検索, 設定
  const menuItems = [
    { name: '閲覧履歴', href: '/history', icon: '🕘' },
    { name: '検索', href: '/search', icon: '🔍' },
    { name: '設定', href: '/settings', icon: '⚙️' },
  ];

  return (
    <html lang='ja' data-theme='modern'>
      <body className='antialiased text-sm'>
        <AntdRegistry>
          <div className='flex min-h-screen flex-col md:flex-row'>
            {/* Sidebar (Desktop Only) */}
            <aside className='hidden md:flex flex-col w-64 fixed h-full top-0 left-0 sidebar-container z-20'>
              {/* Branding Area */}
              <div className='p-2 pb-0'>
                  <div className='win-inset bg-white p-2 mb-2'>
                      <h1 className='text-xl italic font-black text-slate-800 tracking-tighter'>
                          <span className='text-blue-700'>Tube</span>Come
                          <span className='text-red-500 text-xs ml-1'>2000</span>
                      </h1>
                  </div>
              </div>
              
              {/* Favorites List */}
              <div className='p-2'>
                <div className='mt-2'>
                    {/* Add channel form */}
                    <div className='mb-2'><AddChannelForm /></div>
                    <FavoritesList />
                  </div>
              </div>

              <div className='flex-1 overflow-y-auto p-2'>
                  <div className='win-outset bg-[var(--bg-panel)] p-1'>
                      <ul className='space-y-1'>
                      {menuItems.map((item) => (
                          <li key={item.name}>
                          <Link 
                              href={item.href}
                              className='flex items-center space-x-2 px-2 py-1.5 hover:bg-[var(--accent-active)] hover:text-[var(--accent-active-fg)] transition-colors cursor-pointer border border-transparent hover:border-dotted hover:border-white'
                          >
                              <span className='text-lg'>{item.icon}</span>
                              <span className='font-bold'>{item.name}</span>
                          </Link>
                          </li>
                      ))}
                      </ul>
                  </div>

              </div>
            
            </aside>

            {/* Main Content Area */}
            <main className='flex-1 md:ml-64 min-h-screen pb-20 md:pb-0 relative'>
              {children}
            </main>

            {/* Bottom Navigation (Mobile Only) */}
            <nav className='md:hidden fixed bottom-0 left-0 w-full h-16 mobile-nav-container grid grid-cols-4 z-50 px-1 pb-1'>
              {/* On mobile, チャンネル登録 and お気に入り are accessed via action buttons (floating). */}
              {menuItems.slice(2).map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className='flex flex-col items-center justify-center active:bg-gray-300 rounded-sm m-0.5'
                >
                  <div className='win-btn p-1 flex flex-col items-center w-full h-full justify-center'>
                      <span className='text-lg leading-none mb-0.5'>{item.icon}</span>
                      <span className='text-[10px] font-bold'>{item.name}</span>
                  </div>
                </Link>
              ))}
            </nav>

            {/* Mobile floating actions for Add/Favorites */}
            <MobileActions />
          </div>
        </AntdRegistry>
      </body>
    </html>
  );
}

