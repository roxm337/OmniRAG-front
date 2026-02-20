"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Database,
  Loader2,
  RefreshCw,
  Server,
  XCircle,
} from "lucide-react";

import { useAppStore } from "@/lib/store/app-store";
import { getHealth } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function HealthCard() {
  const {
    apiBaseUrl,
    adminToken,
    health,
    healthError,
    setHealth,
    setHealthError,
    addEvent,
  } = useAppStore();
  const [checking, setChecking] = useState(false);

  async function refreshHealth() {
    if (!adminToken) {
      setHealth(null);
      setHealthError("Login required");
      addEvent("health", "Login required", "error");
      return;
    }

    setChecking(true);
    try {
      const res = await getHealth(apiBaseUrl, adminToken);
      setHealth(res);
      setHealthError("");
      addEvent(
        "health",
        `Backend online: ${res.collection} (${res.vector_size}), bots: ${res.bots}`,
        "ok"
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Health check failed";
      setHealth(null);
      setHealthError(message);
      addEvent("health", message, "error");
    } finally {
      setChecking(false);
    }
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-2">
            <Server className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          Backend Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {health ? (
            <div className="space-y-4 animate-scale-in">
              {/* Status indicator */}
              <div className="flex items-center gap-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Connected
                  </p>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
                    Backend is healthy and responding
                  </p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <Database className="h-4 w-4 text-muted-foreground mx-auto mb-1.5" />
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Collection
                  </p>
                  <p className="text-sm font-semibold truncate">
                    {health.collection}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <svg
                    className="h-4 w-4 text-muted-foreground mx-auto mb-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Vectors
                  </p>
                  <p className="text-sm font-semibold">
                    {health.vector_size.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <Server className="h-4 w-4 text-muted-foreground mx-auto mb-1.5" />
                  <p className="text-xs text-muted-foreground mb-0.5">Bots</p>
                  <p className="text-sm font-semibold">{health.bots}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                  {healthError || "Not checked"}
                </p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80">
                  Click below to check connection
                </p>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={refreshHealth}
            disabled={checking}
            className="w-full gap-2 transition-all duration-200"
          >
            {checking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Ping Backend
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
