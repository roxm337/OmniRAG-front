"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bot, Key, Loader2, MessageCircle, Palette, Settings, History } from "lucide-react";
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
  const { apiBaseUrl, adminToken, bots, setBots, upsertBot, removeBot } = useAppStore();

  const bot = bots.find((b) => b.id === botId);
  const [activeTab, setActiveTab] = useState<Tab>("settings");
  const [loadingBot, setLoadingBot] = useState(false);

  // Settings form
  const [name, setName] = useState(bot?.name || "");
  const [description, setDescription] = useState(bot?.description || "");
  const [provider, setProvider] = useState<LlmProvider>(bot?.provider || "deepseek");
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
    if (!adminToken || !confirm("Delete this bot? This cannot be undone.")) return;
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
      <div className="flex justify-center py-12">
        {loadingBot ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <p className="text-muted-foreground">Bot not found</p>
        )}
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
    { id: "api-keys", label: "API Keys", icon: <Key className="h-4 w-4" /> },
    { id: "widget", label: "Widget", icon: <Palette className="h-4 w-4" /> },
    { id: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="h-4 w-4" /> },
    { id: "history", label: "History", icon: <History className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push("/bots")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h1 className="text-xl font-semibold">{bot.name}</h1>
        </div>
        <Badge variant="outline" className="ml-2">{bot.provider}</Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "settings" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bot Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <ProviderSelect
                  value={provider}
                  onChange={(v) => { if (v !== "default") setProvider(v as LlmProvider); }}
                />
              </div>
              <div className="space-y-2">
                <Label>Temperature</Label>
                <Input
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Top K</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value) || 1)}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
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
            <CardTitle className="text-base">Activity History</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : !history ? (
              <p className="text-sm text-muted-foreground text-center py-4">No history available</p>
            ) : (
              <div className="space-y-4">
                {history.ingestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Ingestions ({history.ingestions.length})</h4>
                    <div className="space-y-2">
                      {history.ingestions.slice(0, 20).map((item) => (
                        <div key={item.doc_id} className="text-sm flex justify-between items-center border-b py-1">
                          <span>{item.doc_name} ({item.doc_type})</span>
                          <span className="text-muted-foreground text-xs">
                            {item.chunks} chunks - {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {history.chats.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Chats ({history.chats.length})</h4>
                    <div className="space-y-2">
                      {history.chats.slice(0, 20).map((item, i) => (
                        <div key={i} className="text-sm border-b py-1">
                          <div className="flex justify-between">
                            <span className="font-medium truncate max-w-[70%]">{item.query}</span>
                            <Badge variant="outline" className="text-xs">{item.provider_used}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
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
  );
}
