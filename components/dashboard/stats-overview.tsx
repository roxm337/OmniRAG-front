"use client";

import { Activity, Bot, Cpu, Database, Wifi } from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatsOverview() {
  const { health, healthError, defaultProvider, events, currentBotId } =
    useAppStore();

  const stats = [
    {
      title: "Status",
      value: health ? "Online" : healthError ? "Offline" : "Unknown",
      icon: Wifi,
      iconBg: health
        ? "bg-emerald-100 dark:bg-emerald-900/30"
        : "bg-red-100 dark:bg-red-900/30",
      iconColor: health
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-destructive",
      valueColor: health
        ? "text-emerald-600 dark:text-emerald-400"
        : healthError
          ? "text-destructive"
          : "",
      accent: health ? "bg-emerald-500" : healthError ? "bg-destructive" : "bg-muted-foreground/30",
    },
    {
      title: "Events",
      value: String(events.length),
      icon: Activity,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      valueColor: "",
      accent: "bg-blue-500",
    },
    {
      title: "Provider",
      value: defaultProvider,
      icon: Cpu,
      iconBg: "bg-violet-100 dark:bg-violet-900/30",
      iconColor: "text-violet-600 dark:text-violet-400",
      valueColor: "",
      accent: "bg-violet-500",
    },
    {
      title: "Vector Size",
      value: health ? String(health.vector_size) : "-",
      icon: Database,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      valueColor: "",
      accent: "bg-amber-500",
    },
    {
      title: "Bots",
      value: health ? String(health.bots) : "-",
      icon: Bot,
      iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      valueColor: "",
      accent: "bg-cyan-500",
    },
    {
      title: "Active Bot",
      value: currentBotId ? `${currentBotId.slice(0, 8)}...` : "default",
      icon: Activity,
      iconBg: "bg-slate-100 dark:bg-slate-800",
      iconColor: "text-slate-600 dark:text-slate-400",
      valueColor: currentBotId ? "" : "text-muted-foreground",
      accent: currentBotId ? "bg-slate-500" : "bg-muted-foreground/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 stagger-children">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        >
          {/* Colored top accent bar */}
          <div className={cn("absolute top-0 left-0 right-0 h-0.5", stat.accent)} />
          <CardContent className="p-4 pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </span>
              <div
                className={`rounded-lg p-1.5 transition-transform duration-200 group-hover:scale-110 ${stat.iconBg}`}
              >
                <stat.icon className={`h-3.5 w-3.5 ${stat.iconColor}`} />
              </div>
            </div>
            <div
              className={`text-xl font-bold tracking-tight truncate ${stat.valueColor}`}
            >
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
