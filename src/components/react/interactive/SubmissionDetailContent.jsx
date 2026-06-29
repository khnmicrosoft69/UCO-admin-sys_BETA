import React, { useState, useEffect } from "react";
import MessageDropdown from "@/components/react/ui/MessageDropdown.jsx";

export default function SubmissionDetailContent({ id: propId }) {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState(propId ?? null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const viewerBase = "http://localhost:3001";

  useEffect(() => {
    // Prefer the prop id (from [id].astro route param); fall back to ?id= query string
    const resolvedId = propId ?? new URLSearchParams(window.location.search).get("id");
    if (resolvedId) {
      setId(resolvedId);
      fetch("/api/submissions")
        .then((res) => res.json())
        .then((data) => {
          const found = data.find((s) => s.id.toString() === resolvedId);
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
      fetch("/api/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.message) {
            setSubmission({ ...submission, status: newStatus });
          }
        });
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center animate-pulse font-black uppercase text-slate-400">
        Loading Submission Details...
      </div>
    );
  if (!submission)
    return (
      <div className="p-8 text-center text-rose-500 font-bold uppercase">
        Submission not found.
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Office Name Header */}
      <div className="bg-white px-8 py-6 rounded-[30px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] flex items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-[#F4F7FE] flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-[#547DBE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black text-[#A3AED0] uppercase tracking-widest mb-0.5">Office</p>
          <h1 className="text-xl font-black text-[#1B2559] truncate">
            {submission.office_name || "University Communications Office"}
          </h1>
          <p className="text-[10px] font-bold text-[#547DBE] uppercase tracking-wider mt-0.5">
            {submission.request_type} — {submission.service}
          </p>
        </div>
        <div className="ml-auto flex-shrink-0">
          <span className={`inline-block px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider ${
            submission.status === "Completed" ? "bg-[#E6FFF5] text-[#05CD99]"
            : submission.status === "In-process" ? "bg-[#E5F1FF] text-[#0075FF]"
            : submission.status === "Rejected" ? "bg-[#FFE6E6] text-[#EE5D50]"
            : "bg-[#FFF9E6] text-[#FFB800]"
          }`}>
            {submission.status || "Pending"}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column: Preview and Context */}
      <div className="flex-[2] space-y-8">
        <div className="bg-white p-8  shadow-[0_18px_40px_rgba(112,144,176,0.12)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">
              File Preview
            </h2>
            {id && <MessageDropdown submissionId={id} />}
          </div>
          <div className="h-[850px] bg-[#F4F7FE]  flex items-center justify-center">
            {activeFile ? (
              <iframe
                src={activeFile.url}
                className="w-full h-full border-0 "
              />
            ) : (
              <p className="text-[10px] font-bold text-[#A3AED0]">
                No file selected
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-8 shadow-[0_18px_40px_rgba(112,144,176,0.12)]">
          <h2 className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest mb-4">
            Event Context
          </h2>
          <p className="text-xs font-bold text-[#1B2559] leading-relaxed">
            {submission.eventDetails || "No additional details provided."}
          </p>
        </div>
      </div>

      {/* Right Column: Status, Info, Assets */}
      <div className="flex-1 space-y-6">
        {/* Status Management */}
        <div className="bg-white p-8  shadow-[0_18px_40px_rgba(112,144,176,0.12)]">
          <h2 className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest mb-6">
            Status Management
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {["Pending", "In-process", "Completed", "Rejected"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                    submission.status === status
                      ? "bg-[#1B2559] text-white"
                      : "bg-[#F4F7FE] text-[#707EAE] hover:bg-[#E2E8F0]"
                  }`}
                >
                  {status}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Submission Details */}
        <div className="bg-white p-8 rounded-[20px] shadow-[0_18px_40px_rgba(112,144,176,0.12)]">
          <div className="flex items-center justify-between mb-6 border-b border-[#F4F7FE] pb-4">
            <h2 className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">
              Submission Details
            </h2>
            <div
              className={`w-3 h-3 rounded-full ${submission.status === "Pending" ? "bg-[#FFB800]" : "bg-[#05CD99]"}`}
            ></div>
          </div>

          <div className="space-y-5">
            {[
              { label: "Office", value: submission.office_name },
              { label: "Requestor", value: submission.mName },
              { label: "Contact", value: submission.nNo },
              { label: "Social Media", value: submission.socMed },
              { label: "Event Type", value: submission.request_type },
              { label: "Service", value: submission.service },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[9px] font-black text-[#A3AED0]  tracking-widest">
                  {item.label}
                </p>
                <p className="text-[11px] font-bold text-[#1B2559] uppercase mt-0.5">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Attached Assets */}
        <div className="bg-white p-8 shadow-[0_18px_40px_rgba(112,144,176,0.12)]">
          <h2 className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest mb-6">
            Attached Assets
          </h2>
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between gap-3 p-3 bg-[#F4F7FE] rounded-xl"
              >
                <span className="text-[10px] font-black text-[#1B2559] truncate max-w-[120px]">
                  {file.name}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveFile(file)}
                    className="text-[10px] font-black text-[#547DBE] hover:underline"
                  >
                    View
                  </button>
                  <a
                    href={file.url}
                    download
                    className="text-[10px] font-black text-[#547DBE] hover:underline"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
