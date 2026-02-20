"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Check,
  Copy,
  Loader2,
  MessageCircle,
  Save,
  Trash2,
} from "lucide-react";
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

      if (!apiKey && hasApiKey) {
        toast.error(
          "Please re-enter the API key (credentials are not returned for security)"
        );
        setSaving(false);
        return;
      }
      if (!webhookSecret && hasWebhookSecret) {
        toast.error(
          "Please re-enter the webhook secret (credentials are not returned for security)"
        );
        setSaving(false);
        return;
      }

      payload.wasender_api_key = apiKey;
      payload.webhook_secret = webhookSecret;

      const res = await upsertWhatsAppConfig(
        apiBaseUrl,
        adminToken,
        botId,
        payload
      );
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
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Main Config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              WhatsApp Integration
            </span>
            {exists ? (
              <Badge
                className={`text-xs gap-1.5 ${
                  isActive
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : ""
                }`}
                variant={isActive ? "default" : "secondary"}
              >
                {isActive && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                  </span>
                )}
                {isActive ? "Connected" : "Inactive"}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                Not configured
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Connect this bot to WhatsApp via WasenderAPI. Messages received on
            your WhatsApp number will be answered using the bot&apos;s RAG
            knowledge base.
          </p>

          {/* Webhook URL */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="font-mono text-xs bg-muted/40"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={copyWebhookUrl}
                className="shrink-0 gap-1.5 transition-all duration-200"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Paste this URL in your WasenderAPI webhook settings.
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">WasenderAPI Key</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                hasApiKey
                  ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022  (re-enter to update)"
                  : "Enter your WasenderAPI key"
              }
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Webhook Secret */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Webhook Secret</Label>
            <Input
              type="password"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder={
                hasWebhookSecret
                  ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022  (re-enter to update)"
                  : "Enter your webhook verification secret"
              }
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Phone Label */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Phone Label</Label>
            <Input
              value={phoneLabel}
              onChange={(e) => setPhoneLabel(e.target.value)}
              placeholder="e.g. +1 234 567 8900 or Sales Line"
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground">
              A display name for this WhatsApp number (optional).
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-muted peer-checked:bg-emerald-500 transition-colors duration-200" />
                <div className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
              </div>
              <div>
                <span className="text-sm font-medium">Active</span>
                <p className="text-xs text-muted-foreground">
                  When inactive, incoming WhatsApp messages will be ignored.
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="transition-all duration-200"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {exists ? "Update Configuration" : "Save Configuration"}
            </Button>
            {exists && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleting}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
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
          <CardTitle className="text-base flex items-center gap-2">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Setup Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-muted-foreground">
            {[
              "Create an account on WasenderAPI and connect your WhatsApp number.",
              "Copy your API key and webhook secret from the WasenderAPI dashboard.",
              "Paste them above and save the configuration.",
              "In WasenderAPI settings, set the webhook URL to the one shown above.",
              "Make sure this bot has ingested documents in the Knowledge Base.",
              "Send a WhatsApp message to your connected number to test!",
            ].map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {idx + 1}
                </span>
                <span className="pt-0.5 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
