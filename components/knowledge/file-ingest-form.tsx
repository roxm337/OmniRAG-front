"use client";

import { FormEvent, useRef, useState } from "react";
import { CheckCircle2, FileUp, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import { ingestFile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FileIngestFormProps {
  botId?: string;
}

export function FileIngestForm({ botId }: FileIngestFormProps) {
  const { apiBaseUrl, adminToken, addEvent } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<{
    docId: string;
    chunks: number;
    botId: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file || busy) return;
    if (!adminToken) {
      toast.error("Login required");
      return;
    }

    setBusy(true);
    try {
      const res = await ingestFile(
        apiBaseUrl,
        file,
        botId || undefined,
        adminToken
      );
      setResult({
        docId: res.doc_id,
        chunks: res.chunks,
        botId: res.bot_id,
      });
      addEvent(
        "ingest:file",
        `${file.name} indexed (${res.chunks} chunks) for bot ${res.bot_id}`,
        "ok"
      );
      toast.success(`${file.name} indexed (${res.chunks} chunks)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      addEvent("ingest:file", msg, "error");
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 px-6 cursor-pointer transition-all duration-200 ${
          dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : file
              ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10"
              : "border-muted-foreground/20 bg-muted/20 hover:border-primary/30 hover:bg-muted/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.pdf,text/plain,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />

        {file ? (
          <div className="flex flex-col items-center gap-3 animate-scale-in">
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-3">
              <FileUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">{file.name}</p>
              <div className="flex items-center gap-2 justify-center mt-1">
                <Badge variant="secondary" className="text-xs">
                  {file.type === "application/pdf" ? "PDF" : "TXT"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setResult(null);
              }}
              className="text-xs text-muted-foreground gap-1"
            >
              <X className="h-3 w-3" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-muted p-4">
              <FileUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                Drop a file or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports TXT and PDF files
              </p>
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={busy || !file}
        className="gap-2 transition-all duration-200"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileUp className="h-4 w-4" />
        )}
        Ingest File
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
