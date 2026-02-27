"use client";

import { Activity } from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { prettyDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RecentActivity() {
  const events = useAppStore((s) => s.events);
  const recent = events.slice(0, 5);

  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span>Recent Activity</span>
              {recent.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-xs h-5 px-1.5 font-mono tabular-nums"
                >
                  {recent.length}
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground font-normal">
              {recent.length === 0
                ? "No events yet"
                : `Latest ${recent.length} event${recent.length === 1 ? "" : "s"}`}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
            <div className="rounded-full bg-muted p-4 mb-3 ring-1 ring-border/50">
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No events yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Actions will appear here as they happen
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-0.5 stagger-children">
              {recent.map((event) => (
                <div
                  key={event.id}
                  className="group relative flex items-start gap-4 rounded-lg p-2.5 transition-all duration-150 hover:bg-accent/50"
                >
                  {/* Timeline dot */}
                  <div className="relative z-10 mt-1.5 shrink-0">
                    <div
                      className={`h-[10px] w-[10px] rounded-full ring-2 ring-background transition-all duration-200 group-hover:scale-125 group-hover:ring-4 ${
                        event.status === "ok"
                          ? "bg-emerald-500 group-hover:ring-emerald-500/20"
                          : "bg-destructive group-hover:ring-destructive/20"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 -mt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-xs font-mono px-2 py-0 transition-colors duration-200 ${
                          event.status === "ok"
                            ? "group-hover:border-emerald-300 group-hover:text-emerald-700 dark:group-hover:border-emerald-700 dark:group-hover:text-emerald-400"
                            : "group-hover:border-red-300 group-hover:text-red-700 dark:group-hover:border-red-700 dark:group-hover:text-red-400"
                        }`}
                      >
                        {event.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {prettyDate(event.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate group-hover:text-foreground/80 transition-colors duration-150">
                      {event.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
