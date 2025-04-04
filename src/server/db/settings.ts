import { type z } from "zod";
import { supabase } from "./supabase";
import {
  type UserSettings,
  createUserSettingsSchema,
  updateUserSettingsSchema,
} from "./schema/settings";
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
 * Get user settings by user ID
 */
export async function getUserSettings(
  userId: string,
): Promise<UserSettings | null> {
  try {
    const response = await supabase
      .from("user_settings")
      .select()
      .eq("user_id", userId)
      .single();

    if (response.error) {
      if (response.error.code === "PGRST116") {
        return null;
      }
      throw response.error;
    }

    return response.data as UserSettings;
  } catch (error) {
    if (error instanceof PostgrestError && error.code === "PGRST116") {
      return null;
    }
    handleSupabaseError(error, "fetch user settings");
  }
}

/**
 * Create new user settings
 */
export async function createUserSettings(
  data: z.infer<typeof createUserSettingsSchema>,
): Promise<UserSettings> {
  // Validate input data
  const validData = createUserSettingsSchema.parse(data);

  try {
    const response = await supabase
      .from("user_settings")
      .insert(validData)
      .select()
      .single();

    if (response.error) {
      throw response.error;
    }

    return response.data as UserSettings;
  } catch (error) {
    handleSupabaseError(error, "create user settings");
  }
}

/**
 * Update existing user settings
 */
export async function updateUserSettings(
  userId: string,
  data: z.infer<typeof updateUserSettingsSchema>,
): Promise<UserSettings> {
  // Validate input data
  const validData = updateUserSettingsSchema.parse(data);

  try {
    // First check if settings exist for this user
    const existingSettings = await getUserSettings(userId);

    if (!existingSettings) {
      // If settings don't exist, create them with defaults + updates
      return await createUserSettings({
        user_id: userId,
        sync_chat_history: validData.sync_chat_history ?? true,
        sync_settings: validData.sync_settings ?? true,
        continue_conversations: validData.continue_conversations ?? true,
        settings_data: validData.settings_data ?? {},
      });
    }

    // Update the settings
    const updateResponse = await supabase
      .from("user_settings")
      .update(validData)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateResponse.error) {
      throw updateResponse.error;
    }

    return updateResponse.data as UserSettings;
  } catch (error) {
    handleSupabaseError(error, "update user settings");
  }
}

/**
 * Get settings with defaults even if not stored
 * This ensures we always have valid settings even before
 * they're explicitly saved
 */
export async function getOrCreateUserSettings(
  userId: string,
): Promise<UserSettings> {
  try {
    // Try to get existing settings
    const existingSettings = await getUserSettings(userId);

    if (existingSettings) {
      return existingSettings;
    }

    // If no settings exist, create with defaults
    return await createUserSettings({
      user_id: userId,
      sync_chat_history: true,
      sync_settings: true,
      continue_conversations: true,
      settings_data: {},
    });
  } catch (error) {
    handleSupabaseError(error, "get or create user settings");
  }
}
