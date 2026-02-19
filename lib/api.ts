import type {
  AdminLoginResponse,
  AdminUser,
  ApiKey,
  ApiKeyCreated,
  ApiKeyListResponse,
  Bot,
  BotHistoryResponse,
  BotListResponse,
  ChatDbResponse,
  ChatResponse,
  DbSchemaIngestResponse,
  HealthResponse,
  IngestResponse,
  LlmProvider,
  PlatformLogResponse,
  RetrieveResponse,
  StreamEvent,
  WhatsAppConfig,
  WidgetConfig,
  WidgetEmbedCode,
} from "@/lib/types";

interface RequestInitExtended extends RequestInit {
  timeoutMs?: number;
  adminToken?: string;
}

function withAdminHeader(headers: Headers, adminToken?: string) {
  if (adminToken) {
    headers.set("X-Admin-Token", adminToken);
  }
}

async function request<T>(
  baseUrl: string,
  path: string,
  options: RequestInitExtended = {},
): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 60000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const headers = new Headers(options.headers);
  withAdminHeader(headers, options.adminToken);
  const hasBody = options.body !== undefined;
  if (hasBody && !headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const detail =
        typeof payload === "object" && payload && "detail" in payload
          ? String((payload as { detail?: string }).detail ?? "Request failed")
          : String(payload || "Request failed");
      throw new Error(detail);
    }

    return payload as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function getHealth(baseUrl: string, adminToken?: string) {
  return request<HealthResponse>(baseUrl, "/health", { method: "GET", timeoutMs: 15000, adminToken });
}

export function adminLogin(baseUrl: string, payload: { username: string; password: string }) {
  return request<AdminLoginResponse>(baseUrl, "/v1/admin/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function adminMe(baseUrl: string, adminToken: string) {
  return request<AdminUser>(baseUrl, "/v1/admin/me", {
    method: "GET",
    adminToken,
  });
}

export function listBots(baseUrl: string, adminToken: string) {
  return request<BotListResponse>(baseUrl, "/v1/bots", {
    method: "GET",
    adminToken,
  });
}

export function createBot(
  baseUrl: string,
  adminToken: string,
  payload: {
    name: string;
    description?: string;
    provider: LlmProvider;
    temperature: number;
    top_k: number;
  },
) {
  return request<Bot>(baseUrl, "/v1/bots", {
    method: "POST",
    adminToken,
    body: JSON.stringify(payload),
  });
}

export function updateBot(
  baseUrl: string,
  adminToken: string,
  botId: string,
  payload: {
    name?: string;
    description?: string;
    provider?: LlmProvider;
    temperature?: number;
    top_k?: number;
  },
) {
  return request<Bot>(baseUrl, `/v1/bots/${botId}`, {
    method: "PATCH",
    adminToken,
    body: JSON.stringify(payload),
  });
}

export function deleteBot(baseUrl: string, adminToken: string, botId: string) {
  return request<{ status: string }>(baseUrl, `/v1/bots/${botId}`, {
    method: "DELETE",
    adminToken,
  });
}

export function getBotHistory(baseUrl: string, adminToken: string, botId: string, limit = 100) {
  return request<BotHistoryResponse>(baseUrl, `/v1/bots/${botId}/history?limit=${limit}`, {
    method: "GET",
    adminToken,
  });
}

export function getPlatformLogs(baseUrl: string, adminToken: string, limit = 200) {
  return request<PlatformLogResponse>(baseUrl, `/v1/platform/logs?limit=${limit}`, {
    method: "GET",
    adminToken,
  });
}

export function ingestText(
  baseUrl: string,
  payload: { bot_id?: string; text: string; doc_name?: string },
  adminToken?: string,
) {
  return request<IngestResponse>(baseUrl, "/v1/ingest/text", {
    method: "POST",
    adminToken,
    body: JSON.stringify(payload),
  });
}

export function ingestFile(baseUrl: string, file: File, botId?: string, adminToken?: string) {
  const formData = new FormData();
  formData.append("file", file);
  const query = botId ? `?bot_id=${encodeURIComponent(botId)}` : "";
  return request<IngestResponse>(baseUrl, `/v1/ingest/file${query}`, {
    method: "POST",
    adminToken,
    body: formData,
  });
}

export function ingestDbSchema(
  baseUrl: string,
  payload: { bot_id?: string; database_url: string; allowlist_tables: string[] },
  adminToken?: string,
) {
  return request<DbSchemaIngestResponse>(baseUrl, "/v1/ingest/db/schema", {
    method: "POST",
    adminToken,
    body: JSON.stringify(payload),
    timeoutMs: 90000,
  });
}

export function retrieve(
  baseUrl: string,
  payload: { bot_id?: string; query: string; top_k?: number; doc_id?: string },
  adminToken?: string,
) {
  return request<RetrieveResponse>(baseUrl, "/v1/retrieve", {
    method: "POST",
    adminToken,
    body: JSON.stringify(payload),
  });
}

export function chat(
  baseUrl: string,
  payload: { bot_id?: string; query: string; top_k?: number; provider?: LlmProvider },
  adminToken?: string,
) {
  return request<ChatResponse>(baseUrl, "/v1/chat", {
    method: "POST",
    adminToken,
    body: JSON.stringify(payload),
    timeoutMs: 90000,
  });
}

export function chatDb(
  baseUrl: string,
  payload: { bot_id?: string; query: string; provider?: LlmProvider; top_k?: number },
  adminToken?: string,
) {
  return request<ChatDbResponse>(baseUrl, "/v1/chat/db", {
    method: "POST",
    adminToken,
    body: JSON.stringify(payload),
    timeoutMs: 90000,
  });
}

// ── Streaming Chat ───────────────────────────────────────────────

export async function* chatStream(
  baseUrl: string,
  payload: { bot_id?: string; query: string; top_k?: number; provider?: LlmProvider },
  adminToken?: string,
): AsyncGenerator<StreamEvent> {
  const url = `${baseUrl.replace(/\/$/, "")}/v1/chat/stream`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (adminToken) headers["X-Admin-Token"] = adminToken;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Stream request failed");
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      try {
        yield JSON.parse(trimmed.slice(6)) as StreamEvent;
      } catch {
        // skip malformed events
      }
    }
  }
}

// ── API Keys ─────────────────────────────────────────────────────

export function createApiKey(baseUrl: string, adminToken: string, botId: string, name: string) {
  return request<ApiKeyCreated>(baseUrl, `/v1/bots/${botId}/api-keys`, {
    method: "POST",
    adminToken,
    body: JSON.stringify({ name }),
  });
}

export function listApiKeys(baseUrl: string, adminToken: string, botId: string) {
  return request<ApiKeyListResponse>(baseUrl, `/v1/bots/${botId}/api-keys`, {
    method: "GET",
    adminToken,
  });
}

export function updateApiKey(baseUrl: string, adminToken: string, botId: string, keyId: string, isActive: boolean) {
  return request<ApiKey>(baseUrl, `/v1/bots/${botId}/api-keys/${keyId}`, {
    method: "PATCH",
    adminToken,
    body: JSON.stringify({ is_active: isActive }),
  });
}

export function deleteApiKey(baseUrl: string, adminToken: string, botId: string, keyId: string) {
  return request<{ status: string }>(baseUrl, `/v1/bots/${botId}/api-keys/${keyId}`, {
    method: "DELETE",
    adminToken,
  });
}

// ── Widget Config ────────────────────────────────────────────────

export function getWidgetConfig(baseUrl: string, adminToken: string, botId: string) {
  return request<WidgetConfig>(baseUrl, `/v1/bots/${botId}/widget`, {
    method: "GET",
    adminToken,
  });
}

export function updateWidgetConfig(
  baseUrl: string,
  adminToken: string,
  botId: string,
  payload: Partial<Omit<WidgetConfig, "bot_id" | "created_at" | "updated_at">>,
) {
  return request<WidgetConfig>(baseUrl, `/v1/bots/${botId}/widget`, {
    method: "PUT",
    adminToken,
    body: JSON.stringify(payload),
  });
}

export function getWidgetEmbedCode(baseUrl: string, adminToken: string, botId: string) {
  return request<WidgetEmbedCode>(baseUrl, `/v1/bots/${botId}/widget/embed-code`, {
    method: "GET",
    adminToken,
  });
}

// ── WhatsApp Config ─────────────────────────────────────────────

export function getWhatsAppConfig(baseUrl: string, adminToken: string, botId: string) {
  return request<WhatsAppConfig>(baseUrl, `/v1/bots/${botId}/whatsapp`, {
    method: "GET",
    adminToken,
  });
}

export function upsertWhatsAppConfig(
  baseUrl: string,
  adminToken: string,
  botId: string,
  payload: {
    wasender_api_key: string;
    webhook_secret: string;
    phone_label?: string;
    is_active?: boolean;
  },
) {
  return request<WhatsAppConfig>(baseUrl, `/v1/bots/${botId}/whatsapp`, {
    method: "PUT",
    adminToken,
    body: JSON.stringify(payload),
  });
}

export function deleteWhatsAppConfig(baseUrl: string, adminToken: string, botId: string) {
  return request<{ status: string }>(baseUrl, `/v1/bots/${botId}/whatsapp`, {
    method: "DELETE",
    adminToken,
  });
}
