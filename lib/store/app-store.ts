"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ActionEvent, AdminUser, Bot, HealthResponse, LlmProvider } from "@/lib/types";
import { createEventId } from "@/lib/utils";

const DEFAULT_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const MAX_HISTORY = 50;
const ADMIN_TOKEN_COOKIE = "omnirag_admin_token";

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const encodedName = `${name}=`;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(encodedName)) {
      return decodeURIComponent(trimmed.substring(encodedName.length));
    }
  }
  return "";
}

function setAdminCookie(token: string) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ADMIN_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function clearAdminCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${ADMIN_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

interface AppState {
  apiBaseUrl: string;
  defaultProvider: LlmProvider;
  events: ActionEvent[];
  health: HealthResponse | null;
  healthError: string;

  adminToken: string;
  adminUser: AdminUser | null;

  bots: Bot[];
  currentBotId: string;

  setApiBaseUrl: (url: string) => void;
  setDefaultProvider: (provider: LlmProvider) => void;
  setHealth: (health: HealthResponse | null) => void;
  setHealthError: (error: string) => void;
  addEvent: (type: string, message: string, status: "ok" | "error") => void;
  clearEvents: () => void;

  setAdminSession: (token: string, user: AdminUser) => void;
  clearAdminSession: () => void;
  syncAdminFromCookie: () => void;

  setBots: (bots: Bot[]) => void;
  setCurrentBotId: (botId: string) => void;
  upsertBot: (bot: Bot) => void;
  removeBot: (botId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      apiBaseUrl: DEFAULT_API_BASE,
      defaultProvider: "deepseek",
      events: [],
      health: null,
      healthError: "",

      adminToken: "",
      adminUser: null,

      bots: [],
      currentBotId: "",

      setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
      setDefaultProvider: (provider) => set({ defaultProvider: provider }),
      setHealth: (health) => set({ health }),
      setHealthError: (error) => set({ healthError: error }),
      addEvent: (type, message, status) =>
        set((state) => ({
          events: [
            {
              id: createEventId(),
              type,
              message,
              status,
              createdAt: new Date().toISOString(),
            },
            ...state.events,
          ].slice(0, MAX_HISTORY),
        })),
      clearEvents: () => set({ events: [] }),

      setAdminSession: (token, user) => {
        setAdminCookie(token);
        set({ adminToken: token, adminUser: user });
      },
      clearAdminSession: () => {
        clearAdminCookie();
        set({ adminToken: "", adminUser: null });
      },
      syncAdminFromCookie: () => {
        const cookieToken = readCookie(ADMIN_TOKEN_COOKIE);
        const current = get().adminToken;
        if (cookieToken && cookieToken !== current) {
          set({ adminToken: cookieToken });
        }
        if (!cookieToken && current) {
          set({ adminToken: "", adminUser: null });
        }
      },

      setBots: (bots) =>
        set((state) => {
          const nextCurrent =
            state.currentBotId && bots.some((bot) => bot.id === state.currentBotId)
              ? state.currentBotId
              : (bots[0]?.id ?? "");

          const providerFromBot = bots.find((bot) => bot.id === nextCurrent)?.provider;

          return {
            bots,
            currentBotId: nextCurrent,
            defaultProvider: providerFromBot ?? state.defaultProvider,
          };
        }),

      setCurrentBotId: (botId) =>
        set((state) => {
          const matched = state.bots.find((bot) => bot.id === botId);
          return {
            currentBotId: botId,
            defaultProvider: matched?.provider ?? state.defaultProvider,
          };
        }),

      upsertBot: (bot) =>
        set((state) => {
          const exists = state.bots.some((item) => item.id === bot.id);
          const bots = exists
            ? state.bots.map((item) => (item.id === bot.id ? bot : item))
            : [...state.bots, bot];

          const currentBotId = state.currentBotId || bot.id;
          const providerFromBot = bots.find((item) => item.id === currentBotId)?.provider;

          return {
            bots,
            currentBotId,
            defaultProvider: providerFromBot ?? state.defaultProvider,
          };
        }),

      removeBot: (botId) =>
        set((state) => {
          const bots = state.bots.filter((bot) => bot.id !== botId);
          const currentBotId =
            state.currentBotId === botId
              ? (bots[0]?.id ?? "")
              : state.currentBotId;
          const providerFromBot = bots.find((bot) => bot.id === currentBotId)?.provider;

          return {
            bots,
            currentBotId,
            defaultProvider: providerFromBot ?? state.defaultProvider,
          };
        }),
    }),
    {
      name: "omnirag-store",
      version: 4,
      migrate: (persistedState, version) => {
        let state = persistedState as Record<string, any>;
        if (version < 2 && state && typeof state === "object") {
          delete state.adminToken;
          delete state.adminUser;
        }
        if (version < 4 && state && typeof state === "object") {
          // Force reset if it's still pointing to localhost in a production environment
          if (state.apiBaseUrl?.includes("localhost")) {
            state.apiBaseUrl = DEFAULT_API_BASE;
          }
        }
        return state as AppState;
      },
      partialize: (state) => ({
        apiBaseUrl: state.apiBaseUrl,
        defaultProvider: state.defaultProvider,
        events: state.events,
        currentBotId: state.currentBotId,
      }),
    },
  ),
);
