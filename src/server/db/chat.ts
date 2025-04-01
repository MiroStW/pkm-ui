import { z } from "zod";
import { supabase } from "./supabase";
import {
  type ChatSession,
  type ChatMessage,
  createChatSessionSchema,
  createChatMessageSchema,
  updateChatSessionSchema,
  updateChatMessageSchema,
} from "./schema/chat";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Chat Sessions CRUD Operations
 */

// Get all chat sessions for a user
export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching chat sessions:", error);
    throw new Error(`Failed to fetch chat sessions: ${error.message}`);
  }

  return data as ChatSession[];
}

// Get a single chat session by ID
export async function getChatSessionById(
  sessionId: string,
  userId: string,
): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      return null;
    }
    console.error("Error fetching chat session:", error);
    throw new Error(`Failed to fetch chat session: ${error.message}`);
  }

  return data as ChatSession;
}

// Create a new chat session
export async function createChatSession(
  data: z.infer<typeof createChatSessionSchema>,
): Promise<ChatSession> {
  // Validate input data
  const validData = createChatSessionSchema.parse(data);

  const { data: chatSession, error } = await supabase
    .from("chat_sessions")
    .insert(validData)
    .select()
    .single();

  if (error) {
    console.error("Error creating chat session:", error);
    throw new Error(`Failed to create chat session: ${error.message}`);
  }

  return chatSession as ChatSession;
}

// Update an existing chat session
export async function updateChatSession(
  sessionId: string,
  userId: string,
  data: z.infer<typeof updateChatSessionSchema>,
): Promise<ChatSession> {
  // Validate input data
  const validData = updateChatSessionSchema.parse(data);

  const { data: updatedSession, error } = await supabase
    .from("chat_sessions")
    .update(validData)
    .eq("id", sessionId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating chat session:", error);
    throw new Error(`Failed to update chat session: ${error.message}`);
  }

  return updatedSession as ChatSession;
}

// Delete a chat session
export async function deleteChatSession(
  sessionId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting chat session:", error);
    throw new Error(`Failed to delete chat session: ${error.message}`);
  }
}

/**
 * Chat Messages CRUD Operations
 */

// Get all messages for a chat session
export async function getChatMessages(
  sessionId: string,
  userId: string,
): Promise<ChatMessage[]> {
  // First verify that the session belongs to the user
  const sessionExists = await getChatSessionById(sessionId, userId);
  if (!sessionExists) {
    throw new Error("Chat session not found or access denied");
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching chat messages:", error);
    throw new Error(`Failed to fetch chat messages: ${error.message}`);
  }

  return data as ChatMessage[];
}

// Create a new chat message
export async function createChatMessage(
  data: z.infer<typeof createChatMessageSchema>,
  userId: string,
): Promise<ChatMessage> {
  // Validate input data
  const validData = createChatMessageSchema.parse(data);

  // Verify that the session belongs to the user
  const sessionExists = await getChatSessionById(validData.session_id, userId);
  if (!sessionExists) {
    throw new Error("Chat session not found or access denied");
  }

  const { data: chatMessage, error } = await supabase
    .from("chat_messages")
    .insert(validData)
    .select()
    .single();

  if (error) {
    console.error("Error creating chat message:", error);
    throw new Error(`Failed to create chat message: ${error.message}`);
  }

  // Update the session's updated_at timestamp
  await updateChatSession(validData.session_id, userId, {});

  return chatMessage as ChatMessage;
}

// Update an existing chat message
export async function updateChatMessage(
  messageId: string,
  userId: string,
  data: z.infer<typeof updateChatMessageSchema>,
): Promise<ChatMessage> {
  // Validate input data
  const validData = updateChatMessageSchema.parse(data);

  // Get the message to verify session ownership
  const { data: message, error: messageError } = await supabase
    .from("chat_messages")
    .select("session_id")
    .eq("id", messageId)
    .single();

  if (messageError || !message) {
    throw new Error("Message not found");
  }

  // Verify that the session belongs to the user
  const sessionExists = await getChatSessionById(message.session_id, userId);
  if (!sessionExists) {
    throw new Error("Chat session not found or access denied");
  }

  const { data: updatedMessage, error } = await supabase
    .from("chat_messages")
    .update(validData)
    .eq("id", messageId)
    .select()
    .single();

  if (error) {
    console.error("Error updating chat message:", error);
    throw new Error(`Failed to update chat message: ${error.message}`);
  }

  return updatedMessage as ChatMessage;
}

// Delete a chat message
export async function deleteChatMessage(
  messageId: string,
  userId: string,
): Promise<void> {
  // Get the message to verify session ownership
  const { data: message, error: messageError } = await supabase
    .from("chat_messages")
    .select("session_id")
    .eq("id", messageId)
    .single();

  if (messageError || !message) {
    throw new Error("Message not found");
  }

  // Verify that the session belongs to the user
  const sessionExists = await getChatSessionById(message.session_id, userId);
  if (!sessionExists) {
    throw new Error("Chat session not found or access denied");
  }

  const { error } = await supabase
    .from("chat_messages")
    .delete()
    .eq("id", messageId);

  if (error) {
    console.error("Error deleting chat message:", error);
    throw new Error(`Failed to delete chat message: ${error.message}`);
  }
}
