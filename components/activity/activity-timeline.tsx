"use client";

import {
  Activity,
  Bot,
  CheckCircle2,
  FileText,
  Heart,
  LogIn,
  MessageSquare,
  Search,
  XCircle,
} from "lucide-react";
import type { ActionEvent } from "@/lib/types";
import { prettyDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ActivityTimelineProps {
  events: ActionEvent[];
}

function getEventIcon(type: string) {
  if (type.startsWith("health")) return Heart;
  if (type.startsWith("ingest")) return FileText;
  if (type.startsWith("retrieve")) return Search;
  if (
    type.startsWith("chat") ||
    type.startsWith("rag") ||
    type.startsWith("db:query")
  )
    return MessageSquare;
  if (type.startsWith("bot")) return Bot;
  if (type.startsWith("admin")) return LogIn;
  return Activity;
}

function getEventColor(type: string): {
  bg: string;
  text: string;
} {
  if (type.startsWith("health"))
    return {
      bg: "bg-pink-100 dark:bg-pink-900/30",
      text: "text-pink-600 dark:text-pink-400",
    };
  if (type.startsWith("ingest"))
    return {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
    };
  if (type.startsWith("retrieve"))
    return {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-600 dark:text-amber-400",
    };
  if (
    type.startsWith("chat") ||
    type.startsWith("rag") ||
    type.startsWith("db:query")
  )
    return {
      bg: "bg-violet-100 dark:bg-violet-900/30",
      text: "text-violet-600 dark:text-violet-400",
    };
  if (type.startsWith("bot"))
    return {
      bg: "bg-cyan-100 dark:bg-cyan-900/30",
      text: "text-cyan-600 dark:text-cyan-400",
    };
  if (type.startsWith("admin"))
    return {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-600 dark:text-emerald-400",
    };
  return {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-400",
  };
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-5 mb-4">
          <Activity className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground mb-1">
          No events yet
        </p>
        <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
          Actions like health checks, ingestions, and chats will appear here as
          a timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline vertical line */}
      <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border" />

      <div className="space-y-1">
        {events.map((event) => {
          const Icon = getEventIcon(event.type);
          const color = getEventColor(event.type);
          const isOk = event.status === "ok";

          return (
            <div
              key={event.id}
              className="group relative flex items-start gap-4 rounded-xl p-3 transition-all duration-150 hover:bg-accent/50"
            >
              {/* Icon dot */}
              <div
                className={`relative z-10 mt-0.5 shrink-0 rounded-lg p-1.5 ring-2 ring-background transition-transform duration-200 group-hover:scale-110 ${color.bg}`}
              >
                <Icon className={`h-3.5 w-3.5 ${color.text}`} />
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
                  {isOk ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-destructive" />
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {prettyDate(event.createdAt)}
                  </span>
                </div>
                <p className="text-sm mt-1 leading-relaxed">{event.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
