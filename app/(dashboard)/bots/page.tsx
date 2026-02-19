"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { getBotHistory, getPlatformLogs, listBots } from "@/lib/api";
import { useAppStore } from "@/lib/store/app-store";
import type { BotHistoryResponse, PlatformLogResponse } from "@/lib/types";
import { prettyDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BotsPage() {
  const router = useRouter();
  const {
    apiBaseUrl,
    adminToken,
    currentBotId,
    bots,
    setBots,
    addEvent,
  } = useAppStore();

  const [history, setHistory] = useState<BotHistoryResponse | null>(null);
  const [platformLogs, setPlatformLogs] = useState<PlatformLogResponse | null>(null);
  const [busy, setBusy] = useState(false);

  const activeBot = useMemo(() => bots.find((bot) => bot.id === currentBotId) ?? null, [bots, currentBotId]);

  async function refreshData(showToast = false) {
    if (!adminToken) return;

    setBusy(true);
    try {
      const botList = await listBots(apiBaseUrl, adminToken);
      setBots(botList.bots);

      const botId = currentBotId || botList.bots[0]?.id;
      if (botId) {
        const [historyRes, logsRes] = await Promise.all([
          getBotHistory(apiBaseUrl, adminToken, botId, 100),
          getPlatformLogs(apiBaseUrl, adminToken, 200),
        ]);
        setHistory(historyRes);
        setPlatformLogs(logsRes);
      } else {
        setHistory(null);
        setPlatformLogs(null);
      }

      addEvent("bots:history", "Bot history refreshed", "ok");
      if (showToast) toast.success("Bot history refreshed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load bot history";
      addEvent("bots:history", msg, "error");
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!adminToken) return;
    void refreshData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl, adminToken, currentBotId]);

  if (!adminToken) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bots & Platform Logs</h2>
          <p className="text-muted-foreground">Login as admin from Dashboard to access bot history and platform logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bots & Platform Logs</h2>
          <p className="text-muted-foreground">
            Active bot: {activeBot ? `${activeBot.name} (${activeBot.id})` : "None"}
          </p>
        </div>
        <Button variant="outline" onClick={() => void refreshData(true)} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {/* Bot Cards */}
      {bots.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <Card
              key={bot.id}
              className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                bot.id === currentBotId ? "border-primary" : ""
              }`}
              onClick={() => router.push(`/bots/${bot.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{bot.name}</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">{bot.provider}</Badge>
                  {bot.has_db_config && <Badge variant="outline" className="text-xs">DB Mode</Badge>}
                  {bot.id === currentBotId && <Badge className="text-xs">Active</Badge>}
                </div>
                {bot.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{bot.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bot Ingestion History</CardTitle>
            <CardDescription>Latest ingested docs for active bot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {history?.ingestions.length ? history.ingestions.map((item) => (
              <div key={`${item.doc_id}-${item.created_at}`} className="rounded-lg border p-3 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{item.doc_type}</Badge>
                  <span className="text-xs text-muted-foreground">{prettyDate(item.created_at)}</span>
                </div>
                <p className="text-sm font-medium">{item.doc_name}</p>
                <p className="text-xs text-muted-foreground">doc_id: {item.doc_id}</p>
                <p className="text-xs text-muted-foreground">chunks: {item.chunks}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">No ingestion history.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bot Chat History</CardTitle>
            <CardDescription>Latest RAG and DB chat activity for active bot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {history?.chats.length ? history.chats.map((item, idx) => (
              <div key={`${item.created_at}-${idx}`} className="rounded-lg border p-3 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{item.mode}</Badge>
                  <Badge variant="outline">{item.provider_used}</Badge>
                  <span className="text-xs text-muted-foreground">{prettyDate(item.created_at)}</span>
                </div>
                <p className="text-sm"><span className="font-medium">Q:</span> {item.query}</p>
                <p className="text-sm text-muted-foreground line-clamp-3"><span className="font-medium">A:</span> {item.answer ?? "-"}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">No chat history.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Logs</CardTitle>
          <CardDescription>System events, bot actions, and admin actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {platformLogs?.logs.length ? platformLogs.logs.map((log, idx) => (
            <div key={`${log.created_at}-${idx}`} className="rounded-lg border p-3 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{log.level}</Badge>
                <Badge variant="outline">{log.event_type}</Badge>
                <span className="text-xs text-muted-foreground">{prettyDate(log.created_at)}</span>
              </div>
              <p className="text-sm">{log.message}</p>
              <pre className="rounded bg-muted p-2 text-xs overflow-x-auto">{JSON.stringify(log.metadata, null, 2)}</pre>
            </div>
          )) : <p className="text-sm text-muted-foreground">No platform logs.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
