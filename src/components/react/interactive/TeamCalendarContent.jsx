import React, { useState, useEffect, useCallback, useRef } from "react";
import { useResponsiveLayout } from "@/components/react/ui/ResponsiveLayout.jsx";
import { DesktopDashboardWrapper } from "@/components/react/ui/DesktopViewing.jsx";
import { MobileDashboardWrapper } from "@/components/react/ui/MobileViewing.jsx";

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const EVENT_TYPES = ["Internal","Marketing","Coverage","Production","Strategic","Digital","Other"];

const TYPE_COLORS = {
  Internal:   "bg-indigo-500",
  Marketing:  "bg-emerald-500",
  Coverage:   "bg-amber-500",
  Production: "bg-violet-500",
  Strategic:  "bg-rose-500",
  Digital:    "bg-sky-500",
  Other:      "bg-slate-500",
};

const STATUS_OPTIONS = ["Scheduled","Confirmed","In-Progress","Pending","Completed","Cancelled"];

const STATUS_STYLES = {
  Scheduled:    "bg-slate-100 text-slate-500",
  Confirmed:    "bg-indigo-50 text-indigo-600",
  "In-Progress":"bg-amber-50 text-amber-600",
  Pending:      "bg-yellow-50 text-yellow-600",
  Completed:    "bg-emerald-50 text-emerald-600",
  Cancelled:    "bg-rose-50 text-rose-500",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  date: "",
  time: "",
  end_time: "",
  type: "Internal",
  status: "Scheduled",
  color: "bg-indigo-500",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const daysInMonth   = (y, m) => new Date(y, m + 1, 0).getDate();
const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();
const daysInPrevMonth = (y, m) => new Date(y, m, 0).getDate();

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Event Modal ──────────────────────────────────────────────────────────────
function EventModal({ event, defaultDate, onClose, onSave, onDelete }) {
  const isEditing = Boolean(event?.id);
  const [form, setForm] = useState(
    event
      ? {
          title:       event.title || "",
          description: event.description || "",
          date:        event.date ? event.date.slice(0, 10) : "",
          time:        event.time || "",
          end_time:    event.end_time || "",
          type:        event.type || "Internal",
          status:      event.status || "Scheduled",
          color:       event.color || "bg-indigo-500",
        }
      : { ...EMPTY_FORM, date: defaultDate || "" }
  );
  const [saving, setSaving]   = useState(false);
  const [deleting, setDel]    = useState(false);
  const [error, setError]     = useState("");
  const overlayRef = useRef();

  // sync color when type changes
  useEffect(() => {
    setForm((f) => ({ ...f, color: TYPE_COLORS[f.type] || "bg-indigo-500" }));
  }, [form.type]);

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.date)         { setError("Date is required."); return; }
    setError("");
    setSaving(true);
    try {
      await onSave(isEditing ? { ...form, id: event.id } : form);
    } catch (e) {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this event?")) return;
    setDel(true);
    try {
      await onDelete(event.id);
    } finally {
      setDel(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn"
        style={{ animation: "modalIn 0.22s cubic-bezier(.4,0,.2,1)" }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div>
            <h3 className="text-base font-black text-[#1B2559] uppercase tracking-wider">
              {isEditing ? "Edit Event" : "New Event"}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              UCO Team Calendar
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-8 pb-8 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
          {error && (
            <div className="bg-rose-50 text-rose-600 text-[11px] font-bold px-4 py-3 rounded-xl border border-rose-100">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Team Weekly Meeting"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold text-[#1B2559] placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Brief description or notes..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[12px] text-[#1B2559] placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all resize-none"
            />
          </div>

          {/* Date + Times */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Date *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Start
              </label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                End
              </label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
              />
            </div>
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
              >
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Color Preview */}
          <div className="flex items-center gap-3 py-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Color Tag</span>
            <div className={`w-5 h-5 rounded-full ${form.color} shadow-sm`}></div>
            <span className="text-[10px] font-bold text-slate-400">{form.type}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 flex items-center justify-between gap-3">
          {isEditing ? (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              {deleting ? "Deleting…" : "Delete"}
            </button>
          ) : <div />}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-2.5 bg-gradient-to-r from-[#1B2559] to-[#3a478c] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-[#0f1742] hover:to-[#2d3978] shadow-lg shadow-indigo-900/20 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60"
            >
              {saving ? "Saving…" : isEditing ? "Update Event" : "Create Event"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Event Detail Popover ──────────────────────────────────────────────────────
function EventDetailPopover({ event, onEdit, onClose }) {
  return (
    <div className="absolute z-40 top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 animate-fadeIn"
         style={{ animation: "modalIn 0.15s ease" }}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-2 h-full min-h-[40px] rounded-full ${event.color} mr-3 flex-shrink-0`}></div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black text-[#1B2559] uppercase leading-tight">{event.title}</p>
          <span className={`inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${STATUS_STYLES[event.status] || "bg-slate-100 text-slate-500"}`}>
            {event.status}
          </span>
        </div>
        <button onClick={onClose} className="text-slate-300 hover:text-slate-500 ml-2 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      {event.description && (
        <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">{event.description}</p>
      )}
      <div className="space-y-1 text-[10px] text-slate-400 mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span className="font-bold">{formatDate(event.date)}</span>
        </div>
        {(event.time || event.end_time) && (
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span className="font-bold">
              {event.time ? event.time : ""}
              {event.end_time ? ` – ${event.end_time}` : ""}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
          <span className="font-bold">{event.type}</span>
        </div>
      </div>
      <button
        onClick={() => { onEdit(event); onClose(); }}
        className="w-full py-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
      >
        Edit Event
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TeamCalendarContent() {
  const { isMobile }  = useResponsiveLayout();
  const DashboardWrapper = isMobile ? MobileDashboardWrapper : DesktopDashboardWrapper;

  const [loading, setLoading]           = useState(true);
  const [events, setEvents]             = useState([]);
  const [currentDate, setCurrentDate]   = useState(new Date());
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery]   = useState("");

  // Modal state
  const [modalOpen, setModalOpen]       = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [defaultDate, setDefaultDate]   = useState("");

  // Popover state
  const [popover, setPopover]           = useState(null); // { event, anchor }

  // Toast
  const [toast, setToast]               = useState(null);

  // ── API helpers ────────────────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    try {
      const m = currentDate.getMonth() + 1;
      const y = currentDate.getFullYear();
      const res = await fetch(`/api/calendar/events?month=${m}&year=${y}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEvents(data);
    } catch (e) {
      console.error("Error fetching events:", e);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (form) => {
    const isEdit = Boolean(form.id);
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/calendar/events", {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error("Save failed");
    const saved = await res.json();

    if (isEdit) {
      setEvents((prev) => prev.map((e) => e.id === saved.id ? saved : e));
      showToast("Event updated successfully.");
    } else {
      setEvents((prev) => [...prev, saved]);
      showToast("Event created successfully.");
    }
    setModalOpen(false);
    setEditingEvent(null);
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/calendar/events?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setModalOpen(false);
    setEditingEvent(null);
    setPopover(null);
    showToast("Event deleted.", "info");
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // ── Derived data ───────────────────────────────────────────────────────────
  const filteredEvents = events.filter((e) => {
    const matchType  = activeFilter === "All" || e.type === activeFilter;
    const matchQuery = !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchQuery;
  });

  const upcomingEvents = [...events]
    .filter((e) => new Date(e.date + "T00:00:00") >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 8);

  const typeCounts = EVENT_TYPES.reduce((acc, t) => {
    acc[t] = events.filter((e) => e.type === t).length;
    return acc;
  }, {});

  // ── Calendar grid ──────────────────────────────────────────────────────────
  const renderCalendar = () => {
    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const total = daysInMonth(year, month);
    const start = firstDayOfMonth(year, month);
    const prevTotal = daysInPrevMonth(year, month);
    const days  = [];

    // Ghost days – prev month
    for (let i = start - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="h-32 border-b border-r border-slate-50 p-2.5 bg-slate-50/30 opacity-40">
          <span className="text-[10px] font-bold text-slate-300">{prevTotal - i}</span>
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= total; day++) {
      const dateStr  = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayEvts  = filteredEvents.filter((e) => e.date && e.date.slice(0, 10) === dateStr);
      const isToday  = new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div
          key={`day-${day}`}
          className="h-32 border-b border-r border-slate-50 p-2.5 hover:bg-indigo-50/20 group relative cursor-pointer transition-all"
          onClick={() => {
            setPopover(null);
            setDefaultDate(dateStr);
            setEditingEvent(null);
            setModalOpen(true);
          }}
        >
          <div className="flex justify-between items-start mb-1.5">
            <span className={`text-[11px] font-black transition-all ${
              isToday
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white w-6 h-6 flex items-center justify-center rounded-lg shadow-md shadow-indigo-300"
                : "text-slate-400 group-hover:text-indigo-600"
            }`}>
              {day}
            </span>
            {dayEvts.length > 1 && (
              <span className="text-[8px] font-black text-indigo-400">{dayEvts.length}</span>
            )}
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[70px] no-scrollbar">
            {dayEvts.slice(0, 3).map((evt) => (
              <div
                key={evt.id}
                className={`${evt.color} text-white text-[8px] font-black px-2 py-0.5 rounded-md truncate uppercase tracking-wider shadow-sm hover:scale-[1.03] transition-transform cursor-pointer`}
                onClick={(e) => {
                  e.stopPropagation();
                  setPopover(popover?.event?.id === evt.id ? null : { event: evt });
                }}
              >
                {evt.title}
              </div>
            ))}
            {dayEvts.length > 3 && (
              <div className="text-[8px] font-black text-slate-400 pl-1">+{dayEvts.length - 3} more</div>
            )}
          </div>

          {/* Popover */}
          {popover && popover.event && popover.event.date && popover.event.date.slice(0, 10) === dateStr && (
            <EventDetailPopover
              event={popover.event}
              onEdit={(ev) => { setEditingEvent(ev); setModalOpen(true); }}
              onClose={() => setPopover(null)}
            />
          )}
        </div>
      );
    }

    // Ghost days – next month
    const totalSlots     = start + total;
    const remainingSlots = Math.ceil(totalSlots / 7) * 7 - totalSlots;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push(
        <div key={`next-${i}`} className="h-32 border-b border-r border-slate-50 p-2.5 bg-slate-50/30 opacity-40">
          <span className="text-[10px] font-bold text-slate-300">{i}</span>
        </div>
      );
    }

    return days;
  };

  // ── Loading Skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 bg-slate-100 rounded-2xl w-full"></div>
        <div className="grid grid-cols-4 gap-8">
          <div className="col-span-3 h-[600px] bg-slate-100 rounded-[40px]"></div>
          <div className="space-y-8">
            <div className="h-[400px] bg-slate-100 rounded-[40px]"></div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <DashboardWrapper>
      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-3.5 rounded-2xl shadow-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
          toast.type === "success" ? "bg-emerald-500 text-white" :
          toast.type === "info"    ? "bg-indigo-500 text-white" :
          "bg-rose-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#1B2559] to-[#46549b] uppercase tracking-tight">
            Team Workflow Calendar
          </h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
            Coordinating UCO Media Production & Events
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events…"
              className="pl-9 pr-4 py-2.5 w-52 bg-white border border-slate-100 rounded-xl text-[11px] text-[#1B2559] placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 shadow-sm transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <button
            onClick={() => { setEditingEvent(null); setDefaultDate(""); setModalOpen(true); }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#1B2559] to-[#3a478c] text-white hover:from-[#0f1742] hover:to-[#2d3978] shadow-lg shadow-indigo-900/20 hover:-translate-y-0.5 duration-300 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            New Event
          </button>
        </div>
      </div>

      {/* ── Type filter chips ── */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["All", ...EVENT_TYPES].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
              activeFilter === f
                ? "bg-[#1B2559] text-white shadow-md shadow-indigo-900/20"
                : "bg-white text-slate-400 hover:bg-slate-50 border border-slate-100"
            }`}
          >
            {f} {f !== "All" && typeCounts[f] > 0 ? `(${typeCounts[f]})` : ""}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start mb-8">
        {/* ── Main Calendar ── */}
        <div className="xl:col-span-3 bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-[0_20px_50px_rgba(112,144,176,0.12)] p-8 border border-slate-50">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#1B2559] to-[#46549b] uppercase tracking-tighter">
                {MONTH_NAMES[currentDate.getMonth()]}{" "}
                <span className="text-slate-300">{currentDate.getFullYear()}</span>
              </h3>
              <div className="h-7 w-px bg-slate-100"></div>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
                  <svg className="w-4 h-4 text-[#1B2559]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100">
                  <svg className="w-4 h-4 text-[#1B2559]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-5 py-2 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
            >
              Today
            </button>
          </div>

          {/* Grid */}
          <div className="rounded-2xl overflow-hidden border border-slate-50 shadow-sm bg-white">
            <div className="grid grid-cols-7 bg-slate-50/50">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <div key={d} className="py-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-slate-50">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7" onClick={() => setPopover(null)}>
              {renderCalendar()}
            </div>
          </div>

          <p className="mt-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
            Click any day to add an event • Click an event to view details
          </p>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          {/* Upcoming */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-50 rounded-2xl shadow-[0_20px_50px_rgba(112,144,176,0.12)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[11px] font-black bg-clip-text text-transparent bg-gradient-to-r from-[#1B2559] to-[#46549b] uppercase tracking-wider">
                Upcoming
              </h3>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                {upcomingEvents.length} events
              </span>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <p className="text-[10px] font-bold text-slate-400">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-5">
                {upcomingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="group cursor-pointer relative pl-4"
                    onClick={() => { setEditingEvent(evt); setModalOpen(true); }}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-full ${evt.color} opacity-30 group-hover:opacity-100 transition-all`}></div>
                    <p className="text-[10px] font-black text-[#1B2559] uppercase leading-tight group-hover:text-indigo-600 transition-colors mb-1 truncate">
                      {evt.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-[9px] font-bold text-slate-400">{formatDate(evt.date)}</span>
                      {evt.time && <span className="text-[9px] font-bold text-indigo-400">{evt.time}</span>}
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${STATUS_STYLES[evt.status] || "bg-slate-100 text-slate-400"}`}>
                        {evt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Type Legend */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-50 rounded-2xl shadow-[0_20px_50px_rgba(112,144,176,0.12)] p-6">
            <h3 className="text-[11px] font-black text-[#1B2559] uppercase tracking-wider mb-4">Event Types</h3>
            <div className="space-y-2.5">
              {EVENT_TYPES.map((t) => (
                <div key={t} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${TYPE_COLORS[t]}`}></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{t}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-300">{typeCounts[t] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Activity Pulse ── */}
      <div className="bg-[#1B2559] rounded-[10px] shadow-[0_25px_60px_rgba(27,37,89,0.3)] p-8 text-white relative overflow-hidden group">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all"></div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Activity Pulse</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
          {[
            {
              label: "Total Events",
              val: events.length,
              sub: `This month`,
            },
            {
              label: "Upcoming",
              val: upcomingEvents.length,
              sub: "Pending + Scheduled",
            },
            {
              label: "Completed",
              val: events.filter((e) => e.status === "Completed").length,
              sub: "Finished events",
            },
            {
              label: "Confirmed",
              val: events.filter((e) => e.status === "Confirmed").length,
              sub: "Locked in",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-white/5 p-5 border border-white/10 hover:bg-white/10 transition-all cursor-default rounded-xl group/card"
            >
              <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider">{item.label}</span>
              <div className="text-right">
                <p className="text-2xl font-black group-hover/card:text-indigo-300 transition-colors">{item.val}</p>
                <p className="text-[8px] font-bold opacity-60 uppercase mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <EventModal
          event={editingEvent}
          defaultDate={defaultDate}
          onClose={() => { setModalOpen(false); setEditingEvent(null); }}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </DashboardWrapper>
  );
}
