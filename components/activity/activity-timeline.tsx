"use client";

import type { ActionEvent } from "@/lib/types";
import { prettyDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ActivityTimelineProps {
  events: ActionEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">No events yet.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Actions like health checks, ingestions, and chats will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {events.map((event) => (
        <div
          key={event.id}
          className={`flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50 border-l-4 ${
            event.status === "ok"
              ? "border-l-emerald-400 dark:border-l-emerald-600"
              : "border-l-destructive"
          }`}
        >
          <div
            className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
              event.status === "ok" ? "bg-emerald-500" : "bg-destructive"
            }`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {event.type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {prettyDate(event.createdAt)}
              </span>
            </div>
            <p className="text-sm mt-0.5">{event.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
