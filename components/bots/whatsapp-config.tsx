"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Loader2, MessageCircle, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import {
  deleteWhatsAppConfig,
  getWhatsAppConfig,
  upsertWhatsAppConfig,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface WhatsAppConfigManagerProps {
  botId: string;
}

export function WhatsAppConfigManager({ botId }: WhatsAppConfigManagerProps) {
  const { apiBaseUrl, adminToken } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exists, setExists] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [apiKey, setApiKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [phoneLabel, setPhoneLabel] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Server state
  const [hasApiKey, setHasApiKey] = useState(false);
  const [hasWebhookSecret, setHasWebhookSecret] = useState(false);

  const webhookUrl = `${apiBaseUrl.replace(/\/$/, "")}/v1/webhook/whatsapp/${botId}`;

  const fetchConfig = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const res = await getWhatsAppConfig(apiBaseUrl, adminToken, botId);
      setExists(true);
      setPhoneLabel(res.phone_label);
      setIsActive(res.is_active);
      setHasApiKey(res.has_api_key);
      setHasWebhookSecret(res.has_webhook_secret);
    } catch {
      setExists(false);
    } finally {
      setLoading(false);
    }
  }, [adminToken, apiBaseUrl, botId]);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  async function handleSave() {
    if (!adminToken) return;
    if (!apiKey && !hasApiKey) {
      toast.error("WasenderAPI key is required");
      return;
    }
    if (!webhookSecret && !hasWebhookSecret) {
      toast.error("Webhook secret is required");
      return;
    }

    setSaving(true);
    try {
      const payload: {
        wasender_api_key: string;
        webhook_secret: string;
        phone_label: string;
        is_active: boolean;
      } = {
        wasender_api_key: apiKey || "unchanged",
        webhook_secret: webhookSecret || "unchanged",
        phone_label: phoneLabel,
        is_active: isActive,
      };

      // Only send new values if provided (backend always overwrites)
      if (!apiKey && hasApiKey) {
        // User didn't change the key, but we must send something
        // The backend will overwrite, so we need to inform user
        toast.error("Please re-enter the API key (credentials are not returned for security)");
        setSaving(false);
        return;
      }
      if (!webhookSecret && hasWebhookSecret) {
        toast.error("Please re-enter the webhook secret (credentials are not returned for security)");
        setSaving(false);
        return;
      }

      payload.wasender_api_key = apiKey;
      payload.webhook_secret = webhookSecret;

      const res = await upsertWhatsAppConfig(apiBaseUrl, adminToken, botId, payload);
      setExists(true);
      setPhoneLabel(res.phone_label);
      setIsActive(res.is_active);
      setHasApiKey(res.has_api_key);
      setHasWebhookSecret(res.has_webhook_secret);
      setApiKey("");
      setWebhookSecret("");
      toast.success("WhatsApp configuration saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!adminToken) return;
    setDeleting(true);
    try {
      await deleteWhatsAppConfig(apiBaseUrl, adminToken, botId);
      setExists(false);
      setApiKey("");
      setWebhookSecret("");
      setPhoneLabel("");
      setIsActive(true);
      setHasApiKey(false);
      setHasWebhookSecret(false);
      toast.success("WhatsApp configuration removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  function copyWebhookUrl() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("Webhook URL copied");
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> WhatsApp Integration
            </span>
            {exists ? (
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={isActive ? "bg-emerald-600" : ""}
              >
                {isActive ? "Connected" : "Inactive"}
              </Badge>
            ) : (
              <Badge variant="outline">Not configured</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect this bot to WhatsApp via WasenderAPI. Messages received on your
            WhatsApp number will be answered using the bot&apos;s RAG knowledge base.
          </p>

          {/* Webhook URL */}
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <div className="flex gap-2">
              <Input value={webhookUrl} readOnly className="font-mono text-xs" />
              <Button size="sm" variant="outline" onClick={copyWebhookUrl}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Paste this URL in your WasenderAPI webhook settings.
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label>WasenderAPI Key</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasApiKey ? "••••••••  (re-enter to update)" : "Enter your WasenderAPI key"}
            />
          </div>

          {/* Webhook Secret */}
          <div className="space-y-2">
            <Label>Webhook Secret</Label>
            <Input
              type="password"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder={hasWebhookSecret ? "••••••••  (re-enter to update)" : "Enter your webhook verification secret"}
            />
          </div>

          {/* Phone Label */}
          <div className="space-y-2">
            <Label>Phone Label</Label>
            <Input
              value={phoneLabel}
              onChange={(e) => setPhoneLabel(e.target.value)}
              placeholder="e.g. +1 234 567 8900 or Sales Line"
            />
            <p className="text-xs text-muted-foreground">
              A display name for this WhatsApp number (optional).
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">Active</span>
            </label>
            <p className="text-xs text-muted-foreground">
              When inactive, incoming WhatsApp messages will be ignored.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {exists ? "Update Configuration" : "Save Configuration"}
            </Button>
            {exists && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Remove
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Setup Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Create an account on WasenderAPI and connect your WhatsApp number.</li>
            <li>Copy your API key and webhook secret from the WasenderAPI dashboard.</li>
            <li>Paste them above and save the configuration.</li>
            <li>In WasenderAPI settings, set the webhook URL to the one shown above.</li>
            <li>Make sure this bot has ingested documents in the Knowledge Base.</li>
            <li>Send a WhatsApp message to your connected number to test!</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
