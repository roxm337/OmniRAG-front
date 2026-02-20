"use client";

import { FileText } from "lucide-react";
import type { SourceChunk } from "@/lib/types";
import { sourceLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SourceChunkCardProps {
  chunk: SourceChunk;
}

export function SourceChunkCard({ chunk }: SourceChunkCardProps) {
  const score = chunk.score;
  const scorePercent = score != null ? Math.round(score * 100) : null;
  const scoreColor =
    scorePercent != null
      ? scorePercent >= 80
        ? "text-emerald-600 dark:text-emerald-400"
        : scorePercent >= 50
          ? "text-amber-600 dark:text-amber-400"
          : "text-red-500 dark:text-red-400"
      : "";
  const barColor =
    scorePercent != null
      ? scorePercent >= 80
        ? "bg-emerald-500"
        : scorePercent >= 50
          ? "bg-amber-500"
          : "bg-red-500"
      : "";

  return (
    <div className="group rounded-xl border bg-card p-4 transition-all duration-150 hover:shadow-sm hover:bg-accent/30">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="rounded-md bg-muted p-1 shrink-0">
            <FileText className="h-3 w-3 text-muted-foreground" />
          </div>
          <span className="font-medium text-xs text-muted-foreground truncate">
            {sourceLabel(chunk)}
          </span>
        </div>
        {score != null && (
          <div className="flex items-center gap-2 shrink-0">
            {/* Score bar */}
            <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-mono tabular-nums ${scoreColor}`}
            >
              {score.toFixed(4)}
            </Badge>
          </div>
        )}
      </div>
      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-xs">
        {chunk.text}
      </p>
    </div>
  );
}
