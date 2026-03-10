'use client';

import { Home, DollarSign, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TabItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabItem[] = [
  { href: '/', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
  { href: '/exchange', label: 'Cambio', icon: <DollarSign className="w-5 h-5" /> },
  { href: '/metrics', label: 'Métricas', icon: <BarChart3 className="w-5 h-5" /> },
  { href: '/settings', label: 'Ajustes', icon: <Settings className="w-5 h-5" /> },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--border-default)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive 
                  ? 'text-[var(--primary-500)]' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {tab.icon}
              <span className="text-[10px]">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
