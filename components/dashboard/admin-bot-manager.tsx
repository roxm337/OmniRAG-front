"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { KeyRound, Loader2, LogIn, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const selectedBot = useMemo(() => bots.find((bot) => bot.id === currentBotId) ?? null, [bots, currentBotId]);

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
      addEvent("admin:login", `Admin ${res.user.username} logged in`, "ok");
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
      const msg = err instanceof Error ? err.message : "Create bot failed";
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
      const updated = await updateBot(apiBaseUrl, adminToken, selectedBot.id, {
        name: editName,
        description: editDescription,
        provider: editProvider,
        temperature: editTemperature,
        top_k: editTopK,
      });
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
    if (!window.confirm(`Delete bot \"${selectedBot.name}\"?`)) return;

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
      <div className="space-y-2">
        <Label className="text-xs">Active Bot</Label>
        {bots.length > 0 ? (
          <Select value={currentBotId} onValueChange={setCurrentBotId}>
            <SelectTrigger>
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
          />
        )}
        {selectedBot ? (
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">{selectedBot.provider}</Badge>
            <Badge variant="outline">top_k: {selectedBot.top_k}</Badge>
            <Badge variant="outline">temp: {selectedBot.temperature}</Badge>
            {selectedBot.has_db_config ? <Badge variant="outline">db enabled</Badge> : null}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No selected bot. Requests will fallback to backend default bot.</p>
        )}
      </div>

      {!adminToken ? (
        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <div>
            <p className="text-sm font-medium">Admin Access</p>
            <p className="text-xs text-muted-foreground">Login to manage bots and platform history.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Username</Label>
                <Input value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} placeholder="admin" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Password</Label>
                <Input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="********" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm" disabled={busyLogin}>
                {busyLogin ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                Login
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Logged in as {adminUser?.username}</p>
              <p className="text-xs text-muted-foreground">Role: {adminUser?.role ?? "admin"}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => void refreshBots(true)} disabled={loadingBots}>
                {loadingBots ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh Bots
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={handleLogout}>
                <KeyRound className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          <form onSubmit={handleCreateBot} className="space-y-3 rounded-lg border bg-background p-3">
            <p className="text-xs font-medium text-muted-foreground">Create Bot</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input value={newBotName} onChange={(e) => setNewBotName(e.target.value)} placeholder="Sales Bot" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Provider</Label>
                <Select value={newBotProvider} onValueChange={(value) => setNewBotProvider(value as LlmProvider)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                    <SelectItem value="groq">Groq</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea rows={2} value={newBotDescription} onChange={(e) => setNewBotDescription(e.target.value)} placeholder="Optional bot description" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Temperature</Label>
                <Input type="number" min={0} max={2} step={0.1} value={newBotTemperature} onChange={(e) => setNewBotTemperature(Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Top K</Label>
                <Input type="number" min={1} max={50} value={newBotTopK} onChange={(e) => setNewBotTopK(Number(e.target.value) || 1)} />
              </div>
            </div>
            <Button type="submit" size="sm" disabled={busyCreate || !newBotName.trim()}>
              {busyCreate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create Bot
            </Button>
          </form>

          {selectedBot ? (
            <form onSubmit={handleUpdateBot} className="space-y-3 rounded-lg border bg-background p-3">
              <p className="text-xs font-medium text-muted-foreground">Edit Selected Bot</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Name</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Provider</Label>
                  <Select value={editProvider} onValueChange={(value) => setEditProvider(value as LlmProvider)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepseek">DeepSeek</SelectItem>
                      <SelectItem value="groq">Groq</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea rows={2} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Temperature</Label>
                  <Input type="number" min={0} max={2} step={0.1} value={editTemperature} onChange={(e) => setEditTemperature(Number(e.target.value) || 0)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Top K</Label>
                  <Input type="number" min={1} max={50} value={editTopK} onChange={(e) => setEditTopK(Number(e.target.value) || 1)} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" size="sm" disabled={busyUpdate || !editName.trim()}>
                  {busyUpdate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Bot
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={handleDeleteBot} disabled={busyDelete}>
                  {busyDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete Bot
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      )}
    </div>
  );
}
