"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Zap, 
  BookOpen, 
  FlaskConical, 
  PenTool, 
  LineChart, 
  Lock, 
  LogOut, 
  User, 
  Menu, 
  X, 
  ChevronDown 
} from "lucide-react";
import { logoutUser } from "@/actions/auth";

interface NavbarProps {
  user: {
    name?: string | null;
    role?: string | null;
    email?: string | null;
  };
  canGenerateEvaluation: boolean;
}

export function Navbar({ user, canGenerateEvaluation }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/classes");
    }
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logoutUser();
  };

  const isStudent = user.role === "student";

  const navItems = [
    {
      name: "Materi",
      href: "/materi",
      icon: BookOpen,
      locked: false,
    },
    {
      name: "Simulasi",
      href: "/simulasi",
      icon: FlaskConical,
      locked: false,
    },
    {
      name: "Asesmen",
      href: "/asesmen",
      icon: PenTool,
      locked: false,
    },
    {
      name: "Evaluasi",
      href: "/evaluasi",
      icon: LineChart,
      locked: isStudent && !canGenerateEvaluation,
    },
  ];

  return (
    <nav className="w-full bg-bg-panel border-b border-grid-line backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center text-white group">
              <Zap className="w-6 h-6 text-trace-teal mr-2 shadow-[0_0_10px_rgba(79,209,197,0.4)] group-hover:scale-110 transition-transform" />
              <span className="font-space-grotesk font-bold text-xl tracking-tight">
                Kelistrikan<span className="text-trace-teal">Pro</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium font-space-grotesk transition-all relative ${
                isActive("/dashboard")
                  ? "text-white font-bold"
                  : "text-text-muted hover:text-white"
              }`}
            >
              <span className={`trace-under ${isActive("/dashboard") ? "trace-under-active" : ""}`}>
                {isStudent ? "Kelas Saya" : "Dashboard Kelas"}
              </span>
            </Link>

            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.name === "Evaluasi" && !isStudent) return null; // Only students have evaluation

              if (item.locked) {
                return (
                  <div key={item.name} className="relative group/tooltip px-3 py-2 flex items-center text-text-muted cursor-not-allowed">
                    <Icon className="w-4 h-4 mr-1.5 opacity-60" />
                    <span className="text-sm font-medium font-space-grotesk flex items-center gap-1">
                      {item.name}
                      <Lock className="w-3.5 h-3.5 text-resistor-amber animate-pulse" />
                    </span>
                    
                    {/* Tooltip */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 p-2 bg-black border border-resistor-amber/50 text-resistor-amber text-xs rounded shadow-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity z-50 text-center font-inter leading-relaxed">
                      Selesaikan 1 asesmen untuk membuka fitur ini
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium font-space-grotesk transition-all relative flex items-center ${
                    isActive(item.href)
                      ? "text-white font-bold"
                      : "text-text-muted hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1.5" />
                  <span className={`trace-under ${isActive(item.href) ? "trace-under-active" : ""}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* User Account Dropdown */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-white/5 border border-grid-line px-3 py-1.5 rounded-full text-white hover:border-trace-teal/50 transition-colors focus:outline-none focus:ring-2 focus:ring-trace-teal"
              >
                <div className="w-7 h-7 rounded-full bg-trace-teal/20 border border-trace-teal/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-trace-teal" />
                </div>
                <span className="text-sm font-medium font-inter max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#111e2b] border border-grid-line shadow-2xl py-2 z-20 animate-fade-in font-inter">
                    <div className="px-4 py-2 border-b border-grid-line">
                      <p className="text-xs text-text-muted font-jetbrains-mono">Login Sebagai</p>
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-trace-teal font-jetbrains-mono uppercase mt-0.5">{user.role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Keluar Sesi
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-text-muted hover:text-white hover:bg-white/5 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-grid-line bg-[#0E1A24]/95 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded-md text-base font-medium font-space-grotesk ${
                isActive("/dashboard") ? "text-trace-teal bg-white/5" : "text-text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              {isStudent ? "Kelas Saya" : "Dashboard Kelas"}
            </Link>

            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.name === "Evaluasi" && !isStudent) return null;

              if (item.locked) {
                return (
                  <div key={item.name} className="px-3 py-2.5 text-base font-medium text-text-muted/50 flex items-center justify-between cursor-not-allowed">
                    <span className="flex items-center font-space-grotesk">
                      <Icon className="w-5 h-5 mr-2 opacity-50" />
                      {item.name}
                    </span>
                    <span className="text-[10px] text-resistor-amber border border-resistor-amber/35 px-2 py-0.5 rounded font-jetbrains-mono flex items-center gap-1">
                      Kuis Terkunci <Lock className="w-3 h-3" />
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2.5 rounded-md text-base font-medium font-space-grotesk flex items-center ${
                    isActive(item.href)
                      ? "text-trace-teal bg-white/5"
                      : "text-text-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          <div className="pt-4 pb-3 border-t border-grid-line px-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-trace-teal/20 flex items-center justify-center">
                <User className="w-4 h-4 text-trace-teal" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white font-inter">{user.name}</p>
                <p className="text-xs text-text-muted font-jetbrains-mono uppercase">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left py-2 text-sm text-red-400 flex items-center hover:text-red-300 font-inter"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar Sesi
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
