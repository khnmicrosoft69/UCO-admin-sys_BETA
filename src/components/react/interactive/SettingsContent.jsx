import React, { useState } from 'react';

export default function SettingsContent() {
  const [notifications, setNotifications] = useState(true);
  const [autoArchive, setAutoArchive] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  const registerAdmin = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/admin-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword }),
    });

    if (response.ok) {
      alert('Admin registered successfully');
      setNewAdminEmail('');
      setNewAdminPassword('');
    } else {
      alert('Error registering admin');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1000px] mx-auto min-h-screen transition-colors duration-300 bg-slate-50 text-slate-900">
      <div className="flex flex-col border-b border-slate-200 pb-6">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">System Settings</h1>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Manage your administrative environment</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* System Preferences */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          {/* ... existing preferences ... */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-xl">⚙️</div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest">Preferences</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Control system behavior</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-200">
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Desktop Notifications</p>
                <p className="text-[10px] text-slate-500 font-bold mt-1">Get alerted on new incoming requests</p>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-all relative ${notifications ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-200">
              <div>
                <p className="text-xs font-black uppercase tracking-widest">Auto-Archive</p>
                <p className="text-[10px] text-slate-500 font-bold mt-1">Move completed requests after 30 days</p>
              </div>
              <button 
                onClick={() => setAutoArchive(!autoArchive)}
                className={`w-12 h-6 rounded-full transition-all relative ${autoArchive ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoArchive ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </section>

        {/* Register New Admin */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-xl">👤</div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest">Register New Admin</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Create a new administrative account</p>
            </div>
          </div>
          <form onSubmit={registerAdmin} className="space-y-4">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="Admin Email"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
              required
            />
            <input
              type="password"
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm"
              required
            />
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700">
              Register Admin
            </button>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="bg-rose-50 rounded-[2.5rem] p-8 border border-rose-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-xl">⚠️</div>
            <div>
              <h2 className="text-sm font-black text-rose-900 uppercase tracking-widest">System Maintenance</h2>
              <p className="text-[10px] text-rose-500 font-bold uppercase mt-0.5">Sensitive administrative actions</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-white text-rose-600 border border-rose-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all">
              Clear System Cache
            </button>
            <button className="px-6 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200">
              Reset API Keys
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
