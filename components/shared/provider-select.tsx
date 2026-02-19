"use client";

import type { LlmProvider } from "@/lib/types";
import { useAppStore } from "@/lib/store/app-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProviderSelectProps {
  value: "default" | LlmProvider;
  onChange: (value: "default" | LlmProvider) => void;
}

export function ProviderSelect({ value, onChange }: ProviderSelectProps) {
  const defaultProvider = useAppStore((s) => s.defaultProvider);

  return (
    <Select value={value} onValueChange={(v) => onChange(v as "default" | LlmProvider)}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">Default ({defaultProvider})</SelectItem>
        <SelectItem value="deepseek">DeepSeek</SelectItem>
        <SelectItem value="groq">Groq</SelectItem>
      </SelectContent>
    </Select>
  );
}
