import { type z } from "zod";
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

// Helper for handling Supabase errors consistently
function handleSupabaseError(error: unknown, operation: string): never {
  console.error(`Error ${operation}:`, error);
  if (error instanceof Error) {
    throw new Error(`Failed to ${operation}: ${error.message}`);
  }
  throw new Error(`Failed to ${operation}: Unknown error`);
}

/**
 * Chat Sessions CRUD Operations
 */

// Get all chat sessions for a user
export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  try {
    const response = await supabase
      .from("chat_sessions")
      .select()
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (response.error) {
      throw response.error;
    }

    return (response.data || []) as ChatSession[];
  } catch (error) {
    handleSupabaseError(error, "fetch chat sessions");
  }
}

// Get a single chat session by ID
export async function getChatSessionById(
  sessionId: string,
  userId: string,
): Promise<ChatSession | null> {
  try {
    // First query to check if session exists with this ID
    const response = await supabase
      .from("chat_sessions")
      .select()
      .eq("id", sessionId)
      .single();

    // If no session found, return null
    if (response.error && response.error.code === "PGRST116") {
      return null;
    }

    if (response.error) {
      throw response.error;
    }

    // Now verify this session belongs to the user
    const session = response.data as ChatSession;
    if (session.user_id !== userId) {
      return null;
    }

    return session;
  } catch (error) {
    if (error instanceof PostgrestError && error.code === "PGRST116") {
      return null;
    }
    handleSupabaseError(error, "fetch chat session");
  }
}

// Create a new chat session
export async function createChatSession(
  data: z.infer<typeof createChatSessionSchema>,
): Promise<ChatSession> {
  // Validate input data
  const validData = createChatSessionSchema.parse(data);

  try {
    const response = await supabase
      .from("chat_sessions")
      .insert(validData)
      .select()
      .single();

    if (response.error) {
      throw response.error;
    }

    return response.data as ChatSession;
  } catch (error) {
    handleSupabaseError(error, "create chat session");
  }
}

// Update an existing chat session
export async function updateChatSession(
  sessionId: string,
  userId: string,
  data: z.infer<typeof updateChatSessionSchema>,
): Promise<ChatSession> {
  // Validate input data
  const validData = updateChatSessionSchema.parse(data);

  try {
    // Use two separate queries to avoid type issues
    // First update the record
    const updateResponse = await supabase
      .from("chat_sessions")
      .update(validData)
      .eq("id", sessionId)
      .eq("user_id", userId);

    if (updateResponse.error) {
      throw updateResponse.error;
    }

    // Then fetch the updated record
    const getResponse = await supabase
      .from("chat_sessions")
      .select()
      .eq("id", sessionId)
      .single();

    if (getResponse.error) {
      throw getResponse.error;
    }

    return getResponse.data as ChatSession;
  } catch (error) {
    handleSupabaseError(error, "update chat session");
  }
}

// Delete a chat session
export async function deleteChatSession(
  sessionId: string,
  userId: string,
): Promise<void> {
  try {
    const response = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", userId);

    if (response.error) {
      throw response.error;
    }
  } catch (error) {
    handleSupabaseError(error, "delete chat session");
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

  try {
    const response = await supabase
      .from("chat_messages")
      .select()
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (response.error) {
      throw response.error;
    }

    return (response.data || []) as ChatMessage[];
  } catch (error) {
    handleSupabaseError(error, "fetch chat messages");
  }
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

  try {
    const response = await supabase
      .from("chat_messages")
      .insert(validData)
      .select()
      .single();

    if (response.error) {
      throw response.error;
    }

    // Update the session's updated_at timestamp
    await updateChatSession(validData.session_id, userId, {});

    return response.data as ChatMessage;
  } catch (error) {
    handleSupabaseError(error, "create chat message");
  }
}

// Helper to get message data safely
async function getMessageById(
  messageId: string,
): Promise<{ session_id: string } | null> {
  try {
    const response = await supabase
      .from("chat_messages")
      .select("session_id")
      .eq("id", messageId)
      .single();

    if (response.error) {
      if (response.error.code === "PGRST116") {
        return null;
      }
      throw response.error;
    }

    return response.data as { session_id: string };
  } catch (error) {
    if (error instanceof PostgrestError && error.code === "PGRST116") {
      return null;
    }
    throw error;
  }
}

// Update an existing chat message
export async function updateChatMessage(
  messageId: string,
  userId: string,
  data: z.infer<typeof updateChatMessageSchema>,
): Promise<ChatMessage> {
  // Validate input data
  const validData = updateChatMessageSchema.parse(data);

  try {
    // Get the message to verify session ownership
    const message = await getMessageById(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    // Verify that the session belongs to the user
    const sessionExists = await getChatSessionById(message.session_id, userId);
    if (!sessionExists) {
      throw new Error("Chat session not found or access denied");
    }

    // Update the message first
    const updateResponse = await supabase
      .from("chat_messages")
      .update(validData)
      .eq("id", messageId);

    if (updateResponse.error) {
      throw updateResponse.error;
    }

    // Then fetch the updated message
    const getResponse = await supabase
      .from("chat_messages")
      .select()
      .eq("id", messageId)
      .single();

    if (getResponse.error) {
      throw getResponse.error;
    }

    return getResponse.data as ChatMessage;
  } catch (error) {
    handleSupabaseError(error, "update chat message");
  }
}

// Delete a chat message
export async function deleteChatMessage(
  messageId: string,
  userId: string,
): Promise<void> {
  try {
    // Get the message to verify session ownership
    const message = await getMessageById(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    // Verify that the session belongs to the user
    const sessionExists = await getChatSessionById(message.session_id, userId);
    if (!sessionExists) {
      throw new Error("Chat session not found or access denied");
    }

    const response = await supabase
      .from("chat_messages")
      .delete()
      .eq("id", messageId);

    if (response.error) {
      throw response.error;
    }
  } catch (error) {
    handleSupabaseError(error, "delete chat message");
  }
}
