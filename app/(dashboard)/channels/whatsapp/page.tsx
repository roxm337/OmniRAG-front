"use client";

import { useState } from "react";
import { ArrowLeft, Bot as BotIcon, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { WhatsAppConfigManager } from "@/components/bots/whatsapp-config";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WhatsAppChannelPage() {
  const router = useRouter();
  const { bots, currentBotId } = useAppStore();
  const [selectedBotId, setSelectedBotId] = useState(currentBotId || "");

  const selectedBot = bots.find((b) => b.id === selectedBotId);

  if (bots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-5 mb-5">
          <MessageCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2">
          WhatsApp Integration
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          No bots available. Create a bot first to configure WhatsApp
          integration.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 gap-2"
          onClick={() => router.push("/bots")}
        >
          <BotIcon className="h-4 w-4" />
          Go to Bots
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/channels")}
          className="rounded-full h-9 w-9 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="rounded-xl bg-green-100 dark:bg-green-900/30 p-3">
          <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            WhatsApp Integration
          </h2>
          <p className="text-sm text-muted-foreground">
            Select a bot and configure its WhatsApp connection via WasenderAPI
          </p>
        </div>
      </div>

      {/* Bot Selector */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="rounded-lg bg-cyan-100 dark:bg-cyan-900/30 p-2">
              <BotIcon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            Link to Bot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-md">
            <Label className="text-xs font-medium">Bot</Label>
            <Select value={selectedBotId} onValueChange={setSelectedBotId}>
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Select a bot..." />
              </SelectTrigger>
              <SelectContent>
                {bots.map((bot) => (
                  <SelectItem key={bot.id} value={bot.id}>
                    <span className="flex items-center gap-2">
                      {bot.name}
                      {bot.has_whatsapp && (
                        <Badge
                          variant="outline"
                          className="text-xs px-1.5 py-0 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                        >
                          WA
                        </Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBot && (
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="text-xs font-medium">
                  {selectedBot.provider}
                </Badge>
                <Badge variant="outline" className="text-xs font-mono">
                  {selectedBot.id.slice(0, 8)}...
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Config */}
      {selectedBot ? (
        <div className="animate-scale-in">
          <WhatsAppConfigManager key={selectedBotId} botId={selectedBotId} />
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-muted p-4 mb-3">
                <MessageCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                No bot selected
              </p>
              <p className="text-xs text-muted-foreground">
                Select a bot above to configure WhatsApp
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
