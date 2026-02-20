"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Copy,
  Key,
  Loader2,
  Plus,
  Power,
  PowerOff,
  Shield,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import {
  createApiKey,
  deleteApiKey,
  listApiKeys,
  updateApiKey,
} from "@/lib/api";
import type { ApiKey } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ApiKeysManagerProps {
  botId: string;
}

export function ApiKeysManager({ botId }: ApiKeysManagerProps) {
  const { apiBaseUrl, adminToken } = useAppStore();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchKeys = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const res = await listApiKeys(apiBaseUrl, adminToken, botId);
      setKeys(res.api_keys);
    } catch {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, [adminToken, apiBaseUrl, botId]);

  useEffect(() => {
    void fetchKeys();
  }, [fetchKeys]);

  async function handleCreate() {
    if (!newKeyName.trim() || !adminToken) return;
    setCreating(true);
    try {
      const res = await createApiKey(
        apiBaseUrl,
        adminToken,
        botId,
        newKeyName.trim()
      );
      setCreatedKey(res.key);
      setNewKeyName("");
      await fetchKeys();
      toast.success("API key created");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create key"
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(key: ApiKey) {
    if (!adminToken) return;
    try {
      await updateApiKey(apiBaseUrl, adminToken, botId, key.id, !key.is_active);
      await fetchKeys();
      toast.success(key.is_active ? "Key disabled" : "Key enabled");
    } catch {
      toast.error("Failed to update key");
    }
  }

  async function handleDelete(keyId: string) {
    if (!adminToken) return;
    try {
      await deleteApiKey(apiBaseUrl, adminToken, botId, keyId);
      await fetchKeys();
      toast.success("API key revoked");
    } catch {
      toast.error("Failed to delete key");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
            <Key className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          API Keys
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Create new key */}
        <div className="flex gap-2">
          <Input
            placeholder="Key name (e.g. Production)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
          <Button
            onClick={handleCreate}
            disabled={creating || !newKeyName.trim()}
            size="sm"
            className="gap-2 shrink-0 transition-all duration-200"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Create</span>
          </Button>
        </div>

        {/* Show newly created key */}
        {createdKey && (
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 p-4 space-y-3 animate-scale-in">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Copy this key now &mdash; it won&apos;t be shown again!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-white dark:bg-gray-800 rounded-lg p-3 font-mono break-all border">
                {createdKey}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(createdKey)}
                className="shrink-0 gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCreatedKey(null)}
              className="text-xs text-muted-foreground"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Key list */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-3">
              <Key className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              No API keys yet
            </p>
            <p className="text-xs text-muted-foreground">
              Create one to integrate with external apps
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {keys.map((key) => (
              <div
                key={key.id}
                className={`flex items-center justify-between rounded-xl border p-4 transition-all duration-200 hover:shadow-sm ${
                  key.is_active
                    ? "hover:bg-accent/50"
                    : "opacity-60 bg-muted/30"
                }`}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold">{key.name}</span>
                    {key.is_active ? (
                      <Badge className="text-xs bg-emerald-600 hover:bg-emerald-700 gap-1">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                        </span>
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs gap-1">
                        Disabled
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <code className="font-mono">{key.key_prefix}...</code>
                    {key.last_used_at && (
                      <>
                        <span className="text-border">&middot;</span>
                        <span>
                          Last used:{" "}
                          {new Date(key.last_used_at).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggle(key)}
                    className="gap-1.5 text-xs"
                  >
                    {key.is_active ? (
                      <>
                        <PowerOff className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Disable</span>
                      </>
                    ) : (
                      <>
                        <Power className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Enable</span>
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(key.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
