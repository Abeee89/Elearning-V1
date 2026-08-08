"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Menu, BookOpen, Video, FileText, CheckCircle2 } from "lucide-react";

interface Subchapter {
  id: string;
  title: string;
  contentType: string;
  orderIndex: number;
}

interface ProgressEntry {
  subchapterId: string;
  status: string;
}

interface SubchapterSidebarProps {
  subchapters: Subchapter[];
  currentSubchapterId: string;
  studentProgress: ProgressEntry[];
  chapterId: string;
  chapterTitle?: string;
  classId?: string;
}

export function SubchapterSidebar({
  subchapters,
  currentSubchapterId,
  studentProgress,
  chapterId,
  chapterTitle,
  classId,
}: SubchapterSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getProgressStatus = (subId: string) => {
    const entry = studentProgress.find((p) => p.subchapterId === subId);
    return entry ? entry.status : "not_started";
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-trace-teal opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-trace-teal shadow-[0_0_8px_#4FD1C5]"></span>
          </span>
        );
      case "in_progress":
        return (
          <span className="relative flex h-2.5 w-2.5">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-resistor-amber shadow-[0_0_8px_#E8A33D]"></span>
          </span>
        );
      default:
        return <span className="h-2.5 w-2.5 rounded-full bg-gray-600"></span>;
    }
  };

  const getIcon = (contentType: string) => {
    switch (contentType) {
      case "video":
        return <Video className="w-4 h-4 text-text-muted shrink-0" />;
      case "pdf":
        return <FileText className="w-4 h-4 text-text-muted shrink-0" />;
      default:
        return <BookOpen className="w-4 h-4 text-text-muted shrink-0" />;
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-bg-panel border-r border-grid-line">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-grid-line flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <BookOpen className="w-5 h-5 text-trace-teal" />
          <span className="font-space-grotesk font-bold text-sm tracking-wider uppercase">Daftar Sub-Bab</span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-md hover:bg-white/5 text-text-muted hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Chapter Title block */}
      {chapterTitle && (
        <div className="px-4 py-3 bg-black/20 border-b border-grid-line">
          <p className="text-[10px] text-text-muted font-jetbrains-mono tracking-widest uppercase">Bab Utama</p>
          <p className="text-xs font-semibold text-white font-space-grotesk mt-0.5 line-clamp-2 leading-relaxed">{chapterTitle}</p>
        </div>
      )}

      {/* List of subchapters */}
      <div className="flex-grow overflow-y-auto p-2 space-y-1">
        {subchapters.map((sub) => {
          const status = getProgressStatus(sub.id);
          const isCurrent = sub.id === currentSubchapterId;

          return (
            <Link
              key={sub.id}
              href={`/materi/${chapterId}/${sub.id}${classId ? `?classId=${classId}` : ""}`}
              onClick={() => setIsMobileOpen(false)}
              className={`block w-full text-left rounded-xl p-3 relative group transition-all trace-border ${
                isCurrent
                  ? "border border-trace-teal/55 bg-trace-teal/5 font-semibold trace-border-active shadow-[0_0_15px_rgba(79,209,197,0.1)]"
                  : "border border-transparent hover:bg-white/5 hover:border-grid-line"
              }`}
            >
              {/* Highlight bar inside card */}
              <span className="trace-card-accent"></span>
              
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">{getIcon(sub.contentType)}</div>
                  <span className={`text-xs leading-relaxed transition-colors ${isCurrent ? "text-trace-teal" : "text-white/80 group-hover:text-white"}`}>
                    {sub.title}
                  </span>
                </div>
                <div className="mt-1 shrink-0">{getStatusDot(status)}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Bar */}
      <div className="md:hidden flex items-center justify-between bg-[#111e2b]/50 border-b border-grid-line p-3 mb-4 rounded-xl">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex items-center gap-2 text-xs font-medium text-trace-teal bg-trace-teal/10 px-3 py-1.5 rounded-lg border border-trace-teal/20"
        >
          <Menu className="w-3.5 h-3.5" />
          <span>Navigasi Materi</span>
        </button>
        <span className="text-[10px] text-text-muted font-jetbrains-mono uppercase">BAB {subchapters[0]?.orderIndex ?? 1}</span>
      </div>

      {/* Desktop Persistent Sidebar */}
      <div
        className={`hidden md:block transition-all duration-300 shrink-0 ${
          isCollapsed ? "w-0 overflow-hidden opacity-0" : "w-72"
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Expand Button when Collapsed */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 bg-[#111e2b] border border-y-grid-line border-r-grid-line border-l-transparent p-2 rounded-r-md text-text-muted hover:text-white z-30 shadow-lg hover:bg-trace-teal/10"
        >
          <ChevronRight className="w-4 h-4 text-trace-teal animate-pulse" />
        </button>
      )}

      {/* Mobile Backdrop and Overlay Sidebar */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          ></div>
          <div className="fixed inset-y-0 left-0 w-80 bg-bg-base z-50 md:hidden shadow-2xl animate-slide-in">
            {sidebarContent}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-3.5 right-4 p-1.5 rounded-md text-text-muted hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </>
  );
}
