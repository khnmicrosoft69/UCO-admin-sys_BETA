import React from 'react';

export default function TabList({ tabs, currentPath }) {
  return (
    <div className="flex items-center gap-8 mb-8 overflow-x-auto no-scrollbar pb-2">
      {tabs.map((tab) => {
        const isActive = currentPath === tab.href;
        return (
          <a
            key={tab.label}
            href={tab.href}
            className={`whitespace-nowrap text-xs font-bold transition-all duration-200 border-b-2 pb-2 ${isActive ? "text-[#1B2559] border-[#1B2559]" : "text-[#A3AED0] border-transparent hover:text-[#1B2559]"}`}
          >
            {tab.label}
          </a>
        );
      })}
    </div>
  );
}
