import React from "react";

/**
 * DesktopViewing Template
 * Defines the structural parameters for desktop screens.
 */
export const DesktopFrame = ({ Sidebar, Header, children }) => (
  <div className="flex min-h-screen bg-[#FCFEFF]">
    <div className="w-64 fixed inset-y-0 left-0 z-30">
      <Sidebar />
    </div>
    <div className="pl-64 flex flex-col w-full">
      <Header />
      <main className="flex-1 p-8">{children}</main>
    </div>
  </div>
);

export const DesktopHeaderWrapper = ({ children }) => (
  <header className="flex items-center justify-between px-8 py-6 bg-white sticky top-0 z-20 font-sans">
    {children}
  </header>
);

export const DesktopSidebarWrapper = ({ children }) => (
  <aside className="w-57 bg-[#0A1C5C] font-sans text-slate-200 h-screen flex flex-col p-6 border-r border-transparent shadow-xl">
    {children}
  </aside>
);

export const DesktopDashboardWrapper = ({ children }) => (
  <div className="space-y-8 font-sans max-w-[1600px] mx-auto transition-colors duration-300">
    {children}
  </div>
);

export const DesktopDepartmentsWrapper = ({ children }) => (
  <div className="space-y-12 max-w-[1600px] mx-auto transition-colors duration-300">
    {children}
  </div>
);
