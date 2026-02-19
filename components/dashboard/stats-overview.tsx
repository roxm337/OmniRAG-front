"use client";

import { Activity, Bot, Cpu, Database, Wifi } from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatsOverview() {
  const { health, healthError, defaultProvider, events, currentBotId } = useAppStore();

  const stats = [
    {
      title: "Status",
      value: health ? "Online" : healthError ? "Offline" : "Unknown",
      icon: Wifi,
      color: health ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
    },
    {
      title: "Events",
      value: String(events.length),
      icon: Activity,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Provider",
      value: defaultProvider,
      icon: Cpu,
      color: "text-violet-600 dark:text-violet-400",
    },
    {
      title: "Vector Size",
      value: health ? String(health.vector_size) : "-",
      icon: Database,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Bots",
      value: health ? String(health.bots) : "-",
      icon: Bot,
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      title: "Active Bot",
      value: currentBotId ? `${currentBotId.slice(0, 8)}...` : "default",
      icon: Activity,
      color: "text-slate-600 dark:text-slate-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
