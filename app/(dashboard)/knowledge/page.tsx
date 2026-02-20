"use client";

import { useEffect } from "react";
import { BookOpen, FileText, FileUp, Search } from "lucide-react";

import { useAppStore } from "@/lib/store/app-store";
import { listBots } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { TextIngestForm } from "@/components/knowledge/text-ingest-form";
import { FileIngestForm } from "@/components/knowledge/file-ingest-form";
import { RetrieveForm } from "@/components/knowledge/retrieve-form";

export default function KnowledgePage() {
  const {
    apiBaseUrl,
    adminToken,
    bots,
    currentBotId,
    setCurrentBotId,
    setBots,
  } = useAppStore();

  const currentBot = bots.find((b) => b.id === currentBotId);

  useEffect(() => {
    if (!adminToken || bots.length > 0) return;
    listBots(apiBaseUrl, adminToken)
      .then((res) => setBots(res.bots))
      .catch(() => {});
  }, [adminToken, apiBaseUrl, bots.length, setBots]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Knowledge Base</h2>
          <p className="text-sm text-muted-foreground">
            Index text, files, and PDFs into the vector store. Search indexed
            content.
          </p>
        </div>
      </div>

      {/* Target Bot Selector */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="rounded-lg bg-cyan-100 dark:bg-cyan-900/30 p-2">
                <BookOpen className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              Target Bot
            </CardTitle>
            {currentBot && (
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="text-xs font-medium">
                  {currentBot.provider}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  top_k: {currentBot.top_k}
                </Badge>
              </div>
            )}
          </div>
          <CardDescription className="ml-12 text-xs">
            Choose which bot receives ingested data and retrieval queries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <Label className="text-xs font-medium">Bot</Label>
            <Select
              value={currentBotId || ""}
              onValueChange={setCurrentBotId}
              disabled={bots.length === 0}
            >
              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                <SelectValue
                  placeholder={
                    bots.length === 0 ? "No bots available" : "Select a bot"
                  }
                />
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
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="text" className="space-y-5">
        <TabsList className="h-auto p-1 bg-muted/60 rounded-xl">
          <TabsTrigger
            value="text"
            className="gap-2 rounded-lg px-4 py-2.5 data-[state=active]:shadow-sm transition-all duration-200"
          >
            <FileText className="h-4 w-4" />
            Ingest Text
          </TabsTrigger>
          <TabsTrigger
            value="file"
            className="gap-2 rounded-lg px-4 py-2.5 data-[state=active]:shadow-sm transition-all duration-200"
          >
            <FileUp className="h-4 w-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger
            value="retrieve"
            className="gap-2 rounded-lg px-4 py-2.5 data-[state=active]:shadow-sm transition-all duration-200"
          >
            <Search className="h-4 w-4" />
            Retrieve
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="animate-scale-in">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Ingest Text
              </CardTitle>
              <CardDescription className="ml-12 text-xs">
                Chunk, embed, and store text in Qdrant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TextIngestForm botId={currentBotId || undefined} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="file" className="animate-scale-in">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-2">
                  <FileUp className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                Upload File
              </CardTitle>
              <CardDescription className="ml-12 text-xs">
                Upload TXT or PDF files for indexing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileIngestForm botId={currentBotId || undefined} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retrieve" className="animate-scale-in">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
                  <Search className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                Vector Retrieve
              </CardTitle>
              <CardDescription className="ml-12 text-xs">
                Similarity search across indexed documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RetrieveForm botId={currentBotId || undefined} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
