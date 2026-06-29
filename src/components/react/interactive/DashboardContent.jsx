import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { DesktopDashboardWrapper } from "@/components/react/ui/DesktopViewing.jsx";
import { MobileDashboardWrapper } from "@/components/react/ui/MobileViewing.jsx";
import SearchBar from "@/components/react/ui/SearchBar.jsx";
import TabList from "@/components/react/ui/TabList.jsx";
import { useResponsiveLayout } from "@/components/react/ui/ResponsiveLayout.jsx";

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

export default function DashboardContent({
  officeName: initialOfficeName = null,
}) {
  const { isMobile } = useResponsiveLayout();
  const DashboardWrapper = isMobile
    ? MobileDashboardWrapper
    : DesktopDashboardWrapper;

  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    inProcess: 0,
    completed: 0,
    rejected: 0,
  });
  const [submissions, setSubmissions] = useState([]);
  const [officeName, setOfficeName] = useState(initialOfficeName);
  const [loading, setLoading] = useState(true);
  const [velocityData, setVelocityData] = useState(new Array(12).fill(0));
  const [requestTypeData, setRequestTypeData] = useState({
    labels: [],
    series: [],
  });
  const [serviceTypeData, setServiceTypeData] = useState({
    labels: [],
    series: [],
  });
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [previewStatus, setPreviewStatus] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const chartColors = [
    "#7595D6",
    "#A4CFFF",
    "#0A1C5C",
    "#1E3275",
    "#63AFFF",
    "#BCD8FF",
    "#05103B",
  ];

  useEffect(() => {
    if (!officeName && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const nameFromUrl = params.get("office") || params.get("name");
      if (nameFromUrl) {
        setOfficeName(nameFromUrl);
      }
    }
  }, [initialOfficeName]);

  useEffect(() => {
    setLoading(true);
    const query = officeName ? `?office=${encodeURIComponent(officeName)}` : "";

    Promise.all([
      fetch(`/api/submissions${query}`).then((res) => res.json()),
      fetch(`/api/metrics${query}`).then((res) => res.json()),
    ])
      .then(([submissionsData, metricsData]) => {
        const sortedData = [...submissionsData].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setSubmissions(sortedData);
        setMetrics(metricsData.metrics);
        const newVelocity = new Array(12).fill(0);
        metricsData.velocity.forEach(
          (v) => (newVelocity[v.month - 1] = v.count),
        );
        setVelocityData(newVelocity);

        const normalizeService = (service) => {
          const s = service?.toUpperCase();
          if (s?.includes("POSTING BY OFFICIAL ADZU SOCIAL MEDIA ACCOUNTS"))
            return "POSTING BY OFFICIAL ADZU SOCIAL MEDIA ACCOUNTS (TEXT, PHOTOS,AND VIDEOS)";
          if (s?.includes("LAYOUT/DESIGN AND POSTING OF GRAPHICS"))
            return "LAYOUT/DESIGN AND POSTING OF GRAPHICS (SOCIAL CARDS AND INFOGRAPHICS";
          return "OTHER";
        };

        const normalizedServices = metricsData.serviceTypes.reduce(
          (acc, curr) => {
            const normalized = normalizeService(curr.service);
            acc[normalized] = (acc[normalized] || 0) + curr.count;
            return acc;
          },
          {},
        );

        setServiceTypeData({
          labels: Object.keys(normalizedServices),
          series: Object.values(normalizedServices),
        });

        setRequestTypeData({
          labels: metricsData.requestTypes.map((r) => r.request_type),
          series: metricsData.requestTypes.map((r) => r.count),
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, [officeName]);

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
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

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
    colors: velocityData.map((_, i) => {
      if (selectedMonth === null) {
        return i === new Date().getMonth() ? "#547DBE" : "#A4CFFF";
      }
      return i === selectedMonth ? "#547DBE" : "#A4CFFF";
    }),
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
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
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const category = w.globals.labels[dataPointIndex];
        const val = series[seriesIndex][dataPointIndex];
        return `
          <div class="p-4 bg-white rounded-xl shadow-lg border border-slate-100">
            <div class="text-[12px] font-black text-[#1B2559] uppercase mb-1">${category}</div>
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-[#547DBE]"></div>
              <span class="text-[11px] font-bold text-[#707EAE]">Submissions:</span>
              <span class="text-[11px] font-black text-[#1B2559]">${val} Requests</span>
            </div>
          </div>
        `;
      },
      shared: false,
      intersect: true,
    },
  };

  const getDonutOptions = (labels) => ({
    chart: { type: "donut", background: "transparent" },
    labels: labels,
    colors: chartColors,
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: false,
          },
        },
      },
    },
  });

  const renderLegend = (labels) => (
    <div className="flex flex-col gap-3">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: chartColors[i % chartColors.length] }}
          ></div>
          <span className="text-[10px] font-black text-[#1B2559] uppercase tracking-wider">
            {label}
          </span>
        </div>
      ))}
    </div>
  );

  const getHorizontalBarOptions = (labels) => ({
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
      background: "transparent",
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        barHeight: "70%",
        distributed: true,
        borderRadiusApplication: "end",
        minBarLength: 30,
      },
    },
    colors: chartColors,
    dataLabels: {
      enabled: true,
      formatter: (val) => val,
      style: { colors: ["#1B2559"], fontSize: "12px", fontWeight: "bold" },
    },
    xaxis: {
      categories: labels,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#1B2559", fontSize: "10px", fontWeight: "bold" },
        maxWidth: 250,
      },
    },
    grid: { show: false },
    legend: { show: false },
    tooltip: { theme: "light" },
  });

  const monthlyAverage = velocityData.reduce((a, b) => a + b, 0) / 12;

  const officeMatches = offices.filter((o) =>
    o.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const submissionMatches = submissions.filter(
    (s) =>
      (s.mName && s.mName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const renderSearchResults = () => {
    if (!searchQuery) return null;
    return (
      <div className="absolute top-full right-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto no-scrollbar py-2">
        {officeMatches.length > 0 && (
          <>
            <div className="px-4 py-2 text-[9px] font-black text-[#A3AED0] uppercase tracking-widest bg-[#F4F7FE]">
              Offices
            </div>
            {officeMatches.map((match) => (
              <div
                key={match}
                className="px-4 py-2.5 text-[11px] font-bold text-[#1B2559] hover:bg-[#F4F7FE] cursor-pointer transition-colors"
                onClick={() =>
                  (window.location.href = `/office/${encodeURIComponent(match)}`)
                }
              >
                {match}
              </div>
            ))}
          </>
        )}
        {submissionMatches.length > 0 && (
          <>
            <div className="px-4 py-2 text-[9px] font-black text-[#A3AED0] uppercase tracking-widest bg-[#F4F7FE] border-t border-slate-50">
              Submissions
            </div>
            {submissionMatches.map((s) => (
              <div
                key={s.id}
                className="px-4 py-2.5 text-[11px] hover:bg-[#F4F7FE] cursor-pointer flex flex-col transition-colors"
                onClick={() =>
                  (window.location.href = `/submissions/detail?id=${s.id}`)
                }
              >
                <span className="font-black text-[#1B2559] uppercase">
                  {s.mName || "Unknown Name"}{" "}
                  <span className="text-[9px] font-bold text-[#A3AED0] ml-1">
                    #{s.id}
                  </span>
                </span>
                <span className="text-[10px] text-[#707EAE]">
                  {s.email || "No email"} - {s.request_type || "Unknown type"}
                </span>
              </div>
            ))}
          </>
        )}
        {officeMatches.length === 0 && submissionMatches.length === 0 && (
          <div className="px-4 py-6 text-center text-[11px] font-bold text-[#707EAE]">
            No matches found for "{searchQuery}"
          </div>
        )}
      </div>
    );
  };

  const dashboardTabs = [
    { label: "All Responses", href: "/dashboard" },
    { label: "By Department", href: "/dashboard/departments" },
    ,
    { label: "Archived Forms", href: "/dashboard/archived-forms" },
    { label: "Generate Spreadsheet", href: "/dashboard/reports" },
  ];

  const filteredSubmissions = submissions.filter((s) => {
    if (!previewStatus || previewStatus === "All") return true;
    return (s.status || "Pending") === previewStatus;
  });

  const renderSubmissionsModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
        <div
          className="absolute inset-0 bg-[#1B2559]/40 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        ></div>
        <div className="relative w-full max-w-6xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] z-10">
          {/* Header */}
          <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-10">
            <div>
              <h3 className="text-lg font-black text-[#1B2559] uppercase tracking-wider">
                {previewStatus === "All" ? "All Submissions" : `${previewStatus} Submissions`}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Showing {filteredSubmissions.length} response{filteredSubmissions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="p-3 hover:bg-[#F4F7FE] rounded-2xl transition-all group"
            >
              <svg
                className="w-6 h-6 text-[#1B2559] group-hover:rotate-90 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Table Container */}
          <div className="flex-grow overflow-auto p-6 md:p-8 bg-[#F4F7FE]/30">
            <div className="bg-white rounded-3xl shadow-[0_18px_40px_rgba(112,144,176,0.06)] border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#F4F7FE] bg-[#F4F7FE]/50">
                    <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">
                      Requestor
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">
                      Office
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">
                      Request Type
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">
                      Service
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">
                      Date
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F7FE]">
                  {filteredSubmissions.map((s) => {
                    const status = s.status || "Pending";
                    let statusClass = "bg-[#FFF9E6] text-[#FFB800]";
                    if (status === "In-process")
                      statusClass = "bg-[#E5F1FF] text-[#0075FF]";
                    else if (status === "Completed")
                      statusClass = "bg-[#E6FFF5] text-[#05CD99]";
                    else if (status === "Rejected")
                      statusClass = "bg-[#FFE6E6] text-[#EE5D50]";

                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-[#F4F7FE]/50 transition-colors cursor-pointer"
                        onClick={() =>
                          (window.location.href = `/submissions/${s.id}`)
                        }
                      >
                        <td className="px-8 py-5 text-[10px] font-black text-[#1B2559] uppercase">
                          {s.mName}
                        </td>
                        <td className="px-8 py-5 text-[10px] font-bold text-[#707EAE]">
                          {s.office || s.office_name || "University Communications Office"}
                        </td>
                        <td className="px-8 py-5 text-[10px] font-bold text-[#707EAE] truncate max-w-[150px]">
                          {s.request_type}
                        </td>
                        <td className="px-8 py-5 text-[10px] font-bold text-[#707EAE] truncate max-w-[200px]">
                          {s.service}
                        </td>
                        <td className="px-8 py-5 text-[10px] font-bold text-[#707EAE]">
                          {new Date(s.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span
                            className={`inline-block px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${statusClass}`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredSubmissions.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-8 py-10 text-center text-[12px] font-black text-[#A3AED0] uppercase tracking-widest"
                      >
                        No submissions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardWrapper>
      {/* Search and Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 ">
        <h2 className="text-xl font-black text-[#1B2559] uppercase tracking-wider">
          Dashboard Overview
        </h2>
        <SearchBar
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchDropdown(true);
          }}
          onFocus={() => setShowSearchDropdown(true)}
          onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
        >
          {showSearchDropdown && renderSearchResults()}
        </SearchBar>
      </div>

      {/* Tabs Section */}
      <TabList tabs={dashboardTabs} currentPath={currentPath} />

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8  ">
        {[
          {
            label: "Total Responses",
            value: metrics.total,
            color: "text-[#1B2559]",
            labelColor: "text-[#A3AED0]",
            statusKey: "All",
          },
          {
            label: "Pending Review",
            value: metrics.pending,
            color: "text-[#FFB800]",
            labelColor: "text-[#FFB800]",
            statusKey: "Pending",
          },
          {
            label: "In-Progress",
            value: metrics.inProcess,
            color: "text-[#0075FF]",
            labelColor: "text-[#0075FF]",
            statusKey: "In-process",
          },
          {
            label: "Completed",
            value: metrics.completed,
            color: "text-[#05CD99]",
            labelColor: "text-[#05CD99]",
            statusKey: "Completed",
          },
          {
            label: "Rejected",
            value: metrics.rejected,
            color: "text-[#EE5D50]",
            labelColor: "text-[#EE5D50]",
            statusKey: "Rejected",
          },
        ].map((m) => (
          <div
            key={m.label}
            onClick={() => {
              setPreviewStatus(m.statusKey);
              setShowModal(true);
            }}
            className="bg-white p-6 rounded-3xl  border-slate-100  flex flex-col items-center text-center transition-all hover:scale-[1.04] active:scale-95 cursor-pointer"
          >
            <p
              className={`text-[9px] font-black uppercase tracking-[0.15em] mb-2 ${m.labelColor}`}
            >
              {m.label}
            </p>
            <p className="text-4xl font-black text-[#1B2559]">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Velocity Chart Section */}
      <div className="bg-white p-8 rounded-[30px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow mb-8  ">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-black text-[#1B2559]">
            Form Submission Velocity
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mb-12">
          {[
            "All",
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ].map((month, i) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(i === 0 ? null : i - 1)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${(selectedMonth === null && i === 0) || selectedMonth === i - 1 ? "bg-[#547DBE] text-white shadow-lg shadow-[#547DBE]/30" : "bg-[#F4F7FE] text-[#707EAE] hover:bg-[#E2E8F0]"}`}
            >
              {month}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-3 flex flex-col gap-2 md:pl-8">
            <p className="text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">
              Avg. / Month
            </p>
            <p className="text-5xl font-black text-[#1B2559] leading-none">
              {monthlyAverage.toFixed(1)}
            </p>
          </div>
          <div className="lg:col-span-9">
            <Chart
              options={barChartOptions}
              series={[{ name: "Submissions", data: velocityData }]}
              type="bar"
              height={280}
            />
          </div>
        </div>
      </div>

      {/* Categorical Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Bar Chart for Request Types */}
        <div className="bg-white p-8 rounded-[30px] shadow-[0_18px_40px_rgba(112,144,176,0.12)]">
          <h2 className="text-lg font-black text-[#1B2559] pb-6 border-b border-[#F4F7FE] mb-6">
            Type of Request
          </h2>
          <div className="flex items-center justify-center">
            <Chart
              options={getHorizontalBarOptions(requestTypeData.labels)}
              series={[{ name: "Count", data: requestTypeData.series }]}
              type="bar"
              width="100%"
              height={350}
            />
          </div>
        </div>

        {/* Donut Chart for Service Type Breakdown */}
        <div className="bg-white p-8 rounded-[30px] shadow-[0_18px_40px_rgba(112,144,176,0.12)]">
          <h2 className="text-lg font-black text-[#1B2559] pb-6 border-b border-[#F4F7FE] mb-6">
            Service Type Breakdown
          </h2>
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="h-[250px] w-full flex items-center justify-center">
              <Chart
                options={getDonutOptions(serviceTypeData.labels)}
                series={serviceTypeData.series}
                type="donut"
                height="100%"
              />
            </div>
            <div className="w-full">{renderLegend(serviceTypeData.labels)}</div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[30px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] overflow-hidden">
        <div className="p-8 pb-4">
          <h2 className="text-lg font-black text-[#1B2559]">
            Form Responses Box
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#F4F7FE]">
                <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">
                  Requestor
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">
                  Email
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">
                  Office
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">
                  Request Type
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">
                  Service
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest">
                  Date
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F7FE]">
              {submissions.slice(0, 5).map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-[#F4F7FE]/50 transition-colors cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/submissions/detail?id=${s.id}`)
                  }
                >
                  <td className="px-8 py-5 text-[10px] font-black text-[#1B2559] uppercase">
                    {s.mName}
                  </td>
                  <td className="px-8 py-5 text-[10px] font-bold text-[#1B2559] lowercase">
                    {s.email}
                  </td>
                  <td className="px-8 py-5 text-[10px] font-bold text-[#707EAE]">
                    {s.office || "University Communications Office"}
                  </td>
                  <td className="px-8 py-5 text-[10px] font-bold text-[#707EAE] truncate max-w-[150px]">
                    {s.request_type}
                  </td>
                  <td className="px-8 py-5 text-[10px] font-bold text-[#707EAE] truncate max-w-[200px]">
                    {s.service}
                  </td>
                  <td className="px-8 py-5 text-[10px] font-bold text-[#707EAE]">
                    {new Date(s.created_at).toLocaleDateString()}
                    <br />
                    <span className="text-[9px] opacity-70">
                      {new Date(s.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    {(() => {
                      const status = s.status || "Pending";
                      let statusClass = "bg-[#FFF9E6] text-[#FFB800]";
                      if (status === "In-process")
                        statusClass = "bg-[#E5F1FF] text-[#0075FF]";
                      else if (status === "Completed")
                        statusClass = "bg-[#E6FFF5] text-[#05CD99]";
                      else if (status === "Rejected")
                        statusClass = "bg-[#FFE6E6] text-[#EE5D50]";
                      return (
                        <span
                          className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${statusClass}`}
                        >
                          {status}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 text-right">
          <button
            className="text-[11px] font-black text-[#1B2559] uppercase tracking-widest hover:underline transition-all"
            onClick={() => (window.location.href = "/submissions")}
          >
            View all Responses
          </button>
        </div>
      </div>
      {renderSubmissionsModal()}
    </DashboardWrapper>
  );
}
