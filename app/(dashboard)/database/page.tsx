"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SchemaIngestForm } from "@/components/database/schema-ingest-form";
import { DbChatForm } from "@/components/database/db-chat-form";

export default function DatabasePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Database</h2>
        <p className="text-muted-foreground">
          Prepare schema context and run natural language SQL queries.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ingest DB Schema</CardTitle>
            <CardDescription>Enable DB Mode B - index your database schema</CardDescription>
          </CardHeader>
          <CardContent>
            <SchemaIngestForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>DB Mode B Chat</CardTitle>
            <CardDescription>RAG schema &rarr; SQL &rarr; validate &rarr; execute</CardDescription>
          </CardHeader>
          <CardContent>
            <DbChatForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
