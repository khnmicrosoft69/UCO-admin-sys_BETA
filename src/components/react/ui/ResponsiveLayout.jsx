import React, { useState, useEffect, createContext, useContext } from 'react';
import { DesktopFrame } from '@/components/react/ui/DesktopViewing.jsx';
import { MobileFrame } from '@/components/react/ui/MobileViewing.jsx';
import AdminHeader from '@/components/react/interactive/AdminHeader.jsx';
import AdminSidebar from '@/components/react/interactive/AdminSidebar.jsx';

const ResponsiveLayoutContext = createContext({ isMobile: false });

export const useResponsiveLayout = () => useContext(ResponsiveLayoutContext);

export default function ResponsiveLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-slate-200"></div>;

  const SidebarComp = (props) => <AdminSidebar isMobile={isMobile} {...props} />;
  const HeaderComp = (props) => <AdminHeader isMobile={isMobile} {...props} />;

  const content = (
    <ResponsiveLayoutContext.Provider value={{ isMobile }}>
      {children}
    </ResponsiveLayoutContext.Provider>
  );

  if (isMobile) {
    return (
      <MobileFrame 
        Sidebar={SidebarComp} 
        Header={HeaderComp} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
      >
        {content}
      </MobileFrame>
    );
  }

  return (
    <DesktopFrame Sidebar={SidebarComp} Header={HeaderComp}>
      {content}
    </DesktopFrame>
  );
}
