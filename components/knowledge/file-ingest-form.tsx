"use client";

import { FormEvent, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import { ingestFile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileIngestFormProps {
  botId?: string;
}

export function FileIngestForm({ botId }: FileIngestFormProps) {
  const { apiBaseUrl, adminToken, addEvent } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ docId: string; chunks: number; botId: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file || busy) return;
    if (!adminToken) {
      toast.error("Login required");
      return;
    }

    setBusy(true);
    try {
      const res = await ingestFile(apiBaseUrl, file, botId || undefined, adminToken);
      setResult({ docId: res.doc_id, chunks: res.chunks, botId: res.bot_id });
      addEvent("ingest:file", `${file.name} indexed (${res.chunks} chunks) for bot ${res.bot_id}`, "ok");
      toast.success(`${file.name} indexed (${res.chunks} chunks)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      addEvent("ingest:file", msg, "error");
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Upload file (TXT or PDF)</Label>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 gap-2">
          <FileUp className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {file ? file.name : "Drop a file or click to browse"}
          </p>
          <Input
            type="file"
            accept=".txt,.pdf,text/plain,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="max-w-xs"
          />
        </div>
      </div>
      <Button type="submit" disabled={busy || !file}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
        Ingest File
      </Button>

      {result && (
        <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
          <p className="text-sm"><span className="font-medium">doc_id:</span> <code className="text-xs">{result.docId}</code></p>
          <p className="text-sm"><span className="font-medium">chunks:</span> {result.chunks}</p>
          <p className="text-sm"><span className="font-medium">bot_id:</span> <code className="text-xs">{result.botId}</code></p>
        </div>
      )}
    </form>
  );
}
