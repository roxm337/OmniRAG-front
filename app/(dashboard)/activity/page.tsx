"use client";

import { Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityTimeline } from "@/components/activity/activity-timeline";

export default function ActivityPage() {
  const { events, clearEvents } = useAppStore();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Activity</h2>
          <p className="text-muted-foreground">
            All recent actions and events ({events.length} total).
          </p>
        </div>
        {events.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearEvents}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <ScrollArea className="h-[600px]">
            <ActivityTimeline events={events} />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
