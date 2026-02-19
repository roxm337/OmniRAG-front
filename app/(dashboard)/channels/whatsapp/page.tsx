"use client";

import { useState } from "react";
import { Bot as BotIcon } from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";
import { WhatsAppConfigManager } from "@/components/bots/whatsapp-config";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WhatsAppChannelPage() {
  const { bots, currentBotId } = useAppStore();
  const [selectedBotId, setSelectedBotId] = useState(currentBotId || "");

  const selectedBot = bots.find((b) => b.id === selectedBotId);

  if (bots.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-semibold">WhatsApp Integration</h1>
          <p className="text-sm text-muted-foreground">
            No bots available. Create a bot first to configure WhatsApp integration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold">WhatsApp Integration</h1>
        <p className="text-sm text-muted-foreground">
          Select a bot and configure its WhatsApp connection via WasenderAPI.
        </p>
      </div>

      {/* Bot Selector */}
      <div className="space-y-2 max-w-sm">
        <Label className="flex items-center gap-2">
          <BotIcon className="h-4 w-4" />
          Link to Bot
        </Label>
        <Select value={selectedBotId} onValueChange={setSelectedBotId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a bot..." />
          </SelectTrigger>
          <SelectContent>
            {bots.map((bot) => (
              <SelectItem key={bot.id} value={bot.id}>
                <span className="flex items-center gap-2">
                  {bot.name}
                  {bot.has_whatsapp && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0 text-emerald-600 border-emerald-600">
                      WA
                    </Badge>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* WhatsApp Config for selected bot */}
      {selectedBot ? (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Configuring WhatsApp for: <span className="font-medium text-foreground">{selectedBot.name}</span>
          </p>
          <WhatsAppConfigManager key={selectedBotId} botId={selectedBotId} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Select a bot above to configure WhatsApp.
        </p>
      )}
    </div>
  );
}
