import React from 'react';

export default function SearchBar({ value, onChange, onFocus, onBlur, placeholder = "search...", children }) {
  return (
    <div className="relative group">
      <input 
        type="search" 
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className="pl-6 pr-12 py-2.5 w-full md:w-80 bg-white backdrop-blur-sm border-none rounded-2xl text-sm text-[#1B2559] placeholder-[#8F9BBA] focus:outline-none focus:ring-2 focus:ring-[#547DBE]/20 transition-all shadow-sm" 
      />
      {children}
    </div>
  );
}
