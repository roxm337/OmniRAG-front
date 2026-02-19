"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAppStore } from "@/lib/store/app-store";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const syncAdminFromCookie = useAppStore((s) => s.syncAdminFromCookie);

  useEffect(() => {
    syncAdminFromCookie();
  }, [syncAdminFromCookie]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-6xl py-6 px-4 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
