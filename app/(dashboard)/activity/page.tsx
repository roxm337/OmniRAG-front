"use client";

import { useMemo, useState } from "react";
import { Activity, Filter, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityTimeline } from "@/components/activity/activity-timeline";

export default function ActivityPage() {
  const { events, clearEvents } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<"all" | "ok" | "error">(
    "all"
  );

  const filteredEvents = useMemo(() => {
    if (statusFilter === "all") return events;
    return events.filter((e) => e.status === statusFilter);
  }, [events, statusFilter]);

  const okCount = events.filter((e) => e.status === "ok").length;
  const errorCount = events.filter((e) => e.status === "error").length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Activity</h2>
            <p className="text-sm text-muted-foreground">
              {events.length === 0
                ? "No events recorded yet"
                : `${events.length} event${events.length === 1 ? "" : "s"} recorded`}
            </p>
          </div>
        </div>
        {events.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearEvents}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        )}
      </div>

      {/* Stats + Filter Bar */}
      {events.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 stagger-children">
          {/* Summary badges */}
          <div className="flex items-center gap-2 mr-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {okCount}
              </span>
              <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                success
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                {errorCount}
              </span>
              <span className="text-xs text-red-600/70 dark:text-red-400/70">
                error{errorCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg">
            <Filter className="h-3.5 w-3.5 text-muted-foreground ml-2 mr-1" />
            {(["all", "ok", "error"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                  statusFilter === f
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "All" : f === "ok" ? "Success" : "Errors"}
              </button>
            ))}
          </div>

          {statusFilter !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Showing {filteredEvents.length} of {events.length}
            </Badge>
          )}
        </div>
      )}

      {/* Timeline */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="pt-6">
          <ScrollArea className="h-[600px]">
            <ActivityTimeline events={filteredEvents} />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
