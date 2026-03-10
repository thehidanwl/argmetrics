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
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[#30363D]/50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-around items-center h-16 px-2">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl
                  transition-all duration-200 min-w-[64px]
                  ${isActive 
                    ? 'text-[#6366F1]' 
                    : 'text-[#6E7681] hover:text-[#8B949E] hover:bg-[#21262D]/50'
                  }
                `}
              >
                <div className={`
                  p-1.5 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-[#6366F1]/15 shadow-lg shadow-[#6366F1]/20' 
                    : ''
                  }
                `}>
                  {tab.icon}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-[#6366F1]' : ''}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Safe area padding for mobile */}
      <div className="h-safe-area bg-[#0D1117]/80 backdrop-blur-xl" style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  );
}
