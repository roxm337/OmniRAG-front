"use client";

import { useEffect } from "react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextIngestForm } from "@/components/knowledge/text-ingest-form";
import { FileIngestForm } from "@/components/knowledge/file-ingest-form";
import { RetrieveForm } from "@/components/knowledge/retrieve-form";

export default function KnowledgePage() {
  const { apiBaseUrl, adminToken, bots, currentBotId, setCurrentBotId, setBots } = useAppStore();

  useEffect(() => {
    if (!adminToken || bots.length > 0) return;
    listBots(apiBaseUrl, adminToken)
      .then((res) => setBots(res.bots))
      .catch(() => {});
  }, [adminToken, apiBaseUrl, bots.length, setBots]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Knowledge Base</h2>
        <p className="text-muted-foreground">
          Index text, files, and PDFs into the vector store. Search indexed content.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Target Bot</CardTitle>
          <CardDescription>Choose which bot receives ingested data and retrieval queries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Bot</Label>
            <Select
              value={currentBotId || ""}
              onValueChange={setCurrentBotId}
              disabled={bots.length === 0}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder={bots.length === 0 ? "No bots available" : "Select a bot"} />
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

      <Tabs defaultValue="text" className="space-y-4">
        <TabsList>
          <TabsTrigger value="text">Ingest Text</TabsTrigger>
          <TabsTrigger value="file">Upload File</TabsTrigger>
          <TabsTrigger value="retrieve">Retrieve</TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>Ingest Text</CardTitle>
              <CardDescription>Chunk, embed, and store text in Qdrant</CardDescription>
            </CardHeader>
            <CardContent>
              <TextIngestForm botId={currentBotId || undefined} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
              <CardDescription>Upload TXT or PDF files for indexing</CardDescription>
            </CardHeader>
            <CardContent>
              <FileIngestForm botId={currentBotId || undefined} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retrieve">
          <Card>
            <CardHeader>
              <CardTitle>Vector Retrieve</CardTitle>
              <CardDescription>Similarity search across indexed documents</CardDescription>
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
