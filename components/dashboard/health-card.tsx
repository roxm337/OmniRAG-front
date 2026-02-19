"use client";

import { useState } from "react";
import { Loader2, RefreshCw, Server } from "lucide-react";

import { useAppStore } from "@/lib/store/app-store";
import { getHealth } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function HealthCard() {
  const { apiBaseUrl, adminToken, health, healthError, setHealth, setHealthError, addEvent } = useAppStore();
  const [checking, setChecking] = useState(false);

  async function refreshHealth() {
    if (!adminToken) {
      setHealth(null);
      setHealthError("Login required");
      addEvent("health", "Login required", "error");
      return;
    }

    setChecking(true);
    try {
      const res = await getHealth(apiBaseUrl, adminToken);
      setHealth(res);
      setHealthError("");
      addEvent("health", `Backend online: ${res.collection} (${res.vector_size}), bots: ${res.bots}`, "ok");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Health check failed";
      setHealth(null);
      setHealthError(message);
      addEvent("health", message, "error");
    } finally {
      setChecking(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">Backend Health</CardTitle>
          <CardDescription>Connection status and vector store info</CardDescription>
        </div>
        <Server className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {health ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium">Connected</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Collection</p>
                  <p className="font-medium">{health.collection}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Vector Size</p>
                  <p className="font-medium">{health.vector_size}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Bots</p>
                  <p className="font-medium">{health.bots}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-sm text-muted-foreground">
                {healthError || "Not checked"}
              </span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshHealth}
            disabled={checking}
            className="w-full"
          >
            {checking ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3 w-3" />
            )}
            Ping Backend
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
