"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainLayout } from "@/components/layout/MainLayout";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <MainLayout>
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex md:w-64 md:flex-col">
          <Sidebar />
        </div>
        <main className="flex flex-1 flex-col overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </MainLayout>
  );
}
