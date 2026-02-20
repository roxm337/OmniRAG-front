"use client";

import { Globe, LayoutDashboard, Settings2, Shield } from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { HealthCard } from "@/components/dashboard/health-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AdminBotManager } from "@/components/dashboard/admin-bot-manager";
import type { LlmProvider } from "@/lib/types";

export default function DashboardPage() {
  const {
    apiBaseUrl,
    setApiBaseUrl,
    defaultProvider,
    setDefaultProvider,
    currentBotId,
  } = useAppStore();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <LayoutDashboard className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Overview of your OmniRAG workspace
          </p>
        </div>
      </div>

      {/* Stats */}
      <StatsOverview />

      {/* Health + Settings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <HealthCard />

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-2">
                <Settings2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Backend URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={apiBaseUrl}
                  onChange={(e) => setApiBaseUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="pl-9 font-mono text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Default Provider</Label>
              <Select
                value={defaultProvider}
                onValueChange={(v) => setDefaultProvider(v as LlmProvider)}
              >
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Active Bot ID</Label>
              <Input
                value={currentBotId}
                readOnly
                placeholder="No bot selected"
                className="font-mono text-sm bg-muted/40"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin & Bot Management */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
              <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <span className="block">Admin & Bot Management</span>
              <span className="text-xs text-muted-foreground font-normal">
                Login, create bots, choose active bot, and configure provider
                settings
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdminBotManager />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
