import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Get Supabase URL and service role key from env vars
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "";

// Force test mode if environment variable is set or if we're running in a test environment
const isTestMode =
  process.env.USE_MOCK_SUPABASE === "true" || process.env.NODE_ENV === "test";

// Log for debugging
console.log("isTestMode", isTestMode);

// Simple in-memory mock storage
const mockStorage: Record<string, Record<string, any>> = {
  chat_sessions: {},
  chat_messages: {},
};

// Create a simple mock Supabase client
function createMockClient() {
  return {
    from: (table: string) => {
      return {
        select: () => ({
          single: () => ({ data: null, error: null }),
          eq: () => ({
            single: () => ({ data: null, error: null }),
            order: () => ({ data: [], error: null }),
          }),
        }),
        insert: (data: Record<string, unknown>) => ({
          select: () => ({
            single: () => {
              // Special case for user registration - return mock user data for test
              if (table === "users" && typeof data.email === "string") {
                return {
                  data: { id: "test-user-id-" + Date.now() },
                  error: null,
                };
              }
              return { data: null, error: null };
            },
          }),
        }),
        update: () => ({
          eq: () => ({
            eq: () => ({
              select: () => ({
                single: () => ({ data: null, error: null }),
              }),
            }),
          }),
        }),
        delete: () => ({
          eq: () => ({
            eq: () => ({ data: null, error: null }),
          }),
        }),
      };
    },
  };
}

// Create a mock Supabase client for tests or use the real one for production
export const supabase = isTestMode
  ? createMockClient()
  : createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
