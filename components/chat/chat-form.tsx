"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot as BotIcon, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

import { useAppStore } from "@/lib/store/app-store";
import { chatStream, listBots } from "@/lib/api";
import type { LlmProvider, SourceChunk } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProviderSelect } from "@/components/shared/provider-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  sources?: SourceChunk[];
  providerUsed?: LlmProvider;
  botId?: string;
  streaming?: boolean;
}

export function ChatForm() {
  const { apiBaseUrl, adminToken, bots, currentBotId, setCurrentBotId, setBots, addEvent } = useAppStore();
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(5);
  const [providerMode, setProviderMode] = useState<"default" | LlmProvider>("default");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adminToken) return;
    if (bots.length > 0) return;
    listBots(apiBaseUrl, adminToken)
      .then((res) => setBots(res.bots))
      .catch(() => {});
  }, [adminToken, apiBaseUrl, bots.length, setBots]);

  function scrollToBottom() {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q || busy) return;
    if (!adminToken) {
      toast.error("Login required");
      return;
    }

    setBusy(true);
    setQuery("");

    const userMsg: ChatMessage = { role: "user", text: q };
    const assistantMsg: ChatMessage = { role: "assistant", text: "", streaming: true };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    scrollToBottom();

    try {
      const provider = providerMode === "default" ? undefined : providerMode;
      let fullAnswer = "";
      let finalSources: SourceChunk[] = [];
      let finalProvider: LlmProvider | undefined;
      let finalBotId: string | undefined;

      for await (const event of chatStream(
        apiBaseUrl,
        { bot_id: currentBotId || undefined, query: q, top_k: topK, provider },
        adminToken,
      )) {
        if (event.error) {
          throw new Error(event.error);
        }
        if (!event.done) {
          fullAnswer += event.token;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              text: fullAnswer,
            };
            return updated;
          });
          scrollToBottom();
        } else {
          finalSources = event.sources || [];
          finalProvider = event.provider_used;
          finalBotId = event.bot_id;
          if (event.answer) fullAnswer = event.answer;
        }
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          text: fullAnswer,
          sources: finalSources,
          providerUsed: finalProvider,
          botId: finalBotId,
          streaming: false,
        };
        return updated;
      });

      addEvent("chat", `Streamed answer with ${finalProvider || "unknown"} on bot ${finalBotId || currentBotId}`, "ok");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          text: `Error: ${msg}`,
          streaming: false,
        };
        return updated;
      });
      addEvent("chat", msg, "error");
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Chat messages */}
      {messages.length > 0 && (
        <div className="space-y-4 max-h-[500px] overflow-y-auto rounded-lg border p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap">
                  {msg.text}
                  {msg.streaming && <span className="animate-pulse ml-0.5">|</span>}
                </p>
                {!msg.streaming && msg.sources && msg.sources.length > 0 && (
                  <details className="mt-2 text-xs opacity-70">
                    <summary className="cursor-pointer">{msg.sources.length} source(s)</summary>
                    <ul className="mt-1 space-y-1">
                      {msg.sources.map((s) => (
                        <li key={`${s.doc_id}:${s.chunk_id}`}>
                          {s.doc_name} #{s.chunk_id}
                          {s.score != null && ` (${(s.score * 100).toFixed(0)}%)`}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Question</Label>
          <Textarea
            rows={3}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do the indexed documents say about...?"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Bot</Label>
            <Select value={currentBotId || ""} onValueChange={setCurrentBotId}>
              <SelectTrigger className="w-full">
                <BotIcon className="mr-2 h-4 w-4 shrink-0" />
                <SelectValue placeholder="Select a bot" />
              </SelectTrigger>
              <SelectContent>
                {bots.map((bot) => (
                  <SelectItem key={bot.id} value={bot.id}>
                    {bot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Top K</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-2">
            <Label>Provider</Label>
            <ProviderSelect value={providerMode} onChange={setProviderMode} />
          </div>
        </div>
        <Button type="submit" disabled={busy || !query.trim()}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
          {busy ? "Streaming..." : "Ask RAG (Streaming)"}
        </Button>
      </form>
    </div>
  );
}
