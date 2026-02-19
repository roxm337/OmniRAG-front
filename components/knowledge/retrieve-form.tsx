"use client";

import { FormEvent, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import { retrieve } from "@/lib/api";
import type { RetrieveResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SourceChunkCard } from "@/components/shared/source-chunk-card";

interface RetrieveFormProps {
  botId?: string;
}

export function RetrieveForm({ botId }: RetrieveFormProps) {
  const { apiBaseUrl, adminToken, addEvent } = useAppStore();
  const [query, setQuery] = useState("");
  const [docId, setDocId] = useState("");
  const [topK, setTopK] = useState(5);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RetrieveResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim() || busy) return;
    if (!adminToken) {
      toast.error("Login required");
      return;
    }

    setBusy(true);
    try {
      const res = await retrieve(apiBaseUrl, {
        bot_id: botId || undefined,
        query,
        top_k: topK,
        doc_id: docId.trim() || undefined,
      }, adminToken);
      setResult(res);
      addEvent("retrieve", `Found ${res.results.length} chunks for bot ${res.bot_id}`, "ok");
      toast.success(`Found ${res.results.length} chunks`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      addEvent("retrieve", msg, "error");
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Query</Label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for matching context..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
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
          <div className="space-y-2">
            <Label>Doc ID (optional)</Label>
            <Input
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              placeholder="Filter by doc"
            />
          </div>
        </div>
        <Button type="submit" disabled={busy || !query.trim()}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Retrieve
        </Button>
      </form>

      {result && result.results.length > 0 && (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2 pr-4">
            {result.results.map((chunk) => (
              <SourceChunkCard key={`${chunk.doc_id}:${chunk.chunk_id}`} chunk={chunk} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
