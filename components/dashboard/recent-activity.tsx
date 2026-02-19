"use client";

import { useAppStore } from "@/lib/store/app-store";
import { prettyDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RecentActivity() {
  const events = useAppStore((s) => s.events);
  const recent = events.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        <CardDescription>Latest {recent.length} events</CardDescription>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events yet.</p>
        ) : (
          <div className="space-y-3">
            {recent.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <div
                  className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                    event.status === "ok" ? "bg-emerald-500" : "bg-destructive"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
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
        )}
      </CardContent>
    </Card>
  );
}
