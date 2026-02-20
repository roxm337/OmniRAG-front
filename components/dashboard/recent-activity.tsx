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
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <span className="block">Recent Activity</span>
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
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No events yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Actions will appear here as they happen
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

            <div className="space-y-0.5">
              {recent.map((event) => (
                <div
                  key={event.id}
                  className="group relative flex items-start gap-4 rounded-lg p-2.5 transition-all duration-150 hover:bg-accent/50"
                >
                  {/* Timeline dot */}
                  <div className="relative z-10 mt-1.5 shrink-0">
                    <div
                      className={`h-[10px] w-[10px] rounded-full ring-2 ring-background transition-transform duration-200 group-hover:scale-125 ${
                        event.status === "ok"
                          ? "bg-emerald-500"
                          : "bg-destructive"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 -mt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-xs font-mono px-2 py-0"
                      >
                        {event.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {prettyDate(event.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
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
