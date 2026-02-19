"use client";

import { FormEvent, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import { ingestText } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TextIngestFormProps {
  botId?: string;
}

export function TextIngestForm({ botId }: TextIngestFormProps) {
  const { apiBaseUrl, adminToken, addEvent } = useAppStore();
  const [docName, setDocName] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ docId: string; chunks: number; botId: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    if (!adminToken) {
      toast.error("Login required");
      return;
    }

    setBusy(true);
    try {
      const res = await ingestText(apiBaseUrl, {
        bot_id: botId || undefined,
        text,
        doc_name: docName.trim() || undefined,
      }, adminToken);
      setResult({ docId: res.doc_id, chunks: res.chunks, botId: res.bot_id });
      addEvent("ingest:text", `Indexed ${res.chunks} chunks for bot ${res.bot_id}`, "ok");
      toast.success(`Indexed ${res.chunks} chunks`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      addEvent("ingest:text", msg, "error");
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Document name</Label>
        <Input
          value={docName}
          onChange={(e) => setDocName(e.target.value)}
          placeholder="knowledge.md (optional)"
        />
      </div>
      <div className="space-y-2">
        <Label>Text content</Label>
        <Textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste content to index..."
        />
        <p className="text-xs text-muted-foreground">{text.length} characters</p>
      </div>
      <Button type="submit" disabled={busy || !text.trim()}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        Ingest Text
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
