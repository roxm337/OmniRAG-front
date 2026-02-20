"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  ChevronRight,
  Database,
  FileText,
  Loader2,
  MessageSquare,
  RefreshCw,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { getBotHistory, getPlatformLogs, listBots } from "@/lib/api";
import { useAppStore } from "@/lib/store/app-store";
import type { BotHistoryResponse, PlatformLogResponse } from "@/lib/types";
import { prettyDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function BotsPage() {
  const router = useRouter();
  const { apiBaseUrl, adminToken, currentBotId, bots, setBots, addEvent } =
    useAppStore();

  const [history, setHistory] = useState<BotHistoryResponse | null>(null);
  const [platformLogs, setPlatformLogs] =
    useState<PlatformLogResponse | null>(null);
  const [busy, setBusy] = useState(false);

  const activeBot = useMemo(
    () => bots.find((bot) => bot.id === currentBotId) ?? null,
    [bots, currentBotId]
  );

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
      const msg =
        err instanceof Error ? err.message : "Failed to load bot history";
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
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Bot className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Bots & Platform Logs
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          Login as admin from Dashboard to access bot history and platform logs.
        </p>
      </div>
    );
  }

  const logLevelColor: Record<string, string> = {
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    warning:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Bots & Platform Logs
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {activeBot ? (
              <>
                Active bot:{" "}
                <span className="font-medium text-foreground">
                  {activeBot.name}
                </span>
                <span className="mx-1.5 text-border">|</span>
                <span className="font-mono text-xs">{activeBot.id}</span>
              </>
            ) : (
              "No active bot selected"
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refreshData(true)}
          disabled={busy}
          className="gap-2 transition-all duration-200"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Bot Cards */}
      {bots.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {bots.map((bot) => {
            const isActive = bot.id === currentBotId;
            return (
              <Card
                key={bot.id}
                className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                  isActive
                    ? "ring-2 ring-primary/50 border-primary shadow-md shadow-primary/5"
                    : "hover:border-primary/30"
                }`}
                onClick={() => router.push(`/bots/${bot.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2 transition-colors duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        }`}
                      >
                        <Bot className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm block">
                          {bot.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {bot.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      variant="secondary"
                      className="text-xs font-medium"
                    >
                      {bot.provider}
                    </Badge>
                    {bot.has_db_config && (
                      <Badge
                        variant="outline"
                        className="text-xs gap-1"
                      >
                        <Database className="h-3 w-3" />
                        DB
                      </Badge>
                    )}
                    {isActive && (
                      <Badge className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700">
                        <Sparkles className="h-3 w-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                  {bot.description && (
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                      {bot.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* History Sections */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Ingestion History */}
        <Card className="animate-slide-up">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-base">Ingestion History</CardTitle>
                <CardDescription className="text-xs">
                  Latest ingested docs for active bot
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[380px] pr-3">
              {history?.ingestions.length ? (
                <div className="space-y-2.5">
                  {history.ingestions.map((item) => (
                    <div
                      key={`${item.doc_id}-${item.created_at}`}
                      className="group/item rounded-xl border bg-card p-3.5 transition-all duration-150 hover:bg-accent/50 hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium"
                        >
                          {item.doc_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {prettyDate(item.created_at)}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-snug">
                        {item.doc_name}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="font-mono">{item.doc_id}</span>
                        <span className="text-border">|</span>
                        <span>{item.chunks} chunks</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No ingestion history
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat History */}
        <Card className="animate-slide-up" style={{ animationDelay: "80ms" }}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-2">
                <MessageSquare className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <CardTitle className="text-base">Chat History</CardTitle>
                <CardDescription className="text-xs">
                  Latest RAG and DB chat activity
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[380px] pr-3">
              {history?.chats.length ? (
                <div className="space-y-2.5">
                  {history.chats.map((item, idx) => (
                    <div
                      key={`${item.created_at}-${idx}`}
                      className="group/item rounded-xl border bg-card p-3.5 transition-all duration-150 hover:bg-accent/50 hover:shadow-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium"
                        >
                          {item.mode}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.provider_used}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {prettyDate(item.created_at)}
                        </span>
                      </div>
                      <p className="text-sm leading-snug">
                        <span className="font-semibold text-primary">Q:</span>{" "}
                        {item.query}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        <span className="font-semibold">A:</span>{" "}
                        {item.answer ?? "-"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No chat history
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Platform Logs */}
      <Card className="animate-slide-up" style={{ animationDelay: "160ms" }}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
              <ScrollText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-base">Platform Logs</CardTitle>
              <CardDescription className="text-xs">
                System events, bot actions, and admin actions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-3">
            {platformLogs?.logs.length ? (
              <div className="space-y-2">
                {platformLogs.logs.map((log, idx) => (
                  <div
                    key={`${log.created_at}-${idx}`}
                    className="rounded-xl border bg-card p-3.5 transition-all duration-150 hover:bg-accent/50 hover:shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                          logLevelColor[log.level] ??
                          "bg-muted text-muted-foreground"
                        }`}
                      >
                        {log.level}
                      </span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {log.event_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {prettyDate(log.created_at)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{log.message}</p>
                    {log.metadata &&
                      Object.keys(log.metadata).length > 0 && (
                        <pre className="mt-2 rounded-lg bg-muted/60 p-2.5 text-xs font-mono overflow-x-auto text-muted-foreground leading-relaxed">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <ScrollText className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No platform logs
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
