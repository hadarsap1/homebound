"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Home, Map, CheckSquare, Settings } from "lucide-react";

const tabs = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Home },
  { href: "/map", label: "Map", icon: Map },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-navy-800 bg-navy-950/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${
                isActive ? "text-amber-500" : "text-navy-500"
              }`}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
