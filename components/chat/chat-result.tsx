"use client";

import type { ChatResponse } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CopyButton } from "@/components/shared/copy-button";
import { SourceChunkCard } from "@/components/shared/source-chunk-card";

interface ChatResultProps {
  result: ChatResponse;
}

export function ChatResult({ result }: ChatResultProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Answer</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{result.provider_used}</Badge>
            <Badge variant="outline">{result.bot_id}</Badge>
            <CopyButton text={result.answer} label="answer" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.answer}</p>

        {result.sources.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">
              Sources ({result.sources.length})
            </h4>
            <ScrollArea className="h-[280px]">
              <div className="space-y-2 pr-4">
                {result.sources.map((source) => (
                  <SourceChunkCard
                    key={`${source.doc_id}:${source.chunk_id}`}
                    chunk={source}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
