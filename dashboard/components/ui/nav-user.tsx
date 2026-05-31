"use client";

import { ChevronUpIcon } from "lucide-react";

export function NavUser() {
  return (
    <div className="border-t border-border/70 p-3">
      <button
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted"
        type="button"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
          AD
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">Admin</div>
          <div className="truncate text-xs text-muted-foreground">Sentinal Admin</div>
        </div>
        <ChevronUpIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    </div>
  );
}

export default NavUser;
