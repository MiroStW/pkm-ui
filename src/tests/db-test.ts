/**
 * Test script to verify Supabase database operations
 *
 * This script tests the functionality of the chat database operations
 * to satisfy Step 3 of the implementation plan.
 */

import { describe, test, expect, beforeEach } from "vitest";
import { supabase } from "../server/db/supabase";
import type { Database } from "../server/db/types";
import type { ChatSession, ChatMessage } from "../server/db/schema/chat";

// Set test mode
process.env.USE_MOCK_SUPABASE = "true";

describe("Chat Database Operations", () => {
  const testUserId = "test-user-id";

  beforeEach(() => {
    // Reset database state before each test
  });

  test("Create and retrieve chat session", async () => {
    // Create a new chat session
    const { data: session, error: createError } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: testUserId,
        title: "Test Chat Session",
      })
      .select<"*", Database["public"]["Tables"]["chat_sessions"]["Row"]>()
      .single();

    expect(createError).toBe(null);
    expect(session).toBeTruthy();
    expect(session?.title).toBe("Test Chat Session");
    expect(session?.user_id).toBe(testUserId);

    // Retrieve the created session
    const { data: retrieved, error: retrieveError } = await supabase
      .from("chat_sessions")
      .select<"*", Database["public"]["Tables"]["chat_sessions"]["Row"]>()
      .eq("id", session?.id)
      .single();

    expect(retrieveError).toBe(null);
    expect(retrieved).toBeTruthy();
    expect(retrieved?.id).toBe(session?.id);
  });

  test("Update chat session", async () => {
    // Create a session to update
    const { data: session } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: testUserId,
        title: "Original Title",
      })
      .select<"*", Database["public"]["Tables"]["chat_sessions"]["Row"]>()
      .single();

    // Update the session
    const newTitle = "Updated Title";
    const { data: updated, error: updateError } = await supabase
      .from("chat_sessions")
      .update({ title: newTitle })
      .eq("id", session?.id)
      .eq("user_id", testUserId)
      .select<"*", Database["public"]["Tables"]["chat_sessions"]["Row"]>()
      .single();

    expect(updateError).toBe(null);
    expect(updated).toBeTruthy();
    expect(updated?.title).toBe(newTitle);
  });

  test("Delete chat session", async () => {
    // Create a session to delete
    const { data: session } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: testUserId,
        title: "Session to Delete",
      })
      .select<"*", Database["public"]["Tables"]["chat_sessions"]["Row"]>()
      .single();

    // Delete the session
    const { error: deleteError } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", session?.id)
      .eq("user_id", testUserId);

    expect(deleteError).toBe(null);

    // Try to retrieve the deleted session
    const { data: retrieved, error: retrieveError } = await supabase
      .from("chat_sessions")
      .select<"*", Database["public"]["Tables"]["chat_sessions"]["Row"]>()
      .eq("id", session?.id)
      .single();

    expect(retrieved).toBe(null);
    expect(retrieveError).toBeTruthy();
  });

  test("Create and retrieve chat messages", async () => {
    // Create a chat session first
    const { data: session } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: testUserId,
        title: "Chat with Messages",
      })
      .select<"*", Database["public"]["Tables"]["chat_sessions"]["Row"]>()
      .single();

    // Create a message
    const { data: message, error: createError } = await supabase
      .from("chat_messages")
      .insert({
        session_id: session?.id,
        role: "user",
        content: "Test message",
      })
      .select<"*", Database["public"]["Tables"]["chat_messages"]["Row"]>()
      .single();

    expect(createError).toBe(null);
    expect(message).toBeTruthy();
    expect(message?.content).toBe("Test message");
    expect(message?.session_id).toBe(session?.id);

    // Retrieve the message
    const { data: retrieved, error: retrieveError } = await supabase
      .from("chat_messages")
      .select<"*", Database["public"]["Tables"]["chat_messages"]["Row"]>()
      .eq("id", message?.id)
      .single();

    expect(retrieveError).toBe(null);
    expect(retrieved).toBeTruthy();
    expect(retrieved?.id).toBe(message?.id);
  });

  test("Delete chat session should delete associated messages", async () => {
    // Create a chat session
    const { data: session } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: testUserId,
        title: "Session with Messages",
      })
      .select<"*", Database["public"]["Tables"]["chat_sessions"]["Row"]>()
      .single();

    // Create some messages
    await supabase.from("chat_messages").insert([
      {
        session_id: session?.id,
        role: "user",
        content: "Message 1",
      },
      {
        session_id: session?.id,
        role: "assistant",
        content: "Message 2",
      },
    ]);

    // Delete the session
    await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", session?.id)
      .eq("user_id", testUserId);

    // Try to retrieve messages for the deleted session
    const { data: messages } = await supabase
      .from("chat_messages")
      .select<"*", Database["public"]["Tables"]["chat_messages"]["Row"]>()
      .eq("session_id", session?.id);

    expect(messages).toHaveLength(0);
  });
});
