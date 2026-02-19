"use client";

import { FormEvent, useMemo, useState } from "react";
import { Loader2, Database } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import { ingestDbSchema } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function SchemaIngestForm() {
  const { apiBaseUrl, adminToken, currentBotId, addEvent } = useAppStore();
  const [dbUrl, setDbUrl] = useState("");
  const [allowlistText, setAllowlistText] = useState("public.orders, public.users");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ docId: string; chunks: number; tables: string[]; botId: string } | null>(null);

  const allowlist = useMemo(
    () => allowlistText.split(",").map((v) => v.trim()).filter(Boolean),
    [allowlistText],
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!dbUrl.trim() || allowlist.length === 0 || busy) return;
    if (!adminToken) {
      toast.error("Login required");
      return;
    }

    setBusy(true);
    try {
      const res = await ingestDbSchema(apiBaseUrl, {
        bot_id: currentBotId || undefined,
        database_url: dbUrl,
        allowlist_tables: allowlist,
      }, adminToken);
      setResult({ docId: res.doc_id, chunks: res.chunks, tables: res.allowlist_tables, botId: res.bot_id });
      addEvent("ingest:db-schema", `Schema indexed for ${res.allowlist_tables.length} tables on bot ${res.bot_id}`, "ok");
      toast.success(`Schema indexed for ${res.allowlist_tables.length} tables`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      addEvent("ingest:db-schema", msg, "error");
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>PostgreSQL URL (read-only user)</Label>
        <Input
          value={dbUrl}
          onChange={(e) => setDbUrl(e.target.value)}
          placeholder="postgresql://readonly_user:password@localhost:5432/db"
          type="password"
        />
      </div>
      <div className="space-y-2">
        <Label>Allowlist tables (comma-separated)</Label>
        <Textarea
          rows={3}
          value={allowlistText}
          onChange={(e) => setAllowlistText(e.target.value)}
          placeholder="public.orders, public.users"
        />
        <div className="flex flex-wrap gap-1">
          {allowlist.map((t) => (
            <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={busy || !dbUrl.trim() || allowlist.length === 0}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
        Ingest Schema
      </Button>

      {result && (
        <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
          <p className="text-sm"><span className="font-medium">doc_id:</span> <code className="text-xs">{result.docId}</code></p>
          <p className="text-sm"><span className="font-medium">chunks:</span> {result.chunks}</p>
          <p className="text-sm"><span className="font-medium">tables:</span> {result.tables.join(", ")}</p>
          <p className="text-sm"><span className="font-medium">bot_id:</span> <code className="text-xs">{result.botId}</code></p>
        </div>
      )}
    </form>
  );
}
