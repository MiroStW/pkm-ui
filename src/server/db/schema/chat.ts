import { z } from "zod";

// Define TypeScript types for database schema
export type ChatSession = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  metadata: Record<string, unknown>;
};

export type ChatMessage = {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  metadata: Record<string, unknown>;
};

// Zod schemas for validation
export const chatSessionSchema = z.object({
  id: z.string().uuid().optional(), // Optional for creation
  user_id: z.string().uuid(),
  title: z.string().min(1),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  is_favorite: z.boolean().default(false),
  metadata: z.record(z.unknown()).default({}),
});

export const chatMessageSchema = z.object({
  id: z.string().uuid().optional(), // Optional for creation
  session_id: z.string().uuid(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1),
  created_at: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).default({}),
});

// Input validation schemas for creating new records
export const createChatSessionSchema = chatSessionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const createChatMessageSchema = chatMessageSchema.omit({
  id: true,
  created_at: true,
});

// Input validation schemas for updating existing records
export const updateChatSessionSchema = chatSessionSchema
  .pick({
    title: true,
    is_favorite: true,
    metadata: true,
  })
  .partial();

export const updateChatMessageSchema = chatMessageSchema
  .pick({
    content: true,
    metadata: true,
  })
  .partial();
