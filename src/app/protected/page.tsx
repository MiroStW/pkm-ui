"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export default function ProtectedPage() {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      // This will never actually be called because of our middleware,
      // but it's a good fallback just in case
      redirect("/auth/signin");
    },
  });

  // Show loading state while checking auth
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <Container className="py-6">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Chats</CardTitle>
            <CardDescription>Your recent conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No recent conversations found.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base</CardTitle>
            <CardDescription>Your personal knowledge base</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No knowledge base entries found.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Start a new chat</p>
            <p>Manage your knowledge base</p>
            <p>Update your preferences</p>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
