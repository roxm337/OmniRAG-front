"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, FileText, Loader2, Upload } from "lucide-react";
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
  const [result, setResult] = useState<{
    docId: string;
    chunks: number;
    botId: string;
  } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    if (!adminToken) {
      toast.error("Login required");
      return;
    }

    setBusy(true);
    try {
      const res = await ingestText(
        apiBaseUrl,
        {
          bot_id: botId || undefined,
          text,
          doc_name: docName.trim() || undefined,
        },
        adminToken
      );
      setResult({
        docId: res.doc_id,
        chunks: res.chunks,
        botId: res.bot_id,
      });
      addEvent(
        "ingest:text",
        `Indexed ${res.chunks} chunks for bot ${res.bot_id}`,
        "ok"
      );
      toast.success(`Indexed ${res.chunks} chunks`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      addEvent("ingest:text", msg, "error");
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  const charCount = text.length;
  const charColor =
    charCount === 0
      ? "text-muted-foreground"
      : charCount > 10000
        ? "text-amber-600 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          Document name
        </Label>
        <Input
          value={docName}
          onChange={(e) => setDocName(e.target.value)}
          placeholder="knowledge.md (optional)"
          className="max-w-md transition-all duration-200 focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Text content</Label>
        <Textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste content to index..."
          className="resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 font-mono text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <p className={`text-xs font-medium ${charColor}`}>
            {charCount.toLocaleString()} characters
          </p>
          {charCount > 0 && (
            <button
              type="button"
              onClick={() => setText("")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <Button
        type="submit"
        disabled={busy || !text.trim()}
        className="gap-2 transition-all duration-200"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Ingest Text
      </Button>

      {result && (
        <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 space-y-2.5 animate-scale-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Successfully indexed
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-white dark:bg-gray-800 border p-2.5 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Doc ID</p>
              <code className="text-xs font-mono font-medium truncate block">
                {result.docId}
              </code>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-800 border p-2.5 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Chunks</p>
              <p className="text-sm font-bold">{result.chunks}</p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-800 border p-2.5 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Bot ID</p>
              <code className="text-xs font-mono font-medium truncate block">
                {result.botId}
              </code>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
