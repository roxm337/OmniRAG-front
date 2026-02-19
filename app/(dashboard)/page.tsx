"use client";

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
  CardDescription,
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
  const { apiBaseUrl, setApiBaseUrl, defaultProvider, setDefaultProvider, currentBotId } = useAppStore();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your OmniRAG workspace.
        </p>
      </div>

      <StatsOverview />

      <div className="grid gap-6 lg:grid-cols-2">
        <HealthCard />
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Settings</CardTitle>
            <CardDescription>Backend connection and provider config</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Backend URL</Label>
              <Input
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="http://localhost:8000"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Default Provider</Label>
              <Select
                value={defaultProvider}
                onValueChange={(v) => setDefaultProvider(v as LlmProvider)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Active Bot ID</Label>
              <Input
                value={currentBotId}
                readOnly
                placeholder="No bot selected"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Admin & Bot Management</CardTitle>
          <CardDescription>Login, create bots, choose active bot, and configure provider settings</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminBotManager />
        </CardContent>
      </Card>

      <RecentActivity />
    </div>
  );
}
