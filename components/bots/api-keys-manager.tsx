"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Key, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import { createApiKey, deleteApiKey, listApiKeys, updateApiKey } from "@/lib/api";
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
      const res = await createApiKey(apiBaseUrl, adminToken, botId, newKeyName.trim());
      setCreatedKey(res.key);
      setNewKeyName("");
      await fetchKeys();
      toast.success("API key created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create key");
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
          <Key className="h-4 w-4" /> API Keys
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create new key */}
        <div className="flex gap-2">
          <Input
            placeholder="Key name (e.g. Production)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={creating || !newKeyName.trim()} size="sm">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {/* Show newly created key */}
        {createdKey && (
          <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 p-3 space-y-2">
            <p className="text-xs font-medium text-green-800 dark:text-green-200">
              Copy this key now - it won&apos;t be shown again!
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-white dark:bg-gray-800 rounded p-2 font-mono break-all">
                {createdKey}
              </code>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(createdKey)}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setCreatedKey(null)} className="text-xs">
              Dismiss
            </Button>
          </div>
        )}

        {/* Key list */}
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : keys.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No API keys yet. Create one to integrate with external apps.
          </p>
        ) : (
          <div className="space-y-2">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{key.name}</span>
                    <Badge variant={key.is_active ? "default" : "secondary"}>
                      {key.is_active ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {key.key_prefix}...
                    {key.last_used_at && (
                      <span className="ml-2">
                        Last used: {new Date(key.last_used_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggle(key)}
                  >
                    {key.is_active ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDelete(key.id)}
                  >
                    <Trash2 className="h-3 w-3" />
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
