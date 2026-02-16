"use client";

import { useProfile } from "@/hooks/use-profile";

export function Header() {
  const { data: profile } = useProfile();

  return (
    <header className="sticky top-0 z-30 border-b border-navy-800 bg-navy-950/95 backdrop-blur-sm px-4 py-3">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        <h1 className="text-lg font-bold text-amber-500">HomeBound</h1>
        {profile && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-sm font-semibold text-amber-500">
            {(profile.display_name || profile.email)[0].toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
