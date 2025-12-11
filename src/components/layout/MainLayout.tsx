import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen } = useStore();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className={clsx(
        'flex-1 flex flex-col transition-all duration-300',
        sidebarOpen ? 'ml-0' : 'ml-0'
      )}>
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
