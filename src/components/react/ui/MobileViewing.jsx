import React from 'react';

/**
 * MobileViewing Template
 * Defines the structural parameters for mobile screens.
 */
export const MobileFrame = ({ Sidebar, Header, children, isSidebarOpen, setIsSidebarOpen }) => (
  <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-x-hidden">
    {/* Sidebar Overlay */}
    {isSidebarOpen && (
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
        onClick={() => setIsSidebarOpen(false)}
      ></div>
    )}

    {/* Off-canvas Sidebar */}
    <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <Sidebar onClose={() => setIsSidebarOpen(false)} />
    </div>

    <Header onMenuToggle={() => setIsSidebarOpen(true)} />
    
    <main className="flex-1 p-4 bg-slate-200">
      {children}
    </main>
  </div>
);

export const MobileHeaderWrapper = ({ children }) => (
  <header className="flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-20 font-sans">
    {children}
  </header>
);

export const MobileSidebarWrapper = ({ children }) => (
  <aside className="w-64 bg-[#22313a] font-sans text-slate-200 h-screen flex flex-col p-4 border-r border-slate-700">
    {children}
  </aside>
);

export const MobileDashboardWrapper = ({ children }) => (
  <div className="space-y-6 font-sans transition-colors duration-300">
    {children}
  </div>
);

export const MobileDepartmentsWrapper = ({ children }) => (
  <div className="space-y-8 transition-colors duration-300">
    {children}
  </div>
);
