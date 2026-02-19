"use client";

import type { SourceChunk } from "@/lib/types";
import { sourceLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SourceChunkCardProps {
  chunk: SourceChunk;
}

export function SourceChunkCard({ chunk }: SourceChunkCardProps) {
  return (
    <div className="rounded-lg border bg-card p-3 text-sm">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="font-semibold text-xs text-muted-foreground truncate">
          {sourceLabel(chunk)}
        </span>
        {chunk.score != null && (
          <Badge variant="outline" className="text-xs shrink-0">
            {chunk.score.toFixed(4)}
          </Badge>
        )}
      </div>
      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-xs">
        {chunk.text}
      </p>
    </div>
  );
}
