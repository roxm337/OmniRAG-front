"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bot, Loader2, Wifi, WifiOff } from "lucide-react";

import { useAppStore } from "@/lib/store/app-store";
import { getHealth } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/bots": "Bots",
  "/knowledge": "Knowledge Base",
  "/database": "Database",
  "/chat": "Chat",
  "/activity": "Activity",
};

export function Header() {
  const pathname = usePathname();
  const {
    apiBaseUrl,
    adminToken,
    health,
    healthError,
    setHealth,
    setHealthError,
    currentBotId,
  } = useAppStore();
  const [checking, setChecking] = useState(false);

  const title = pageTitles[pathname] ?? "OmniRAG";

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!adminToken) {
        if (!cancelled) {
          setHealth(null);
          setHealthError("Login required");
        }
        return;
      }
      setChecking(true);
      try {
        const res = await getHealth(apiBaseUrl, adminToken);
        if (!cancelled) {
          setHealth(res);
          setHealthError("");
        }
      } catch (err) {
        if (!cancelled) {
          setHealth(null);
          setHealthError(
            err instanceof Error ? err.message : "Health check failed"
          );
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl, adminToken]);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      <MobileSidebar />
      <h1 className="font-heading text-lg font-semibold tracking-tight">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        {/* Health status */}
        {checking ? (
          <Badge
            variant="secondary"
            className="gap-1.5 text-xs transition-all duration-200"
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            Checking
          </Badge>
        ) : health ? (
          <Badge
            variant="secondary"
            className="gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 transition-all duration-200"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Online
          </Badge>
        ) : (
          <Badge
            variant="destructive"
            className="gap-1.5 text-xs transition-all duration-200"
          >
            <WifiOff className="h-3 w-3" />
            {healthError ? "Offline" : "Unknown"}
          </Badge>
        )}

        {/* Active bot */}
        <Badge
          variant="outline"
          className="gap-1.5 text-xs font-mono transition-all duration-200"
        >
          <Bot className="h-3 w-3" />
          {currentBotId ? `${currentBotId.slice(0, 8)}...` : "default"}
        </Badge>
      </div>
    </header>
  );
}
