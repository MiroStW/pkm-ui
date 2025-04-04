import React from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
