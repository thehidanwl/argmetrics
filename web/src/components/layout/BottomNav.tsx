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
  { href: '/', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
  { href: '/exchange', label: 'Cambio', icon: <DollarSign className="w-5 h-5" /> },
  { href: '/metrics', label: 'Métricas', icon: <BarChart3 className="w-5 h-5" /> },
  { href: '/settings', label: 'Ajustes', icon: <Settings className="w-5 h-5" /> },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[var(--border-default)]">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center h-16 px-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  flex flex-col items-center justify-center gap-1 px-4 py-1.5 rounded-xl
                  transition-all duration-300 min-w-[64px] relative
                  ${isActive 
                    ? 'text-[#818cf8]' 
                    : 'text-[#52525a] hover:text-[#a1a1aa] hover:bg-[var(--bg-tertiary)]/50'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-full shadow-lg shadow-purple-500/50" />
                )}
                
                <div className={`
                  p-1.5 rounded-lg transition-all duration-300
                  ${isActive 
                    ? 'bg-[var(--primary-500)]/15 shadow-lg shadow-purple-500/20' 
                    : ''
                  }
                `}>
                  {tab.icon}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-[#818cf8]' : ''}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Safe area padding for mobile */}
      <div 
        className="bg-[var(--bg-primary)]/90" 
        style={{ height: 'env(safe-area-inset-bottom)', minHeight: '6px' }} 
      />
    </nav>
  );
}
