export type LlmProvider = "deepseek" | "groq";

export interface HealthResponse {
  status: string;
  collection: string;
  vector_size: number;
  bots: number;
}

export interface IngestResponse {
  doc_id: string;
  chunks: number;
  bot_id: string;
}

export interface SourceChunk {
  doc_id: string;
  doc_name: string;
  chunk_id: number;
  text: string;
  score?: number | null;
}

export interface RetrieveResponse {
  bot_id: string;
  results: SourceChunk[];
}

export interface ChatResponse {
  bot_id: string;
  answer: string;
  provider_used: LlmProvider;
  sources: SourceChunk[];
}

export interface DbSchemaIngestResponse {
  bot_id: string;
  doc_id: string;
  chunks: number;
  allowlist_tables: string[];
}

export interface ChatDbResponse {
  bot_id: string;
  sql: string;
  explanation: string;
  confidence: number;
  provider_used: LlmProvider;
  tables_used: string[];
  columns: string[];
  rows: Record<string, unknown>[];
  rows_returned: number;
  audit: Record<string, unknown>;
  sources: SourceChunk[];
}

export interface ActionEvent {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  status: "ok" | "error";
}

export interface AdminUser {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

export interface AdminLoginResponse {
  token: string;
  expires_at: string;
  user: AdminUser;
}

export interface Bot {
  id: string;
  name: string;
  description: string | null;
  provider: LlmProvider;
  temperature: number;
  top_k: number;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  has_db_config: boolean;
  allowlist_tables: string[];
  schema_doc_id: string | null;
  has_whatsapp: boolean;
}

export interface BotListResponse {
  bots: Bot[];
}

export interface IngestHistoryItem {
  doc_id: string;
  doc_name: string;
  doc_type: string;
  chunks: number;
  created_at: string;
}

export interface ChatHistoryItem {
  mode: string;
  query: string;
  answer: string | null;
  provider_used: string;
  tables_used: string[];
  created_at: string;
}

export interface BotHistoryResponse {
  bot_id: string;
  ingestions: IngestHistoryItem[];
  chats: ChatHistoryItem[];
}

export interface PlatformLogItem {
  level: string;
  event_type: string;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PlatformLogResponse {
  logs: PlatformLogItem[];
}

// ── API Keys ─────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  bot_id: string;
  key_prefix: string;
  name: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

export interface ApiKeyCreated extends ApiKey {
  key: string;
}

export interface ApiKeyListResponse {
  api_keys: ApiKey[];
}

// ── Widget Config ────────────────────────────────────────────────

export interface WidgetConfig {
  bot_id: string;
  title: string;
  subtitle: string;
  primary_color: string;
  position: string;
  allowed_origins: string;
  welcome_message: string;
  placeholder: string;
  created_at: string;
  updated_at: string;
}

export interface WidgetEmbedCode {
  bot_id: string;
  embed_code: string;
}

// ── WhatsApp Config ─────────────────────────────────────────────

export interface WhatsAppConfig {
  bot_id: string;
  phone_label: string;
  is_active: boolean;
  has_api_key: boolean;
  has_webhook_secret: boolean;
  created_at: string;
  updated_at: string;
}

// ── Streaming ────────────────────────────────────────────────────

export interface StreamEvent {
  token: string;
  done: boolean;
  answer?: string;
  sources?: SourceChunk[];
  bot_id?: string;
  provider_used?: LlmProvider;
  error?: string;
}
