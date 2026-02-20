"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Mail,
  MessageCircle,
  Radio,
  Slack,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const channels = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    description:
      "Connect your bot to WhatsApp via WasenderAPI. Incoming messages are answered using RAG.",
    href: "/channels/whatsapp",
    icon: MessageCircle,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    status: "available" as const,
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Integrate your bot into Slack workspaces. Respond to messages and slash commands.",
    href: "#",
    icon: Slack,
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    status: "coming soon" as const,
  },
  {
    id: "email",
    name: "Email",
    description:
      "Auto-reply to incoming emails with RAG-powered answers from your knowledge base.",
    href: "#",
    icon: Mail,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    status: "coming soon" as const,
  },
];

const statusStyles: Record<string, string> = {
  available:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  "coming soon":
    "bg-muted text-muted-foreground",
};

export default function ChannelsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <Radio className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Channels</h2>
          <p className="text-sm text-muted-foreground">
            Connect your bots to messaging platforms and external services
          </p>
        </div>
      </div>

      {/* Channel Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 stagger-children">
        {channels.map((ch) => {
          const isAvailable = ch.status === "available";
          return (
            <Link
              key={ch.id}
              href={ch.href}
              className={!isAvailable ? "pointer-events-none" : ""}
            >
              <Card
                className={`group h-full transition-all duration-200 ${
                  isAvailable
                    ? "cursor-pointer hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30"
                    : "opacity-60"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2.5 transition-transform duration-200 ${
                          isAvailable ? "group-hover:scale-110" : ""
                        } ${ch.iconBg}`}
                      >
                        <ch.icon className={`h-5 w-5 ${ch.iconColor}`} />
                      </div>
                      <CardTitle className="text-base">{ch.name}</CardTitle>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 ${statusStyles[ch.status] ?? ""}`}
                    >
                      {ch.status === "available" && (
                        <span className="relative flex h-1.5 w-1.5 mr-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                      )}
                      {ch.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {ch.description}
                  </p>
                  {isAvailable && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-1">
                      Configure
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
