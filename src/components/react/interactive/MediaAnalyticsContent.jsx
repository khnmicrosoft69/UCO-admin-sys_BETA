import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { useResponsiveLayout } from "@/components/react/ui/ResponsiveLayout.jsx";
import { DesktopDashboardWrapper } from "@/components/react/ui/DesktopViewing.jsx";
import { MobileDashboardWrapper } from "@/components/react/ui/MobileViewing.jsx";
import TabList from "@/components/react/ui/TabList.jsx";
import { dashboardTabs } from "@/utils/links";

export default function MediaAnalyticsContent() {
  const { isMobile } = useResponsiveLayout();
  const DashboardWrapper = isMobile
    ? MobileDashboardWrapper
    : DesktopDashboardWrapper;

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  const [mediaMetrics, setMediaMetrics] = useState({
    totalFiles: 0,
    storageUsed: "0 Bytes",
    imagesCount: 0,
    videosCount: 0,
    documentsCount: 0,
    audioCount: 0,
  });

  const [uploadVelocity, setUploadVelocity] = useState(new Array(12).fill(0));

  const [fileTypeDistribution, setFileTypeDistribution] = useState({
    labels: ["Images", "Videos", "Documents", "Audio", "Others"],
    series: [0, 0, 0, 0, 0],
  });

  const [recentUploads, setRecentUploads] = useState([]);
  const [allFiles, setAllFiles] = useState([]);

  // Modal & Viewer State
  const [previewType, setPreviewType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFileForView, setSelectedFileForView] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }

    fetch("/api/media-metrics")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP Error status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Safe object checking to eliminate the Uncaught TypeError mapping problem
        if (data && data.fileTypeDistribution && data.metrics) {
          setMediaMetrics(data.metrics);
          setUploadVelocity(data.uploadVelocity || new Array(12).fill(0));
          setFileTypeDistribution(data.fileTypeDistribution);
          setRecentUploads(data.recentUploads || []);
          setAllFiles(data.allFiles || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching media metrics:", err);
        setLoading(false);
      });
  }, []);

  const chartColors = ["#7595D6", "#A4CFFF", "#0A1C5C", "#1E3275", "#63AFFF"];

  const barChartOptions = {
    chart: {
      type: "bar",
      height: 320,
      toolbar: { show: false },
      background: "transparent",
    },
    plotOptions: {
      bar: { borderRadius: 4, columnWidth: "60%", distributed: true },
    },
    colors: ["#547DBE"],
    xaxis: {
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ],
      labels: {
        style: { colors: "#A3AED0", fontSize: "10px", fontWeight: "bold" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
    grid: { show: false },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: { theme: "light" },
  };

  const donutOptions = {
    chart: { type: "donut", background: "transparent" },
    labels: fileTypeDistribution.labels,
    colors: chartColors,
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: { pie: { donut: { size: "70%" } } },
  };

  const openPreview = (type) => {
    if (type === "Total Files" || type === "Storage Used") return;
    const typeMap = {
      Images: "Image",
      Videos: "Video",
      Documents: "Document",
      Audio: "Audio",
    };
    setPreviewType(typeMap[type] || type);
    setShowModal(true);
  };

  const filteredFiles = allFiles.filter((file) => {
    if (!previewType) return true;
    return file.type === previewType;
  });

  const FileViewer = ({ file, onClose }) => {
    if (!file) return null;
    const fileUrl = file.path?.startsWith('http') ? file.path : `/api/files/${file.path}`;

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
        <div
          className="absolute inset-0 bg-[#05103B]/90 backdrop-blur-md"
          onClick={onClose}
        ></div>
        <div className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
          {/* Viewer Header */}
          <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-10">
            <div>
              <h3
                className="text-lg font-black text-[#1B2559] uppercase tracking-wider truncate max-w-[300px] md:max-w-md"
                title={file.name}
              >
                {file.name}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {file.office} • {file.formattedSize} • {file.date}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-[#F4F7FE] rounded-2xl transition-all group"
            >
              <svg
                className="w-6 h-6 text-[#1B2559] group-hover:rotate-90 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Viewer Content */}
          <div className="flex-grow overflow-auto p-4 md:p-10 flex items-center justify-center bg-[#F4F7FE]/30">
            {file.type === "Image" && (
              <img
                src={fileUrl}
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg border border-white"
              />
            )}
            {file.type === "Video" && (
              <video src={fileUrl} controls className="max-w-full max-h-full rounded-xl shadow-lg bg-black" autoPlay />
            )}
            {file.type === "Audio" && (
              <div className="bg-white p-10 rounded-[30px] shadow-xl border border-slate-100 flex flex-col items-center gap-6 w-full max-w-md">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
                <audio src={fileUrl} controls className="w-full" autoPlay />
              </div>
            )}
            {file.type === "Document" && (
              <div className="w-full h-full flex flex-col gap-6 items-center">
                <iframe src={fileUrl} className="w-full h-[60vh] rounded-xl border border-slate-200 shadow-sm" title={file.name} />
                <a
                  href={fileUrl}
                  download
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Download Original Document
                </a>
              </div>
            )}
            {file.type === "Other" && (
              <div className="bg-white p-12 rounded-[40px] shadow-xl text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.586-.897L15.414 5.515a1 1 0 00-.897-.586H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-black text-[#1B2559] uppercase mb-4">Preview not available for this file type</p>
                <a
                  href={fileUrl}
                  download
                  className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFileTable = (files, title) => (
    <div className="bg-white rounded-[30px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] overflow-hidden">
      <div className="p-8 pb-4 flex justify-between items-center">
        <h2 className="text-lg font-black text-[#1B2559] uppercase tracking-wider">{title}</h2>
        {showModal && (
          <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[#F4F7FE] rounded-full transition-colors">
            <svg className="w-5 h-5 text-[#1B2559]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="overflow-x-auto max-h-[60vh] no-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#F4F7FE] sticky top-0 bg-white z-10">
              <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">File Name</th>
              <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">Type</th>
              <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">Size</th>
              <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">Office</th>
              <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F7FE]">
            {files.map((file, idx) => (
              <tr
                key={`${file.name}-${idx}`}
                className="hover:bg-[#F4F7FE]/50 transition-colors cursor-pointer group"
                onClick={() => setSelectedFileForView(file)}
              >
                <td className="px-8 py-5 text-[11px] font-black text-[#1B2559] uppercase max-w-[300px] truncate group-hover:text-indigo-600 transition-colors" title={file.name}>
                  {file.name}
                </td>
                <td className="px-8 py-5">
                  <span
                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                      file.type === "Image"
                        ? "bg-[#E6FFF5] text-[#05CD99]"
                        : file.type === "Video"
                          ? "bg-[#E5F1FF] text-[#0075FF]"
                          : file.type === "Audio"
                            ? "bg-[#FFF9E6] text-[#FFB800]"
                            : "bg-[#F4F7FE] text-[#707EAE]"
                    }`}
                  >
                    {file.type}
                  </span>
                </td>
                <td className="px-8 py-5 text-[11px] font-bold text-[#707EAE]">{file.formattedSize}</td>
                <td className="px-8 py-5 text-[11px] font-black text-[#1B2559] uppercase">{file.office}</td>
                <td className="px-8 py-5 text-[11px] font-bold text-[#707EAE]">{file.date}</td>
              </tr>
            ))}
            {files.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-10 text-center text-[12px] font-bold text-[#A3AED0] uppercase tracking-widest">
                  No files found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-full"></div>
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <DashboardWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl font-black text-[#1B2559] uppercase tracking-wider">Media Analytics</h2>
      </div>

      <TabList tabs={dashboardTabs} currentPath={currentPath} />

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-8">
        {[
          { label: "Total Files", value: mediaMetrics.totalFiles, color: "text-[#1B2559]" },
          { label: "Storage Used", value: mediaMetrics.storageUsed, color: "text-[#0075FF]" },
          { label: "Images", value: mediaMetrics.imagesCount, color: "text-[#05CD99]" },
          { label: "Videos", value: mediaMetrics.videosCount, color: "text-[#FFB800]" },
          { label: "Documents", value: mediaMetrics.documentsCount, color: "text-[#EE5D50]" },
        ].map((m) => (
          <div
            key={m.label}
            onClick={() => openPreview(m.label)}
            className={`bg-white p-6 rounded-2xl shadow-[0_18px_40px_rgba(112,144,176,0.12)] flex flex-col items-center text-center transition-all hover:scale-[1.02] ${m.label !== "Total Files" && m.label !== "Storage Used" ? "cursor-pointer active:scale-95" : "cursor-default"}`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.15em] mb-2 text-[#A3AED0]">{m.label}</p>
            <p className={`text-3xl font-black ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[30px] shadow-[0_18px_40px_rgba(112,144,176,0.12)]">
          <h2 className="text-lg font-black text-[#1B2559] mb-6">Upload Activity</h2>
          <Chart options={barChartOptions} series={[{ name: "Uploads", data: uploadVelocity }]} type="bar" height={280} />
        </div>

        <div className="bg-white p-8 rounded-[30px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] flex flex-col">
          <h2 className="text-lg font-black text-[#1B2559] mb-6">File Type Distribution</h2>
          <div className="flex-grow flex items-center justify-center">
            <Chart options={donutOptions} series={fileTypeDistribution.series} type="donut" width="100%" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {fileTypeDistribution.labels.map((label, i) => (
              <div
                key={label}
                className="flex items-center gap-2 cursor-pointer hover:bg-[#F4F7FE] p-1 rounded-lg transition-colors"
                onClick={() => openPreview(label)}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chartColors[i % chartColors.length] }}></div>
                <span className="text-[10px] font-bold text-[#1B2559] uppercase">{label}</span>
                <span className="text-[10px] font-black text-[#707EAE] ml-auto">{fileTypeDistribution.series[i]}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {renderFileTable(recentUploads, "Recent Uploads")}

      {/* Preview Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-[#1B2559]/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-6xl animate-in fade-in zoom-in duration-200">
            {renderFileTable(filteredFiles, `All ${previewType}s`)}
          </div>
        </div>
      )}

      {/* Integrated File Viewer */}
      {selectedFileForView && <FileViewer file={selectedFileForView} onClose={() => setSelectedFileForView(null)} />}
    </DashboardWrapper>
  );
}