"use client";

import type { ChatDbResponse } from "@/lib/types";
import { safeJson } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import { SourceChunkCard } from "@/components/shared/source-chunk-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SqlResultDisplayProps {
  result: ChatDbResponse;
}

export function SqlResultDisplay({ result }: SqlResultDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{result.provider_used}</Badge>
        <Badge variant="outline">{result.bot_id}</Badge>
        <Badge variant="outline">confidence: {result.confidence.toFixed(2)}</Badge>
        <Badge variant="outline">rows: {result.rows_returned}</Badge>
        <CopyButton text={result.sql} label="SQL" />
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">SQL</h4>
        <pre className="rounded-lg bg-slate-900 text-slate-50 p-4 overflow-x-auto text-xs font-mono">
          {result.sql}
        </pre>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-1">Explanation</h4>
        <p className="text-sm text-muted-foreground">{result.explanation}</p>
      </div>

      {result.columns.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Results</h4>
          <div className="rounded-lg border overflow-hidden">
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {result.columns.map((col) => (
                      <TableHead key={col} className="text-xs uppercase whitespace-nowrap">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.rows.map((row, idx) => (
                    <TableRow key={idx}>
                      {result.columns.map((col) => (
                        <TableCell key={`${idx}:${col}`} className="text-sm whitespace-nowrap">
                          {String(row[col] ?? "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold mb-2">Audit</h4>
        <pre className="rounded-lg bg-slate-900 text-slate-50 p-4 overflow-x-auto text-xs font-mono">
          {safeJson(result.audit)}
        </pre>
      </div>

      {result.sources.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Schema Sources</h4>
          <ScrollArea className="h-[250px]">
            <div className="space-y-2 pr-4">
              {result.sources.map((source) => (
                <SourceChunkCard key={`${source.doc_id}:${source.chunk_id}`} chunk={source} />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
