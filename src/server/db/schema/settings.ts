import { z } from "zod";

export type UserSettings = {
  id: string;
  user_id: string;
  sync_chat_history: boolean;
  sync_settings: boolean;
  continue_conversations: boolean;
  created_at: string;
  updated_at: string;
  settings_data: Record<string, unknown>;
};

export const createUserSettingsSchema = z.object({
  user_id: z.string().uuid(),
  sync_chat_history: z.boolean().default(true),
  sync_settings: z.boolean().default(true),
  continue_conversations: z.boolean().default(true),
  settings_data: z.record(z.unknown()).default({}),
});

export const updateUserSettingsSchema = z.object({
  sync_chat_history: z.boolean().optional(),
  sync_settings: z.boolean().optional(),
  continue_conversations: z.boolean().optional(),
  settings_data: z.record(z.unknown()).optional(),
});
