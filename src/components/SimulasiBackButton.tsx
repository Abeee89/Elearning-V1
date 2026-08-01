"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function SimulasiBackButton() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const classId = searchParams.get("classId");

  // Determine back destination
  let href = "/dashboard";
  if (pathname === "/simulasi" || pathname === "/simulasi/") {
    if (classId) {
      href = `/dashboard/classes/${classId}`;
    }
  } else {
    // We are on a sub-simulation page like /simulasi/hukum-ohm
    href = classId ? `/simulasi?classId=${classId}` : "/simulasi";
  }

  return (
    <Link href={href} className="p-2 hover:bg-white/5 rounded-full transition-colors">
      <ChevronLeft className="w-5 h-5 text-gray-400" />
    </Link>
  );
}
