import React from 'react';
import { DesktopSidebarWrapper } from '@/components/react/ui/DesktopViewing.jsx';
import { MobileSidebarWrapper } from '@/components/react/ui/MobileViewing.jsx';

const navItems = [
  { label: 'Dashboard Overview', href: '/dashboard' },
  { label: 'Form Submissions', href: '/submissions', badge: 14 },
  { label: 'Media Analytics', href: '/media-analytics' },
  { label: 'UCO Team Calendar', href: '/team-calendar' },
  { label: 'System Settings', href: '/settings' },
];

export default function AdminSidebar({ isMobile, onClose }) {
  const SidebarWrapper = isMobile ? MobileSidebarWrapper : DesktopSidebarWrapper;
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const [pendingCount, setPendingCount] = React.useState(0);

  React.useEffect(() => {
    fetch('/api/metrics')
      .then(res => res.json())
      .then(data => setPendingCount(data.metrics.pending))
      .catch(err => console.error('Failed to fetch pending count:', err));
  }, []);

  const handleLogout = async () => {
    const response = await fetch('/api/logout', { method: 'POST' });
    if (response.ok) {
      window.location.href = '/login';
    }
  };

  return (
    <SidebarWrapper>
      <div className="flex flex-col items-center mb-6">
        <img src="/images/uco-logo.png" alt="AdZU UCO Logo" className="w-52 h-auto object-contain " />
        <div className="mt-4 h-[1px] w-full bg-white/10"></div>
      </div>

      <nav className="flex-grow space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map(item => {
          const isActive = currentPath === item.href;
          const showBadge = item.label === 'Form Submissions' && pendingCount > 0;
          return (
            <a 
              key={item.label} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[10px] font-bold tracking-wider transition-all duration-200 ${isActive ? 'text-white bg-white/10 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <span className={`flex-grow uppercase ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
              {showBadge && (
                <span className="bg-[#EE5D50] text-white text-[9px] font-black rounded-full px-1.5 py-0.5 shadow-sm">
                  {pendingCount}
                </span>
              )}
              {isActive && !showBadge && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]"></div>}
            </a>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <button onClick={handleLogout} className="w-full text-center py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 hover:text-white uppercase tracking-widest transition-all">
          Sign Out
        </button>
      </div>
    </SidebarWrapper>
  );
}
