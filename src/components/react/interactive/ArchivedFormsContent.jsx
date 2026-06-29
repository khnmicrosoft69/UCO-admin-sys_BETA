// src/components/pages/ArchivedFormsContent.jsx
import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { useResponsiveLayout } from "@/components/react/ui/ResponsiveLayout.jsx";
import { DesktopDashboardWrapper } from "@/components/react/ui/DesktopViewing.jsx";
import { MobileDashboardWrapper } from "@/components/react/ui/MobileViewing.jsx";
import TabList from "@/components/react/ui/TabList.jsx";
import { dashboardTabs } from "@/utils/links.jsx";

export default function ArchivedFormsContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [viewMode, setViewMode] = useState("analytics");
  const [timeFilter, setTimeFilter] = useState("MoM");

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const [analyticsData, setAnalyticsData] = useState({
    totalLifetime: 0,
    avgMonthlyBaseline: 0,
    timeline: [],
    heatmapMatrix: Array.from({ length: 12 }, () => [0, 0, 0, 0]),
  });
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: "created_at", direction: "desc" });

  const { isMobile } = useResponsiveLayout();
  const DashboardWrapper = isMobile ? MobileDashboardWrapper : DesktopDashboardWrapper;

  const years = [2023, 2024, 2025, 2026];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    fetch("/api/analytics?mode=summary")
      .then((res) => res.json())
      .then((data) => { setAnalyticsData(data); setLoading(false); })
      .catch((err) => { console.error("Failed fetching summaries:", err); setLoading(false); });
  }, []);

  useEffect(() => {
    let url = "/api/analytics?mode=list";
    if (selectedYear) url += `&year=${selectedYear}`;
    if (selectedMonth) url += `&month=${selectedMonth}`;
    if (!selectedYear && !selectedMonth) url = "/api/submissions";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const sorted = Array.isArray(data)
          ? data.filter((s) => s.status === "Completed" || s.status === "Rejected")
          : [];
        setSubmissions(sorted);
      })
      .catch((err) => console.error("Drill-down failure:", err));
  }, [viewMode, selectedYear, selectedMonth]);

  const handleHeatmapClick = (year, monthIdx) => {
    setSelectedYear(year);
    setSelectedMonth(monthIdx + 1);
    setViewMode("list");
  };

  const getFileType = (s) => {
    const file = s.ppTemplate || s.image || s.video || s.audio;
    if (!file) return "NONE";
    return file.split(".").pop().toUpperCase() || "FILE";
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <span className="ml-1 opacity-20">↕</span>;
    return <span className="ml-1 text-[#547DBE]">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>;
  };

  const sortedSubmissions = [...submissions].sort((a, b) => {
    let aVal, bVal;
    if (sortConfig.key === "filetype") { aVal = getFileType(a); bVal = getFileType(b); }
    else if (sortConfig.key === "requestor") { aVal = (a.mName || "").toLowerCase(); bVal = (b.mName || "").toLowerCase(); }
    else if (sortConfig.key === "date") { aVal = new Date(a.created_at).getTime(); bVal = new Date(b.created_at).getTime(); }
    else { aVal = (a[sortConfig.key] || "").toString().toLowerCase(); bVal = (b[sortConfig.key] || "").toString().toLowerCase(); }
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const submissionMatches = sortedSubmissions.filter(
    (s) =>
      (s.mName && s.mName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.request_type && s.request_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.service && s.service.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ((s.office_name || s.office) && (s.office_name || s.office).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.status && s.status.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getChartData = () => {
    if (timeFilter === "MoM") {
      return {
        categories: analyticsData.timeline.map((t) => t.label),
        series: [{ name: "Submissions", data: analyticsData.timeline.map((t) => t.count) }],
      };
    } else {
      const annualMap = {};
      analyticsData.timeline.forEach((t) => { annualMap[t.yr] = (annualMap[t.yr] || 0) + t.count; });
      return {
        categories: Object.keys(annualMap),
        series: [{ name: "Submissions", data: Object.values(annualMap) }],
      };
    }
  };

  const chartConfig = getChartData();

  const lineChartOptions = {
    chart: { type: "line", background: "transparent", toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
    colors: ["#547DBE"],
    stroke: { curve: "smooth", width: 2.5 },
    markers: { size: 4, colors: ["#547DBE"], strokeColors: "#fff", strokeWidth: 2 },
    grid: { borderColor: "#F4F7FE", strokeDashArray: 4 },
    xaxis: {
      categories: chartConfig.categories,
      labels: { style: { colors: "#A3AED0", fontSize: "10px", fontWeight: "bold" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "#A3AED0", fontSize: "10px" }, formatter: (v) => v.toLocaleString() } },
    annotations: {
      yaxis: [{ y: analyticsData.avgMonthlyBaseline, borderColor: "#E0E7FF", strokeDashArray: 4, label: { text: "Avg Baseline", style: { color: "#547DBE", fontSize: "10px", fontWeight: "bold" } } }],
    },
    tooltip: { theme: "light" },
  };

  const getHeatmapColor = (val) => {
    if (val === 0) return "bg-[#F4F7FE] text-[#A3AED0]";
    if (val < 100) return "bg-[#EBF3FF] text-[#547DBE] hover:bg-[#D6E8FF] cursor-pointer";
    if (val < 300) return "bg-[#BFDBFE] text-[#1E40AF] hover:bg-[#93C5FD] cursor-pointer";
    if (val < 600) return "bg-[#60A5FA] text-white hover:bg-[#3B82F6] cursor-pointer";
    return "bg-[#1B2559] text-white hover:bg-[#0f1742] cursor-pointer";
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 bg-slate-100 rounded-2xl w-full"></div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-72 bg-slate-100 rounded-[30px]"></div>
          <div className="space-y-4">
            <div className="h-32 bg-slate-100 rounded-[30px]"></div>
            <div className="h-32 bg-slate-100 rounded-[30px]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardWrapper>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-[#1B2559] uppercase tracking-wider">Archived Forms</h2>
          <p className="text-[11px] font-black text-[#A3AED0] uppercase tracking-widest mt-1">
            Completed & Rejected Submissions
          </p>
        </div>
        {/* View Toggle */}
        <div className="flex gap-2 bg-[#F4F7FE] p-1 rounded-xl">
          <button
            onClick={() => setViewMode("list")}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${viewMode === "list" ? "bg-white shadow-sm text-[#547DBE]" : "text-[#8F9BBA] hover:text-[#547DBE]"}`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode("analytics")}
            className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${viewMode === "analytics" ? "bg-white shadow-sm text-[#547DBE]" : "text-[#8F9BBA] hover:text-[#547DBE]"}`}
          >
            Analytics View
          </button>
        </div>
      </div>

      <TabList tabs={dashboardTabs} currentPath={currentPath} />

      {viewMode === "analytics" ? (
        <div className="mt-6 space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-[24px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] p-8 flex flex-col justify-between">
              <p className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest mb-3">Total Lifetime Archived</p>
              <p className="text-5xl font-black text-[#1B2559]">{analyticsData.totalLifetime.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-[#A3AED0] mt-2 uppercase">Completed &amp; Rejected submissions</p>
            </div>
            <div className="bg-white rounded-[24px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] p-8 flex flex-col justify-between">
              <p className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest mb-3">Average Monthly Baseline</p>
              <p className="text-5xl font-black text-[#547DBE]">{analyticsData.avgMonthlyBaseline.toLocaleString()}<span className="text-xl font-bold text-[#A3AED0] ml-2">/ mo</span></p>
              <p className="text-[10px] font-bold text-[#A3AED0] mt-2 uppercase">Active operational baseline</p>
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white rounded-[30px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-black text-[#1B2559] uppercase tracking-wide">Historical Form Trends</h3>
              <div className="flex gap-2 bg-[#F4F7FE] p-1 rounded-xl w-fit">
                <button
                  onClick={() => setTimeFilter("MoM")}
                  className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${timeFilter === "MoM" ? "bg-white shadow-sm text-[#547DBE]" : "text-[#8F9BBA]"}`}
                >
                  Month-over-Month
                </button>
                <button
                  onClick={() => setTimeFilter("YoY")}
                  className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${timeFilter === "YoY" ? "bg-white shadow-sm text-[#547DBE]" : "text-[#8F9BBA]"}`}
                >
                  Year-over-Year
                </button>
              </div>
            </div>
            <Chart options={lineChartOptions} series={chartConfig.series} type="line" height={280} />
          </div>

          {/* Heatmap */}
          <div className="bg-white rounded-[30px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] p-8 overflow-x-auto">
            <h3 className="text-lg font-black text-[#1B2559] uppercase tracking-wide mb-1">Cyclical / Seasonal Heatmap</h3>
            <p className="text-[10px] font-bold text-[#A3AED0] uppercase tracking-widest mb-6">
              💡 Click any populated cell to drill down into that period's archived entries
            </p>
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest text-left pl-4 border-b border-[#F4F7FE]"></th>
                  {years.map((y) => (
                    <th key={y} className="p-3 text-[10px] font-black text-[#1B2559] uppercase tracking-widest border-b border-[#F4F7FE]">
                      {y === 2026 ? "2026 YTD" : y}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {months.map((m, mIdx) => (
                  <tr key={m}>
                    <td className="p-3 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest text-left pl-4 border-b border-[#F4F7FE]">{m}</td>
                    {years.map((y, yIdx) => {
                      const val = analyticsData.heatmapMatrix[mIdx][yIdx] || 0;
                      return (
                        <td
                          key={y}
                          onClick={() => val > 0 && handleHeatmapClick(y, mIdx)}
                          className={`p-3 text-[11px] font-black border-b border-[#F4F7FE] rounded-lg transition-all select-none ${getHeatmapColor(val)}`}
                        >
                          {val === 0 ? "—" : val.toLocaleString()}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-[30px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] overflow-hidden mt-6">
          <div className="p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-[#1B2559]">Archived Responses Box</h2>
              <p className="text-[11px] font-black text-[#A3AED0] uppercase tracking-widest mt-1">
                Total: <span className="text-[#1B2559]">{submissionMatches.length}</span>
              </p>
              {(selectedYear || selectedMonth) && (
                <div className="flex gap-2 items-center mt-2">
                  <span className="text-[10px] bg-[#EBF3FF] text-[#547DBE] px-3 py-1 rounded-lg font-black uppercase tracking-wider">
                    Filtered: {selectedMonth ? months[selectedMonth - 1] : ""} {selectedYear}
                  </span>
                  <button
                    onClick={() => { setSelectedYear(""); setSelectedMonth(""); }}
                    className="text-[10px] font-black text-[#EE5D50] hover:underline uppercase"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
            {/* Search */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Filter archives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-[#F4F7FE] border-none rounded-xl text-xs text-[#1B2559] placeholder-[#8F9BBA] focus:outline-none focus:ring-2 focus:ring-[#547DBE]/20 transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F9BBA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F4F7FE]">
                  {[
                    { label: "Office", key: "office_name" },
                    { label: "Request Type", key: "request_type" },
                    { label: "Service", key: "service" },
                    { label: "Requestor", key: "requestor" },
                    { label: "Email", key: "email" },
                    { label: "Date", key: "date" },
                    { label: "Status", key: "status" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest cursor-pointer hover:text-[#547DBE] transition-colors"
                    >
                      {col.label} <SortIcon column={col.key} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F7FE]">
                {submissionMatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-12 text-center text-[11px] font-bold text-[#A3AED0] uppercase tracking-widest">
                      No archived submissions found
                    </td>
                  </tr>
                ) : (
                  submissionMatches.map((s) => {
                    const status = s.status || "Pending";
                    let statusClass = "bg-[#FFF9E6] text-[#FFB800]";
                    if (status === "Completed") statusClass = "bg-[#E6FFF5] text-[#05CD99]";
                    else if (status === "Rejected") statusClass = "bg-[#FFE6E6] text-[#EE5D50]";

                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-[#F4F7FE]/50 transition-colors cursor-pointer"
                        onClick={() => (window.location.href = `/submissions/detail?id=${s.id}`)}
                      >
                        <td className="px-8 py-5 text-[10px] font-bold text-[#1B2559]">{s.office_name || "University Communications Office"}</td>
                        <td className="px-8 py-5 text-[10px] font-bold text-[#1B2559] truncate max-w-[150px]">{s.request_type}</td>
                        <td className="px-8 py-5 text-[10px] font-bold text-[#1B2559] truncate max-w-[150px]">{s.service}</td>
                        <td className="px-8 py-5 text-[10px] font-black text-[#707EAE] uppercase">{s.mName}</td>
                        <td className="px-8 py-5 text-[10px] font-bold text-[#707EAE] lowercase">{s.email}</td>
                        <td className="px-8 py-5 text-[10px] font-bold text-[#707EAE]">
                          {new Date(s.created_at).toLocaleDateString()}
                          <br />
                          <span className="text-[9px] opacity-70">
                            {new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className={`inline-block whitespace-nowrap px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${statusClass}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardWrapper>
  );
}