"use client";

import { FormEvent, useState } from "react";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import { chatDb } from "@/lib/api";
import type { ChatDbResponse, LlmProvider } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProviderSelect } from "@/components/shared/provider-select";
import { SqlResultDisplay } from "@/components/database/sql-result-display";

export function DbChatForm() {
  const { apiBaseUrl, adminToken, currentBotId, addEvent } = useAppStore();
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(6);
  const [providerMode, setProviderMode] = useState<"default" | LlmProvider>("default");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ChatDbResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim() || busy) return;
    if (!adminToken) {
      toast.error("Login required");
      return;
    }

    setBusy(true);
    try {
      const provider = providerMode === "default" ? undefined : providerMode;
      const res = await chatDb(apiBaseUrl, { bot_id: currentBotId || undefined, query, top_k: topK, provider }, adminToken);
      setResult(res);
      addEvent("chat:db", `SQL generated with ${res.provider_used}, rows: ${res.rows_returned}, bot: ${res.bot_id}`, "ok");
      toast.success(`SQL executed - ${res.rows_returned} rows returned`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      addEvent("chat:db", msg, "error");
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Natural language query</Label>
          <Textarea
            rows={4}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Top users by order count in the last 30 days"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Schema Top K</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label>Provider</Label>
            <ProviderSelect value={providerMode} onChange={setProviderMode} />
          </div>
        </div>
        <Button type="submit" disabled={busy || !query.trim()}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          Run DB Chat
        </Button>
      </form>

      {result && <SqlResultDisplay result={result} />}
    </div>
  );
}
