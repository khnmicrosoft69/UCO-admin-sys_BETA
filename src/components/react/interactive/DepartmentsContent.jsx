import React, { useState, useEffect } from "react";
import { useResponsiveLayout } from "@/components/react/ui/ResponsiveLayout.jsx";
import { DesktopDepartmentsWrapper } from "@/components/react/ui/DesktopViewing.jsx";
import { MobileDepartmentsWrapper } from "@/components/react/ui/MobileViewing.jsx";
import TabList from "@/components/react/ui/TabList.jsx";

const departmentsData = [
  {
    category: "Administrative Offices",
    offices: [
      "Office of the President",
      "Vice President for Administration",
      "Vice President for Basic Education",
      "Vice President for Higher Education",
    ],
  },
  {
    category: "Central Services",
    offices: [
      "Ateneo Center for Testing",
      "Data Protection Office (DPO)",
      "Human Resource Administration and Development Office (HRADO)",
      "Lantaka Administration",
      "Physical Plant Office (PPO)",
      "Purchasing & Custodial Office (PCO)",
      "University Archives",
      "University Safety Office",
      "University Security Office (USO)",
    ],
  },
  {
    category: "Social Development Unit",
    offices: [
      "Ateneo Center for Culture & the Arts (ACCA)",
      "Ateneo Center for Environment & Sustainability (ACES)",
      "Ateneo Center for Leadership and Governance (ACLG)",
      "Ateneo Learning and Teaching Excellence Center (ALTEC)",
      "Ateneo Peace Institute (API)",
      "Center for Community Extensions Services (CCES)",
      "Social Awareness and Community Service Involvement (SACSI)",
      "Social Development Office",
    ],
  },
  {
    category: "Institutional Offices",
    offices: [
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
    ],
  },
];

export default function DepartmentsContent() {
  const { isMobile } = useResponsiveLayout();
  const DepartmentsWrapper = isMobile
    ? MobileDepartmentsWrapper
    : DesktopDepartmentsWrapper;
  const [stats, setStats] = useState({});
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    fetch("/api/submissions")
      .then((res) => res.json())
      .then((data) => {
        const counts = {};
        data.forEach((s) => {
          counts[s.office_name] = (counts[s.office_name] || 0) + 1;
        });
        setStats(counts);
      });
  }, []);

  const dashboardTabs = [
    { label: "All Responses", href: "/dashboard" },
    { label: "By Department", href: "/dashboard/departments" },
    { label: "Archived Forms", href: "/dashboard/archived-forms" },
    { label: "Generate Spreadsheet", href: "/dashboard/reports" },
  ];

  return (
    <DepartmentsWrapper>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
            University Departments
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Submission metrics per office
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-300">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Total Registered Offices
          </span>
          <p className="text-xl font-black text-indigo-600">41</p>
        </div>
      </div>

      <TabList tabs={dashboardTabs} currentPath={currentPath} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-12">
        {departmentsData.map((cat, idx) => (
          <div
            key={idx}
            className="bg-slate-50 rounded-[2.5rem] shadow-xl shadow-slate-300/50 border border-slate-100 overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-100/50">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                {cat.category}
              </h2>
              <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
                {cat.offices.length} Units
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3 flex-grow">
              {cat.offices.map((office, oIdx) => {
                const count = stats[office] || 0;
                return (
                  <a
                    key={oIdx}
                    href={`/office/${encodeURIComponent(office)}`}
                    className="group p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <p className="text-[11px] font-black text-slate-700 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                        {office}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                        Active Requests
                      </p>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${count > 0 ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-slate-50 text-slate-300 group-hover:bg-slate-100"}`}
                    >
                      {count}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </DepartmentsWrapper>
  );
}
