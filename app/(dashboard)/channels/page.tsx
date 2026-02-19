"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const channels = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Connect your bot to WhatsApp via WasenderAPI. Incoming messages are answered using RAG.",
    href: "/channels/whatsapp",
    icon: MessageCircle,
    status: "available" as const,
  },
];

export default function ChannelsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold">Channels</h1>
        <p className="text-sm text-muted-foreground">
          Connect your bots to messaging platforms.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((ch) => (
          <Link key={ch.id} href={ch.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-3">
                <ch.icon className="h-6 w-6 text-green-600" />
                <CardTitle className="text-base">{ch.name}</CardTitle>
                <Badge variant="outline" className="ml-auto">
                  {ch.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{ch.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
