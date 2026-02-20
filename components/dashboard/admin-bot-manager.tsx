"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bot,
  KeyRound,
  Loader2,
  LogIn,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";

import {
  adminLogin,
  createBot,
  deleteBot,
  listBots,
  updateBot,
} from "@/lib/api";
import { useAppStore } from "@/lib/store/app-store";
import type { LlmProvider } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export function AdminBotManager() {
  const {
    apiBaseUrl,
    adminToken,
    adminUser,
    bots,
    currentBotId,
    setAdminSession,
    clearAdminSession,
    setBots,
    setCurrentBotId,
    upsertBot,
    removeBot,
    addEvent,
  } = useAppStore();

  const [loadingBots, setLoadingBots] = useState(false);
  const [busyLogin, setBusyLogin] = useState(false);
  const [busyCreate, setBusyCreate] = useState(false);
  const [busyUpdate, setBusyUpdate] = useState(false);
  const [busyDelete, setBusyDelete] = useState(false);

  const [adminUsername, setAdminUsername] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("admin12345");

  const [newBotName, setNewBotName] = useState("");
  const [newBotDescription, setNewBotDescription] = useState("");
  const [newBotProvider, setNewBotProvider] = useState<LlmProvider>("deepseek");
  const [newBotTemperature, setNewBotTemperature] = useState(0.1);
  const [newBotTopK, setNewBotTopK] = useState(5);

  const selectedBot = useMemo(
    () => bots.find((bot) => bot.id === currentBotId) ?? null,
    [bots, currentBotId]
  );

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editProvider, setEditProvider] = useState<LlmProvider>("deepseek");
  const [editTemperature, setEditTemperature] = useState(0.1);
  const [editTopK, setEditTopK] = useState(5);

  useEffect(() => {
    if (!selectedBot) return;
    setEditName(selectedBot.name);
    setEditDescription(selectedBot.description ?? "");
    setEditProvider(selectedBot.provider);
    setEditTemperature(selectedBot.temperature);
    setEditTopK(selectedBot.top_k);
  }, [selectedBot]);

  async function refreshBots(showToast = false) {
    if (!adminToken) return;
    setLoadingBots(true);
    try {
      const res = await listBots(apiBaseUrl, adminToken);
      setBots(res.bots);
      if (showToast) toast.success(`Loaded ${res.bots.length} bots`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load bots";
      addEvent("bots:list", msg, "error");
      toast.error(msg);
    } finally {
      setLoadingBots(false);
    }
  }

  useEffect(() => {
    if (!adminToken) {
      setBots([]);
      return;
    }
    void refreshBots(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken, apiBaseUrl]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim() || busyLogin) return;

    setBusyLogin(true);
    try {
      const res = await adminLogin(apiBaseUrl, {
        username: adminUsername.trim(),
        password: adminPassword,
      });
      setAdminSession(res.token, res.user);
      addEvent(
        "admin:login",
        `Admin ${res.user.username} logged in`,
        "ok"
      );
      toast.success("Admin login successful");
      await refreshBots(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      addEvent("admin:login", msg, "error");
      toast.error(msg);
    } finally {
      setBusyLogin(false);
    }
  }

  async function handleCreateBot(e: FormEvent) {
    e.preventDefault();
    if (!adminToken || !newBotName.trim() || busyCreate) return;

    setBusyCreate(true);
    try {
      const bot = await createBot(apiBaseUrl, adminToken, {
        name: newBotName.trim(),
        description: newBotDescription.trim() || undefined,
        provider: newBotProvider,
        temperature: newBotTemperature,
        top_k: newBotTopK,
      });
      upsertBot(bot);
      setCurrentBotId(bot.id);
      setNewBotName("");
      setNewBotDescription("");
      addEvent("bot:create", `Bot ${bot.name} created`, "ok");
      toast.success(`Bot ${bot.name} created`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Create bot failed";
      addEvent("bot:create", msg, "error");
      toast.error(msg);
    } finally {
      setBusyCreate(false);
    }
  }

  async function handleUpdateBot(e: FormEvent) {
    e.preventDefault();
    if (!adminToken || !selectedBot || busyUpdate) return;

    setBusyUpdate(true);
    try {
      const updated = await updateBot(
        apiBaseUrl,
        adminToken,
        selectedBot.id,
        {
          name: editName,
          description: editDescription,
          provider: editProvider,
          temperature: editTemperature,
          top_k: editTopK,
        }
      );
      upsertBot(updated);
      addEvent("bot:update", `Bot ${updated.name} updated`, "ok");
      toast.success(`Bot ${updated.name} updated`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      addEvent("bot:update", msg, "error");
      toast.error(msg);
    } finally {
      setBusyUpdate(false);
    }
  }

  async function handleDeleteBot() {
    if (!adminToken || !selectedBot || busyDelete) return;
    if (!window.confirm(`Delete bot "${selectedBot.name}"?`)) return;

    setBusyDelete(true);
    try {
      await deleteBot(apiBaseUrl, adminToken, selectedBot.id);
      removeBot(selectedBot.id);
      addEvent("bot:delete", `Bot ${selectedBot.name} deleted`, "ok");
      toast.success(`Bot ${selectedBot.name} deleted`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      addEvent("bot:delete", msg, "error");
      toast.error(msg);
    } finally {
      setBusyDelete(false);
    }
  }

  function handleLogout() {
    clearAdminSession();
    setBots([]);
    addEvent("admin:logout", "Admin logged out", "ok");
    toast.success("Logged out");
  }

  return (
    <div className="space-y-6">
      {/* Active Bot Selector */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Bot className="h-4 w-4 text-muted-foreground" />
          Active Bot
        </Label>
        {bots.length > 0 ? (
          <Select value={currentBotId} onValueChange={setCurrentBotId}>
            <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder="Select active bot" />
            </SelectTrigger>
            <SelectContent>
              {bots.map((bot) => (
                <SelectItem key={bot.id} value={bot.id}>
                  {bot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={currentBotId}
            onChange={(e) => setCurrentBotId(e.target.value)}
            placeholder="Optional: paste bot_id"
            className="font-mono text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        )}
        {selectedBot ? (
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs font-medium">
              {selectedBot.provider}
            </Badge>
            <Badge variant="outline" className="text-xs">
              top_k: {selectedBot.top_k}
            </Badge>
            <Badge variant="outline" className="text-xs">
              temp: {selectedBot.temperature}
            </Badge>
            {selectedBot.has_db_config && (
              <Badge variant="outline" className="text-xs gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                DB enabled
              </Badge>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No selected bot. Requests will fallback to backend default bot.
          </p>
        )}
      </div>

      {/* Login / Admin Panel */}
      {!adminToken ? (
        <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 p-6 transition-colors duration-200 hover:border-primary/30 animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Admin Access</p>
              <p className="text-xs text-muted-foreground">
                Login to manage bots and platform history
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin"
                    className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="********"
                    className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
            <Button
              type="submit"
              disabled={busyLogin}
              className="gap-2 transition-all duration-200"
            >
              {busyLogin ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Login
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in">
          {/* Admin header */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-2">
                <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {adminUser?.username ?? "Admin"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Role: {adminUser?.role ?? "admin"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void refreshBots(true)}
                disabled={loadingBots}
                className="gap-2 transition-all duration-200"
              >
                {loadingBots ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Create Bot */}
          <form
            onSubmit={handleCreateBot}
            className="space-y-4 rounded-xl border bg-background p-5"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="rounded-md bg-blue-100 dark:bg-blue-900/30 p-1.5">
                <Plus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-semibold">Create Bot</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Name</Label>
                <Input
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  placeholder="Sales Bot"
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Provider</Label>
                <Select
                  value={newBotProvider}
                  onValueChange={(value) =>
                    setNewBotProvider(value as LlmProvider)
                  }
                >
                  <SelectTrigger className="transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                    <SelectItem value="groq">Groq</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Description</Label>
              <Textarea
                rows={2}
                value={newBotDescription}
                onChange={(e) => setNewBotDescription(e.target.value)}
                placeholder="Optional bot description"
                className="resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Temperature</Label>
                <Input
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  value={newBotTemperature}
                  onChange={(e) =>
                    setNewBotTemperature(Number(e.target.value) || 0)
                  }
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Top K</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={newBotTopK}
                  onChange={(e) =>
                    setNewBotTopK(Number(e.target.value) || 1)
                  }
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={busyCreate || !newBotName.trim()}
              className="gap-2 transition-all duration-200"
            >
              {busyCreate ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Bot
            </Button>
          </form>

          {/* Edit Selected Bot */}
          {selectedBot && (
            <form
              onSubmit={handleUpdateBot}
              className="space-y-4 rounded-xl border bg-background p-5 animate-scale-in"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-md bg-amber-100 dark:bg-amber-900/30 p-1.5">
                  <Bot className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-sm font-semibold">
                  Edit: {selectedBot.name}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Name</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Provider</Label>
                  <Select
                    value={editProvider}
                    onValueChange={(value) =>
                      setEditProvider(value as LlmProvider)
                    }
                  >
                    <SelectTrigger className="transition-all duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepseek">DeepSeek</SelectItem>
                      <SelectItem value="groq">Groq</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Description</Label>
                <Textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Temperature</Label>
                  <Input
                    type="number"
                    min={0}
                    max={2}
                    step={0.1}
                    value={editTemperature}
                    onChange={(e) =>
                      setEditTemperature(Number(e.target.value) || 0)
                    }
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Top K</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={editTopK}
                    onChange={(e) =>
                      setEditTopK(Number(e.target.value) || 1)
                    }
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button
                  type="submit"
                  size="sm"
                  disabled={busyUpdate || !editName.trim()}
                  className="gap-2 transition-all duration-200"
                >
                  {busyUpdate ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Bot
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleDeleteBot}
                  disabled={busyDelete}
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                >
                  {busyDelete ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete Bot
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
