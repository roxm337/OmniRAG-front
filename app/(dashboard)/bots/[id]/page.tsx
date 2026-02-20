"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  History,
  Key,
  Loader2,
  MessageCircle,
  Palette,
  Settings,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import { deleteBot, getBotHistory, listBots, updateBot } from "@/lib/api";
import type { BotHistoryResponse, LlmProvider } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ProviderSelect } from "@/components/shared/provider-select";
import { ApiKeysManager } from "@/components/bots/api-keys-manager";
import { WidgetConfigManager } from "@/components/bots/widget-config";
import { WhatsAppConfigManager } from "@/components/bots/whatsapp-config";

type Tab = "settings" | "api-keys" | "widget" | "whatsapp" | "history";

export default function BotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const botId = params.id as string;
  const { apiBaseUrl, adminToken, bots, setBots, upsertBot, removeBot } =
    useAppStore();

  const bot = bots.find((b) => b.id === botId);
  const [activeTab, setActiveTab] = useState<Tab>("settings");
  const [loadingBot, setLoadingBot] = useState(false);

  // Settings form
  const [name, setName] = useState(bot?.name || "");
  const [description, setDescription] = useState(bot?.description || "");
  const [provider, setProvider] = useState<LlmProvider>(
    bot?.provider || "deepseek"
  );
  const [temperature, setTemperature] = useState(bot?.temperature || 0.1);
  const [topK, setTopK] = useState(bot?.top_k || 5);
  const [saving, setSaving] = useState(false);

  // History
  const [history, setHistory] = useState<BotHistoryResponse | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (bot) {
      setName(bot.name);
      setDescription(bot.description || "");
      setProvider(bot.provider);
      setTemperature(bot.temperature);
      setTopK(bot.top_k);
    }
  }, [bot]);

  useEffect(() => {
    if (!adminToken || bot) return;

    setLoadingBot(true);
    listBots(apiBaseUrl, adminToken)
      .then((res) => setBots(res.bots))
      .catch(() => toast.error("Failed to load bot"))
      .finally(() => setLoadingBot(false));
  }, [adminToken, apiBaseUrl, bot, setBots]);

  useEffect(() => {
    if (activeTab === "history" && adminToken) {
      setLoadingHistory(true);
      getBotHistory(apiBaseUrl, adminToken, botId)
        .then(setHistory)
        .catch(() => toast.error("Failed to load history"))
        .finally(() => setLoadingHistory(false));
    }
  }, [activeTab, apiBaseUrl, botId, adminToken]);

  async function handleSave() {
    if (!adminToken) return;
    setSaving(true);
    try {
      const updated = await updateBot(apiBaseUrl, adminToken, botId, {
        name: name.trim(),
        description: description.trim() || undefined,
        provider,
        temperature,
        top_k: topK,
      });
      upsertBot(updated);
      toast.success("Bot updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!adminToken || !confirm("Delete this bot? This cannot be undone."))
      return;
    try {
      await deleteBot(apiBaseUrl, adminToken, botId);
      removeBot(botId);
      toast.success("Bot deleted");
      router.push("/bots");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  if (!bot) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        {loadingBot ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <>
            <div className="rounded-full bg-muted p-4 mb-4">
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Bot not found</p>
          </>
        )}
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
    { id: "api-keys", label: "API Keys", icon: <Key className="h-4 w-4" /> },
    { id: "widget", label: "Widget", icon: <Palette className="h-4 w-4" /> },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: <MessageCircle className="h-4 w-4" />,
    },
    {
      id: "history",
      label: "History",
      icon: <History className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/bots")}
          className="rounded-full h-9 w-9 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 min-w-0">
          <div className="rounded-lg bg-primary/10 p-2">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold truncate">{bot.name}</h1>
            <p className="text-xs text-muted-foreground font-mono">
              {bot.id}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="ml-auto text-xs font-medium shrink-0">
          {bot.provider}
        </Badge>
      </div>

      {/* Tabs - pill style */}
      <div className="flex gap-1 p-1 bg-muted/60 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-scale-in" key={activeTab}>
        {activeTab === "settings" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                Bot Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Provider</Label>
                  <ProviderSelect
                    value={provider}
                    onChange={(v) => {
                      if (v !== "default") setProvider(v as LlmProvider);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Temperature</Label>
                  <Input
                    type="number"
                    min={0}
                    max={2}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls randomness (0 = deterministic, 2 = creative)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Top K</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value) || 1)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of retrieved document chunks
                  </p>
                </div>
              </div>
              <div className="flex gap-3 pt-3 border-t">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="transition-all duration-200"
                >
                  {saving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Bot
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "api-keys" && <ApiKeysManager botId={botId} />}
        {activeTab === "widget" && <WidgetConfigManager botId={botId} />}
        {activeTab === "whatsapp" && <WhatsAppConfigManager botId={botId} />}

        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !history ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <History className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No history available
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {history.ingestions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <span className="rounded-md bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-blue-700 dark:text-blue-400 text-xs font-medium">
                          Ingestions
                        </span>
                        <span className="text-muted-foreground font-normal">
                          {history.ingestions.length}
                        </span>
                      </h4>
                      <div className="space-y-2">
                        {history.ingestions.slice(0, 20).map((item) => (
                          <div
                            key={item.doc_id}
                            className="flex items-center justify-between rounded-lg border p-3 transition-all duration-150 hover:bg-accent/50"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="rounded-md bg-muted p-1.5 shrink-0">
                                <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-sm font-medium truncate block">
                                  {item.doc_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {item.doc_type} &middot; {item.chunks} chunks
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0 ml-3">
                              {new Date(
                                item.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {history.chats.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <span className="rounded-md bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 text-violet-700 dark:text-violet-400 text-xs font-medium">
                          Chats
                        </span>
                        <span className="text-muted-foreground font-normal">
                          {history.chats.length}
                        </span>
                      </h4>
                      <div className="space-y-2">
                        {history.chats.slice(0, 20).map((item, i) => (
                          <div
                            key={i}
                            className="rounded-lg border p-3 transition-all duration-150 hover:bg-accent/50"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-medium text-sm truncate max-w-[70%]">
                                {item.query}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs shrink-0"
                              >
                                {item.provider_used}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
