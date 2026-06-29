import React, { useState, useEffect } from "react";
import { useResponsiveLayout } from "@/components/react/ui/ResponsiveLayout";
import { DesktopDashboardWrapper } from "@/components/react/ui/DesktopViewing";
import { MobileDashboardWrapper } from "@/components/react/ui/MobileViewing";
import SearchBar from "@/components/react/ui/SearchBar";
import TabList from "@/components/react/ui/TabList";
import { dashboardTabs } from "@/utils/links";

export default function SubmissionsContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });

  const { isMobile } = useResponsiveLayout();
  const DashboardWrapper = isMobile
    ? MobileDashboardWrapper
    : DesktopDashboardWrapper;

  const [submissions, setSubmissions] = useState([]);
  const [total, setTotal] = useState(0);

  

  useEffect(() => {
    fetch("/api/submissions")
      .then((res) => res.json())
      .then((data) => {
        setSubmissions(data);
        setTotal(data.length);
      })
      .catch((err) => console.error("Failed to fetch submissions:", err));
  }, []);

  const getFileType = (s) => {
    const file = s.ppTemplate || s.image || s.video || s.audio;
    if (!file) return "NONE";
    const ext = file.split(".").pop().toUpperCase();
    return ext || "FILE";
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedSubmissions = [...submissions].sort((a, b) => {
    let aVal, bVal;

    if (sortConfig.key === "filetype") {
      aVal = getFileType(a);
      bVal = getFileType(b);
    } else if (sortConfig.key === "requestor") {
      aVal = (a.mName || "").toLowerCase();
      bVal = (b.mName || "").toLowerCase();
    } else if (sortConfig.key === "date") {
      aVal = new Date(a.created_at).getTime();
      bVal = new Date(b.created_at).getTime();
    } else {
      aVal = (a[sortConfig.key] || "").toString().toLowerCase();
      bVal = (b[sortConfig.key] || "").toString().toLowerCase();
    }

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const submissionMatches = sortedSubmissions.filter(
    (s) =>
      (s.mName && s.mName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.request_type &&
        s.request_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.service &&
        s.service.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ((s.office_name || s.office) &&
        (s.office_name || s.office)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (s.status &&
        s.status.toLowerCase().includes(searchQuery.toLowerCase())) ||
      getFileType(s).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column)
      return <span className="ml-1 opacity-20">↕</span>;
    return (
      <span className="ml-1 text-[#547DBE]">
        {sortConfig.direction === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const renderSearchResults = () => {
    if (!searchQuery) return null;
    return (
      <div className="absolute top-full right-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto no-scrollbar py-2">
        {submissionMatches.length > 0 ? (
          submissionMatches.map((s) => (
            <div
              key={s.id}
              className="px-4 py-2.5 text-[11px] hover:bg-[#F4F7FE] cursor-pointer flex flex-col transition-colors"
              onClick={() => (window.location.href = `/submissions/${s.id}`)}
            >
              <div className="flex justify-between items-start">
                <span className="font-black text-[#1B2559] uppercase">
                  {s.mName || "Unknown Name"}{" "}
                  <span className="text-[9px] font-bold text-[#A3AED0] ml-1">
                    #{s.id}
                  </span>
                </span>
                <span
                  className={`inline-block whitespace-nowrap text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                    s.status === "Completed"
                      ? "bg-[#E6FFF5] text-[#05CD99]"
                      : s.status === "In-process"
                        ? "bg-[#E5F1FF] text-[#0075FF]"
                        : s.status === "Rejected"
                          ? "bg-[#FFE6E6] text-[#EE5D50]"
                          : "bg-[#FFF9E6] text-[#FFB800]"
                  }`}
                >
                  {s.status || "Pending"}
                </span>
              </div>
              <span className="text-[10px] text-[#707EAE] mt-0.5">
                {s.email || "No email"}
              </span>
              <span className="text-[9px] font-bold text-[#547DBE] mt-0.5 uppercase tracking-tighter">
                {s.office_name || s.office || "UCO"} •{" "}
                {s.request_type || "Unknown"} • {s.service || "Unknown"}
              </span>
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-center text-[11px] font-bold text-[#707EAE]">
            No matches found for "{searchQuery}"
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardWrapper>
      {/* Search and Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black text-[#1B2559] uppercase tracking-wider">
            ALL SUBMISSIONS
          </h2>

          <p className="text-[15px] font-black text-[#A3AED0] uppercase tracking-widest mt-1">
            TOTAL RESPONSES:{" "}
            <span className="text-[#1B2559]">{submissionMatches.length}</span>
          </p>
        </div>
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

      {/* Table Section */}
      <div className="bg-white rounded-[30px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] overflow-hidden">
        <div className="p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-black text-[#1B2559]">
            Form Responses Box
          </h2>
          <div className="relative group w-full md:w-72">
            <input
              type="text"
              placeholder="Filter inbox..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-[#F4F7FE] border-none rounded-xl text-xs text-[#1B2559] placeholder-[#8F9BBA] focus:outline-none focus:ring-2 focus:ring-[#547DBE]/20 transition-all"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F9BBA]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#F4F7FE]">
                <th
                  className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest cursor-pointer hover:text-[#547DBE] transition-colors"
                  onClick={() => handleSort("office_name")}
                >
                  OFFICE <SortIcon column="office_name" />
                </th>
                <th
                  className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest cursor-pointer hover:text-[#547DBE] transition-colors"
                  onClick={() => handleSort("request_type")}
                >
                  REQUEST TYPE <SortIcon column="request_type" />
                </th>
                <th
                  className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest cursor-pointer hover:text-[#547DBE] transition-colors"
                  onClick={() => handleSort("service")}
                >
                  SERVICE <SortIcon column="service" />
                </th>

                <th
                  className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest cursor-pointer hover:text-[#547DBE] transition-colors"
                  onClick={() => handleSort("requestor")}
                >
                  REQUESTOR <SortIcon column="requestor" />
                </th>
                <th
                  className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest cursor-pointer hover:text-[#547DBE] transition-colors"
                  onClick={() => handleSort("email")}
                >
                  EMAIL <SortIcon column="email" />
                </th>
                <th
                  className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest cursor-pointer hover:text-[#547DBE] transition-colors"
                  onClick={() => handleSort("date")}
                >
                  DATE <SortIcon column="date" />
                </th>
                <th
                  className="px-8 py-4 text-[10px] font-black text-[#A3AED0] uppercase tracking-widest text-center cursor-pointer hover:text-[#547DBE] transition-colors"
                  onClick={() => handleSort("status")}
                >
                  STATUS <SortIcon column="status" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F7FE]">
              {submissionMatches.map((s) => {
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
                    <td className="px-8 py-5 text-[10px] font-bold text-[#1B2559]">
                      {s.office_name || "University Communications Office"}
                    </td>
                    <td className="px-8 py-5 text-[10px] font-bold text-[#1B2559] truncate max-w-[150px]">
                      {s.request_type}
                    </td>
                    <td className="px-8 py-5 text-[10px] font-bold text-[#1B2559] truncate max-w-[150px]">
                      {s.service}
                    </td>

                    <td className="px-8 py-5 text-[10px] font-black text-[#707EAE] uppercase">
                      {s.mName}
                    </td>
                    <td className="px-8 py-5 text-[10px] font-bold text-[#707EAE] lowercase">
                      {s.email}
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
                      <span
                        className={`inline-block whitespace-nowrap px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${statusClass}`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardWrapper>
  );
}
