"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Code,
  Copy,
  ExternalLink,
  Loader2,
  Palette,
  Play,
  RefreshCw,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import {
  createApiKey,
  getBotHistory,
  getWidgetConfig,
  getWidgetEmbedCode,
  updateWidgetConfig,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface WidgetConfigManagerProps {
  botId: string;
}

export function WidgetConfigManager({ botId }: WidgetConfigManagerProps) {
  const { apiBaseUrl, adminToken } = useAppStore();
  const [embedCode, setEmbedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("Chat Assistant");
  const [subtitle, setSubtitle] = useState("Ask me anything");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [position, setPosition] = useState("bottom-right");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hello! How can I help you today?"
  );
  const [placeholder, setPlaceholder] = useState("Type your message...");
  const [allowedOrigins, setAllowedOrigins] = useState("*");

  // Preview state
  const [previewActive, setPreviewActive] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewKeysByBotRef = useRef<Record<string, string>>({});

  const fetchConfig = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const res = await getWidgetConfig(apiBaseUrl, adminToken, botId);
      setTitle(res.title);
      setSubtitle(res.subtitle);
      setPrimaryColor(res.primary_color);
      setPosition(res.position);
      setWelcomeMessage(res.welcome_message);
      setPlaceholder(res.placeholder);
      setAllowedOrigins(res.allowed_origins);
    } catch {
      // Widget config may not exist yet, that's ok
    } finally {
      setLoading(false);
    }
  }, [adminToken, apiBaseUrl, botId]);

  const fetchEmbedCode = useCallback(async () => {
    if (!adminToken) return;
    try {
      const res = await getWidgetEmbedCode(apiBaseUrl, adminToken, botId);
      setEmbedCode(res.embed_code);
    } catch {
      // ignore
    }
  }, [adminToken, apiBaseUrl, botId]);

  useEffect(() => {
    void fetchConfig();
    void fetchEmbedCode();
  }, [fetchConfig, fetchEmbedCode]);

  useEffect(() => {
    setPreviewActive(false);
    setPreviewUrl(null);
  }, [botId]);


  async function handleSave() {
    if (!adminToken) return;
    setSaving(true);
    try {
      const res = await updateWidgetConfig(apiBaseUrl, adminToken, botId, {
        title,
        subtitle,
        primary_color: primaryColor,
        position,
        welcome_message: welcomeMessage,
        placeholder,
        allowed_origins: allowedOrigins,
      });
      setTitle(res.title);
      setSubtitle(res.subtitle);
      setPrimaryColor(res.primary_color);
      setPosition(res.position);
      setWelcomeMessage(res.welcome_message);
      setPlaceholder(res.placeholder);
      setAllowedOrigins(res.allowed_origins);
      toast.success("Widget config saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  async function getOrCreatePreviewKey(): Promise<string | null> {
    if (!adminToken) return null;
    try {
      const cachedKey = previewKeysByBotRef.current[botId];
      if (cachedKey) return cachedKey;

      const created = await createApiKey(
        apiBaseUrl,
        adminToken,
        botId,
        "Widget Preview"
      );
      previewKeysByBotRef.current[botId] = created.key;
      return created.key;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to get API key"
      );
      return null;
    }
  }

  async function launchPreview() {
    setPreviewLoading(true);
    try {
      if (adminToken) {
        try {
          const history = await getBotHistory(apiBaseUrl, adminToken, botId, 1);
          if (history.ingestions.length === 0) {
            toast.warning("This bot has no ingested documents yet. Preview may answer: I don't know.");
          }
        } catch {
          // non-blocking
        }
      }

      const key = await getOrCreatePreviewKey();
      if (!key) {
        setPreviewLoading(false);
        return;
      }

      const baseUrl = apiBaseUrl.replace(/\/$/, "");
      const url = `${baseUrl}/v1/public/widget-preview?key=${encodeURIComponent(key)}`;
      setPreviewUrl(url);
      setPreviewActive(true);

      requestAnimationFrame(() => {
        if (iframeRef.current) {
          iframeRef.current.src = url;
        }
      });
    } finally {
      setPreviewLoading(false);
    }
  }

  function reloadPreview() {
    if (iframeRef.current && previewUrl) {
      iframeRef.current.src = "";
      requestAnimationFrame(() => {
        if (iframeRef.current && previewUrl) {
          iframeRef.current.src = previewUrl;
        }
      });
    }
  }

  function closePreview() {
    setPreviewActive(false);
    setPreviewUrl(null);
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" /> Widget Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-9 w-12 rounded border cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Welcome Message</Label>
            <Textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Input Placeholder</Label>
            <Input
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Allowed Origins</Label>
            <Input
              value={allowedOrigins}
              onChange={(e) => setAllowedOrigins(e.target.value)}
              placeholder="* or https://example.com,https://app.example.com"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of allowed origins, or * for all
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Configuration
          </Button>
        </CardContent>
      </Card>

      {/* Embed Code */}
      {embedCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Code className="h-4 w-4" /> Embed Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add this script tag to your website. You also need an API key (see
              API Keys tab).
            </p>
            <div className="relative">
              <pre className="rounded-lg bg-muted p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
                {embedCode.replace(
                  "></script>",
                  `\n  data-api-key="YOUR_API_KEY_HERE"></script>`
                )}
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() =>
                  copyToClipboard(
                    embedCode.replace(
                      "></script>",
                      ' data-api-key="YOUR_API_KEY_HERE"></script>'
                    )
                  )
                }
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" /> Live Preview
            </span>
            {previewActive ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Live
                </span>
                <Button size="sm" variant="ghost" onClick={reloadPreview}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={closePreview}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {previewActive ? (
            <div className="relative rounded-lg overflow-hidden border bg-slate-100 dark:bg-slate-800">
              <iframe
                ref={iframeRef}
                className="w-full border-0"
                style={{ height: "500px" }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                title="Widget Preview"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 py-12 px-4">
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Launch a live preview to test the chat widget directly here.
                <br />
                <span className="text-xs">
                  An API key will be auto-created if needed.
                </span>
              </p>
              <Button onClick={launchPreview} disabled={previewLoading}>
                {previewLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Launch Preview
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
