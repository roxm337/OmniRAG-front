"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { adminLogin, listBots } from "@/lib/api";
import { useAppStore } from "@/lib/store/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();

  const {
    apiBaseUrl,
    adminToken,
    setAdminSession,
    setBots,
    setCurrentBotId,
    addEvent,
  } = useAppStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busyLogin, setBusyLogin] = useState(false);

  function getNextPath() {
    if (typeof window === "undefined") return "/";
    const params = new URLSearchParams(window.location.search);
    return params.get("next") || "/";
  }

  useEffect(() => {
    if (adminToken) {
      router.replace(getNextPath());
    }
  }, [adminToken, router]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim() || busyLogin) return;

    setBusyLogin(true);
    try {
      const login = await adminLogin(apiBaseUrl, {
        username: username.trim(),
        password,
      });
      setAdminSession(login.token, login.user);

      try {
        const bots = await listBots(apiBaseUrl, login.token);
        setBots(bots.bots);
        if (bots.bots.length > 0) {
          setCurrentBotId(bots.bots[0].id);
        }
      } catch {
        // Keep login successful even if bots fetch fails.
      }

      addEvent("admin:login", `Admin ${login.user.username} logged in`, "ok");
      toast.success("Login successful");

      router.replace(getNextPath());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      addEvent("admin:login", msg, "error");
      toast.error(msg);
    } finally {
      setBusyLogin(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Admin Login</CardTitle>
          <CardDescription>
            Authenticate to access OmniRAG dashboard and bots.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busyLogin}>
              {busyLogin ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
