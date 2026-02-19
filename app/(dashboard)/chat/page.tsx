"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChatForm } from "@/components/chat/chat-form";
import { useAppStore } from "@/lib/store/app-store";

export default function ChatPage() {
  const { bots, currentBotId } = useAppStore();
  const currentBot = bots.find((b) => b.id === currentBotId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">RAG Chat</h2>
        <p className="text-muted-foreground">
          Ask questions and get answers from your indexed documents with citations.
          {currentBot && (
            <span className="ml-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {currentBot.name}
            </span>
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
          <CardDescription>Select a bot and start chatting with context-aware QA</CardDescription>
        </CardHeader>
        <CardContent>
          <ChatForm />
        </CardContent>
      </Card>
    </div>
  );
}
