import React, { useState, useEffect } from 'react';
import SubmissionChat from '@/components/react/interactive/SubmissionChat.jsx';

export default function SubmissionOverview() {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const viewerBase = 'http://localhost:3001';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subId = urlParams.get('id');
    setId(subId);

    if (subId) {
      fetch('/api/submissions')
        .then(res => res.json())
        .then(data => {
          const found = data.find(s => s.id.toString() === subId);
          if (found) {
            setSubmission(found);
            loadFiles(found);
          }
          setLoading(false);
        });
    }
  }, []);

  const loadFiles = (sub) => {
    const fileList = [];
    
    const parseUrl = (path, defaultName) => {
      if (!path) return null;
      if (path.startsWith('http')) {
        return { name: defaultName, url: path };
      }
      // Legacy local paths
      const parts = path.split(/[\\/]/);
      const folderIndex = parts.findIndex(p => p.includes('_20'));
      let folder, filename;
      if (folderIndex !== -1) {
         folder = parts[folderIndex]; filename = parts[folderIndex + 1];
      } else {
         folder = parts[parts.length - 2]; filename = parts[parts.length - 1];
      }
      return { 
        name: filename || defaultName, 
        url: `${viewerBase}/${filename?.endsWith('.docx') ? 'view/docx' : 'file'}/${folder}/${filename}` 
      };
    };

    if (sub.ppTemplate) fileList.push(parseUrl(sub.ppTemplate, 'Template Document'));
    if (sub.image) fileList.push(parseUrl(sub.image, 'Image'));
    if (sub.video) fileList.push(parseUrl(sub.video, 'Video'));
    if (sub.audio) fileList.push(parseUrl(sub.audio, 'Audio'));

    const validFiles = fileList.filter(Boolean);
    setFiles(validFiles);
    if (validFiles.length > 0) setActiveFile(validFiles[0]);
  };

  const updateStatus = (newStatus) => {
    if (confirm(`Update status to "${newStatus}"?`)) {
      fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })
      .then(res => res.json())
      .then(result => {
        if (result.message) {
          setSubmission({ ...submission, status: newStatus });
        }
      });
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-black uppercase text-slate-400">Loading Submission Details...</div>;
  if (!submission) return <div className="p-8 text-center text-rose-500 font-bold uppercase">Submission not found.</div>;

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Left Column: Preview and Discussion */}
      <div className="flex-[2] space-y-8">
        {/* Discussion Section (Chat) */}
        <SubmissionChat submissionId={id} senderRole="admin" />

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Document Preview</h3>
            {activeFile && <span className="text-[10px] font-bold text-indigo-600 truncate max-w-[200px]">{activeFile.name}</span>}
          </div>
          <div className="h-[600px] bg-slate-100 flex items-center justify-center">
            {activeFile ? (
              <iframe 
                src={activeFile.url}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="text-center text-slate-400">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-[10px] font-black uppercase tracking-widest">Select a file to preview</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <h3 className="text-sm font-black text-slate-900 mb-6 border-b border-slate-50 pb-4 uppercase tracking-widest">Event Context</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium italic">
            {submission.eventDetails || 'No additional details provided.'}
          </p>
        </div>
      </div>

      {/* Right Column: Meta Details and Status */}
      <div className="flex-1 space-y-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Info</h2>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
              submission.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
              submission.status === 'In-process' ? 'bg-blue-100 text-blue-700' :
              submission.status === 'Completed' ? 'bg-green-100 text-green-700' :
              'bg-rose-100 text-rose-700'
            }`}>
              {submission.status || 'Pending'}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[20px] font-black text-slate-900 leading-tight mb-4">{submission.request_type}</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Office', value: submission.office_name },
                { label: 'Requestor', value: submission.mName },
                { label: 'Contact', value: submission.nNo },
                { label: 'Social Media', value: submission.socMed },
                { label: 'Service', value: submission.service }
              ].map(item => (
                <div key={item.label} className="group">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{item.label}</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Status Management</h2>
          <div className="grid grid-cols-2 gap-2">
            {['Pending', 'In-process', 'Completed', 'Rejected'].map(status => (
              <button 
                key={status}
                onClick={() => updateStatus(status)}
                className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  submission.status === status 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Attached Assets</h2>
          <div className="space-y-2">
            {files.map(file => (
              <div key={file.name} className="flex gap-2">
                <button 
                  onClick={() => setActiveFile(file)}
                  className={`flex-1 text-left px-4 py-3 rounded-xl text-[10px] font-bold transition flex items-center justify-between ${
                    activeFile?.name === file.name 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <span>↗</span>
                </button>
                <a 
                  href={file.url}
                  download
                  className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  ↓
                </a>
              </div>
            ))}
            {files.length === 0 && <p className="text-[10px] text-slate-400 italic text-center">No files uploaded.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
