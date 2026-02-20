"use client";

import { FormEvent, useState } from "react";
import { Loader2, Search, SearchX } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import { retrieve } from "@/lib/api";
import type { RetrieveResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
      const res = await retrieve(
        apiBaseUrl,
        {
          bot_id: botId || undefined,
          query,
          top_k: topK,
          doc_id: docId.trim() || undefined,
        },
        adminToken
      );
      setResult(res);
      addEvent(
        "retrieve",
        `Found ${res.results.length} chunks for bot ${res.bot_id}`,
        "ok"
      );
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
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            Query
          </Label>
          <div className="relative">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for matching context..."
              className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <SearchX className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Top K</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value) || 1)}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">Doc ID (optional)</Label>
            <Input
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              placeholder="Filter by doc"
              className="font-mono text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={busy || !query.trim()}
          className="gap-2 transition-all duration-200"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Retrieve
        </Button>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-3 animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">Results</h4>
              <Badge
                variant="secondary"
                className="text-xs"
              >
                {result.results.length} chunk{result.results.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            {result.bot_id && (
              <Badge variant="outline" className="text-xs font-mono">
                bot: {result.bot_id.slice(0, 8)}...
              </Badge>
            )}
          </div>
          {result.results.length > 0 ? (
            <ScrollArea className="h-[420px]">
              <div className="space-y-2.5 pr-4">
                {result.results.map((chunk) => (
                  <SourceChunkCard
                    key={`${chunk.doc_id}:${chunk.chunk_id}`}
                    chunk={chunk}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <SearchX className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No matching chunks found
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Try a different query or adjust Top K
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
