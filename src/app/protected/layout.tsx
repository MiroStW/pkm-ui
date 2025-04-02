import React from "react";
import { ProtectedLayout } from "@/components/layout/protected-layout";

export default function ProtectedPagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
