import React from "react";
import { ProtectedLayout } from "@/components/layout/protectedLayout";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
