import React, { useState, useEffect } from "react";
import { useResponsiveLayout } from "@/components/react/ui/ResponsiveLayout.jsx";
import { DesktopDashboardWrapper } from "@/components/react/ui/DesktopViewing.jsx";
import { MobileDashboardWrapper } from "@/components/react/ui/MobileViewing.jsx";
import TabList from "@/components/react/ui/TabList.jsx";
import { dashboardTabs } from "@/utils/links.jsx";
import * as XLSX from "xlsx";

const offices = [
  "Office of the President",
  "Vice President for Administration",
  "Vice President for Basic Education",
  "Vice President for Higher Education",
  "Ateneo Center for Testing",
  "Data Protection Office (DPO)",
  "Human Resource Administration and Development Office (HRADO)",
  "Lantaka Administration",
  "Physical Plant Office (PPO)",
  "Purchasing & Custodial Office (PCO)",
  "University Archives",
  "University Safety Office",
  "University Security Office (USO)",
  "Ateneo Center for Culture & the Arts (ACCA)",
  "Ateneo Center for Environment & Sustainability (ACES)",
  "Ateneo Center for Leadership and Governance (ACLG)",
  "Ateneo Learning and Teaching Excellence Center (ALTEC)",
  "Ateneo Peace Institute (API)",
  "Center for Community Extensions Services (CCES)",
  "Social Awareness and Community Service Involvement (SACSI)",
  "Social Development Office",
  "Advancement Office",
  "Alumni and Career Excellence (ACE) Office",
  "Ateneo Center for Entrepreneurship, Innovation, and Development (ACEND)",
  "Ateneo Zamboanga-Mindanao Institute (AZMI)",
  "AZUL Hub",
  "Center for Digital and Blended Learning (CDBL)",
  "Ethics Review Board (ERB)",
  "Global Paths – Internationalization (GPI) Office",
  "Innovation and Technology Support Office (ITSO)",
  "Office of Mission Integration and Leadership Development (OMILD)",
  "Projects Office",
  "Quality Assurance and Strategic Management Office (QASMO)",
  "University Communications Office (UCO)",
  "University Research Office",
  "ZamPen Innohive Fabrication Laboratory (FabLab)",
];

export default function ReportGeneratorContent() {
  const { isMobile } = useResponsiveLayout();
  const DashboardWrapper = isMobile
    ? MobileDashboardWrapper
    : DesktopDashboardWrapper;

  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  // Filter States
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: ["Pending", "In-process", "Completed", "Rejected"],
    offices: ["All"],
    includeMetadata: true,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const handleStatusToggle = (status) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  const handleOfficeChange = (e) => {
    const value = e.target.value;
    if (value === "All") {
      setFilters((prev) => ({ ...prev, offices: ["All"] }));
    } else {
      setFilters((prev) => ({
        ...prev,
        offices: prev.offices.includes("All")
          ? [value]
          : prev.offices.includes(value)
            ? prev.offices.filter((o) => o !== value)
            : [...prev.offices, value],
      }));
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/submissions");
      const data = await response.json();

      // Filter the data
      const filteredData = data.filter((s) => {
        const date = new Date(s.created_at).getTime();
        const start = filters.startDate
          ? new Date(filters.startDate).getTime()
          : 0;
        const end = filters.endDate
          ? new Date(filters.endDate).getTime()
          : Infinity;

        const statusMatch = filters.status.includes(s.status || "Pending");
        const officeMatch =
          filters.offices.includes("All") ||
          filters.offices.includes(s.office_name || s.office);
        const dateMatch = date >= start && date <= end;

        return statusMatch && officeMatch && dateMatch;
      });

      // Prepare Excel content
      const headers = [
        "ID",
        "Date",
        "Office",
        "Request Type",
        "Service",
        "Requestor",
        "Email",
        "Status",
      ];
      const rows = filteredData.map((s) => [
        s.id,
        new Date(s.created_at).toLocaleDateString(),
        s.office_name || s.office || "UCO",
        s.request_type,
        s.service,
        s.mName,
        s.email,
        s.status || "Pending",
      ]);

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

      // Set column widths to prevent ##### for dates and long text
      const wscols = [
        { wch: 10 }, // ID
        { wch: 15 }, // Date
        { wch: 40 }, // Office
        { wch: 35 }, // Request Type
        { wch: 40 }, // Service
        { wch: 25 }, // Requestor
        { wch: 30 }, // Email
        { wch: 15 }, // Status
      ];
      worksheet["!cols"] = wscols;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");

      // Trigger Download
      XLSX.writeFile(
        workbook,
        `UCO_Report_${new Date().toISOString().split("T")[0]}.xlsx`,
      );

      setLoading(false);
    } catch (error) {
      console.error("Error generating report:", error);
      setLoading(false);
    }
  };

  return (
    <DashboardWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#1B2559] to-[#46549b] uppercase tracking-wider">
          Generate Reports
        </h2>
      </div>

      <TabList tabs={dashboardTabs} currentPath={currentPath} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Filter Options */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[10px] shadow-[0_20px_50px_rgba(112,144,176,0.12)] border border-slate-50">
            <h3 className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-[#1B2559] to-[#46549b] uppercase tracking-wider mb-8">
              Configure Report Filters
            </h3>

            <div className="space-y-10">
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full bg-[#F4F7FE] border-none rounded-2xl px-5 py-4 text-xs text-[#1B2559] font-bold focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full bg-[#F4F7FE] border-none rounded-2xl px-5 py-4 text-xs text-[#1B2559] font-bold focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
              </div>

              {/* Status Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Include Status
                </label>
                <div className="flex flex-wrap gap-3">
                  {["Pending", "In-process", "Completed", "Rejected"].map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusToggle(s)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all ${filters.status.includes(s) ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 duration-300 text-white shadow-lg shadow-indigo-200" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}
                      >
                        {s.toUpperCase()}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Office Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Target Department / Office
                </label>
                <select
                  onChange={handleOfficeChange}
                  className="w-full bg-[#F4F7FE] border-none rounded-2xl px-5 py-4 text-xs text-[#1B2559] font-bold focus:ring-2 focus:ring-indigo-200 transition-all"
                >
                  <option value="All">ALL DEPARTMENTS</option>
                  {offices.map((o) => (
                    <option key={o} value={o}>
                      {o.toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2 mt-3">
                  {filters.offices.map((o) => (
                    <span
                      key={o}
                      className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-tight border border-indigo-100"
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Generate */}
        <div className="space-y-8">
          <div className="bg-[#1B2559] rounded-[40px] shadow-[0_25px_60px_rgba(27,37,89,0.3)] p-10 text-white relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 relative z-10">
              Export Summary
            </h3>

            <div className="space-y-6 relative z-10 mb-10">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-[10px] font-bold opacity-60 uppercase">
                  Format
                </span>
                <span className="text-sm font-black">CSV / Excel Ready</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-[10px] font-bold opacity-60 uppercase">
                  Status Selected
                </span>
                <span className="text-sm font-black">
                  {filters.status.length}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-[10px] font-bold opacity-60 uppercase">
                  Offices
                </span>
                <span className="text-sm font-black truncate max-w-[150px]">
                  {filters.offices.join(", ")}
                </span>
              </div>
            </div>

            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full bg-white text-[#1B2559] py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#1B2559]/20 border-t-[#1B2559] rounded-full animate-spin"></div>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              )}
              {loading ? "Processing..." : "Generate Spreadsheet"}
            </button>
          </div>

          <div className="bg-white p-8 rounded-[10px] shadow-[0_20px_50px_rgba(112,144,176,0.12)] border border-slate-50">
            <h4 className="text-[10px] font-black bg-clip-text text-transparent bg-gradient-to-r from-[#1B2559] to-[#46549b] uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              Pro Tip
            </h4>
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">
              You can open the generated .xlsx file in Microsoft Excel or Google
              Sheets for advanced data analysis and visualization.
            </p>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}
