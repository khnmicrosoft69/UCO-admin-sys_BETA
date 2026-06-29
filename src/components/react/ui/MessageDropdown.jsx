import React, { useState, useEffect } from 'react';

export default function MessageDropdown({ submissionId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch messages for this submission
      fetch(`/api/messages?submissionId=${submissionId}`)
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(err => console.error('Failed to fetch messages:', err));
    }
  }, [isOpen, submissionId]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-[#547DBE] hover:text-[#1B2559] transition-all"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 p-4">
          <h3 className="text-xs font-black text-[#1B2559] uppercase tracking-wider mb-3">Messages</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {messages.length > 0 ? messages.map(m => (
                <div key={m.id} className="text-[10px] text-[#707EAE]">
                    <span className="font-bold text-[#1B2559]">{m.sender_role}:</span> {m.message}
                </div>
            )) : (
                <p className="text-[10px] text-slate-400 text-center">No messages yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
