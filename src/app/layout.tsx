import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import './globals.css';
import Link from 'next/link';
import ChannelsList from '../components/FavoritesList';
import MobileFooterNav from '../components/MobileFooterNav';
import { AppstoreOutlined, QuestionCircleOutlined } from '@ant-design/icons';

export const metadata: Metadata = {
  title: 'TubeCome | Retro Edition',
  description: 'Retro Style Video Community',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Menu items for desktop sidebar: 設定, チャンネル, ヘルプ
  const menuItems = [
    { name: 'チャンネル', href: '/channels', icon: <AppstoreOutlined className="text-lg" /> },
    // { name: '設定', href: '/settings', icon: '⚙️' },
    { name: 'ヘルプ', href: '/help', icon: <QuestionCircleOutlined className="text-lg" /> },
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
                    <div className='mb-2 text-center'>
                      <div className='text-xs text-gray-500 font-medium'>お気に入りチャンネル</div>
                    </div>
                    <ChannelsList />
                  </div>
              </div>

              <div className='flex-1 overflow-y-auto p-2'>
                  <div className='win-outset bg-[var(--bg-panel)] p-1'>
                      <ul className='space-y-1'>
                      {menuItems.map((item) => (
                          <li key={item.name}>
                          <Link 
                              href={item.href}
                              className='group flex items-center space-x-2 px-2 py-1.5 text-[var(--fg-primary)] hover:bg-[var(--accent-active)] hover:text-[var(--accent-active-fg)] transition-colors cursor-pointer border border-transparent hover:border-dotted hover:border-white'
                          >
                              <span className='text-lg group-hover:text-[var(--accent-active-fg)]'>{item.icon}</span>
                              <span className='font-bold group-hover:text-[var(--accent-active-fg)]'>{item.name}</span>
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

            {/* Mobile Footer Navigation (Mobile Only) */}
            <MobileFooterNav />
          </div>
        </AntdRegistry>
      </body>
    </html>
  );
}

