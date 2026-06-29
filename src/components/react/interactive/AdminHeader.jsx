import React, { useState, useEffect } from 'react';
import { DesktopHeaderWrapper } from '@/components/react/ui/DesktopViewing.jsx';
import { MobileHeaderWrapper } from '@/components/react/ui/MobileViewing.jsx';

const offices = [
  "Office of the President", "Vice President for Administration", "Vice President for Basic Education", "Vice President for Higher Education",
  "Ateneo Center for Testing", "Data Protection Office (DPO)", "Human Resource Administration and Development Office (HRADO)", "Lantaka Administration", "Physical Plant Office (PPO)", "Purchasing & Custodial Office (PCO)", "University Archives", "University Safety Office", "University Security Office (USO)",
  "Ateneo Center for Culture & the Arts (ACCA)", "Ateneo Center for Environment & Sustainability (ACES)", "Ateneo Center for Leadership and Governance (ACLG)", "Ateneo Learning and Teaching Excellence Center (ALTEC)", "Ateneo Peace Institute (API)", "Center for Community Extensions Services (CCES)", "Social Awareness and Community Service Involvement (SACSI)", "Social Development Office",
  "Advancement Office", "Alumni and Career Excellence (ACE) Office", "Ateneo Center for Entrepreneurship, Innovation, and Development (ACEND)", "Ateneo Zamboanga-Mindanao Institute (AZMI)", "AZUL Hub", "Center for Digital and Blended Learning (CDBL)", "Ethics Review Board (ERB)", "Global Paths – Internationalization (GPI) Office", "Innovation and Technology Support Office (ITSO)", "Office of Mission Integration and Leadership Development (OMILD)", "Projects Office", "Quality Assurance and Strategic Management Office (QASMO)", "University Communications Office (UCO)", "University Research Office", "ZamPen Innohive Fabrication Laboratory (FabLab)"
];

export default function AdminHeader({ isMobile, onMenuToggle }) {
  const HeaderWrapper = isMobile ? MobileHeaderWrapper : DesktopHeaderWrapper;
  const [query, setQuery] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetch('/api/submissions')
      .then(res => res.json())
      .then(data => setSubmissions(data))
      .catch(err => console.error('Failed to fetch submissions:', err));
  }, []);

  const showLoading = () => {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center';
    overlay.innerHTML = '<div class="text-white text-xl font-black animate-pulse">Loading Dashboard...</div>';
    document.body.appendChild(overlay);
  };

  const officeMatches = offices.filter(o => o.toLowerCase().includes(query.toLowerCase()));
  const submissionMatches = submissions.filter(s => 
    (s.mName && s.mName.toLowerCase().includes(query.toLowerCase())) || 
    (s.email && s.email.toLowerCase().includes(query.toLowerCase()))
  );

  const renderResults = () => {
    if (!query) return null;
    return (
      <div className={`${isMobile ? 'flex-1 overflow-y-auto' : 'absolute top-full right-0 sm:left-0 w-72 md:w-80 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto'}`}>
        {officeMatches.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-50 uppercase tracking-wider">Offices</div>
            {officeMatches.map(match => (
              <div key={match} className="px-4 py-3 md:py-2 text-sm text-slate-700 hover:bg-indigo-50 cursor-pointer active:bg-indigo-100" onClick={() => { showLoading(); window.location.href = `/office/${encodeURIComponent(match)}`; }}>
                {match}
              </div>
            ))}
          </>
        )}
        {submissionMatches.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs font-bold text-slate-400 bg-slate-50 uppercase tracking-wider border-t border-slate-100">Submissions</div>
            {submissionMatches.map(s => (
              <div key={s.id} className="px-4 py-3 md:py-2 text-sm text-slate-700 hover:bg-indigo-50 cursor-pointer flex flex-col active:bg-indigo-100" onClick={() => { showLoading(); window.location.href = `/submissions/detail?id=${s.id}`; }}>
                <span className="font-semibold">{s.mName || 'Unknown Name'} <span className="text-xs font-normal text-slate-400 ml-1">#{s.id}</span></span>
                <span className="text-xs text-slate-500">{s.email || 'No email'} - {s.request_type || 'Unknown type'}</span>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <HeaderWrapper>
      <div className="flex items-center gap-3 md:gap-4">
        {isMobile && (
          <button onClick={onMenuToggle} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Toggle Menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="text-xl md:text-3xl font-bold text-[#1B2559] tracking-tight">University Communications Office</h1>
          <p className="text-[10px] md:text-sm font-medium text-[#707EAE] tracking-wide mt-0.5">MRTS: Media Request Tracking System</p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <div className="relative group hidden lg:block">
          <div className="flex items-center gap-4  px-5 py-2.5 ">
            <div className="flex flex-col items-end">
              <p className="text-[11px] font-black text-[#1B2559] uppercase tracking-wider">Khan Fernandez</p>
              <p className="text-[9px] font-bold text-[#707EAE] lowercase">admin@adzu.edu.ph</p>
            </div>
            <div className="w-10 h-10 bg-[#E2E8F0] rounded-full flex items-center justify-center text-[#718096] text-xs font-black border-2 border-white shadow-sm overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Khan+Fernandez&background=E2E8F0&color=718096" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {isMobile && (
          <button onClick={() => setShowSearchOverlay(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        )}
      </div>

      {isMobile && showSearchOverlay && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setShowSearchOverlay(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative flex-1">
              <input 
                type="search" 
                placeholder="Search offices, names..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl text-base text-slate-700 focus:ring-2 focus:ring-indigo-400 transition-all" 
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          {renderResults()}
        </div>
      )}
    </HeaderWrapper>
  );
}
