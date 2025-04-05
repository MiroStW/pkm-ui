import { createClient } from "@supabase/supabase-js";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

// Get Supabase URL and service role key from env vars
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  "";

// Only use test mode if explicitly enabled with USE_MOCK_SUPABASE
// Remove the automatic test mode based on NODE_ENV
const isTestMode = process.env.USE_MOCK_SUPABASE === "true";

// Type definitions to help with mocking
interface MockSelectResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

// Create a simple mock Supabase client
function createMockClient() {
  // Use type assertion to ensure compatibility
  return {
    from: (table: string) => {
      return {
        select: <T = unknown>() => ({
          single: () => ({ data: null, error: null }) as MockSelectResponse<T>,
          eq: (_column: string, _value: string) => ({
            single: () =>
              ({ data: null, error: null }) as MockSelectResponse<T>,
            order: () => ({ data: [], error: null }) as MockSelectResponse<T[]>,
            eq: (_nestedColumn: string, _nestedValue: string) => ({
              select: <U = unknown>() => ({
                single: () =>
                  ({ data: null, error: null }) as MockSelectResponse<U>,
              }),
            }),
          }),
        }),
        insert: (data: unknown) => ({
          select: <T = unknown>() => ({
            single: () => {
              // Special case for user registration - return mock user data for test
              if (
                table === "users" &&
                typeof (data as Record<string, unknown>).email === "string"
              ) {
                return {
                  data: { id: "test-user-id-" + Date.now() } as T,
                  error: null,
                };
              }
              return { data: null, error: null } as MockSelectResponse<T>;
            },
          }),
        }),
        update: (_data: unknown) => ({
          eq: (_column: string, _value: string) => ({
            eq: (_nestedColumn: string, _nestedValue: string) => ({
              select: <T = unknown>() => ({
                single: () =>
                  ({ data: null, error: null }) as MockSelectResponse<T>,
              }),
            }),
          }),
        }),
        delete: () => ({
          eq: (_column: string, _value: string) => ({
            eq: (_nestedColumn: string, _nestedValue: string) =>
              ({ data: null, error: null }) as MockSelectResponse<null>,
          }),
        }),
      };
    },
  } as unknown as SupabaseClient;
}

/**
 * Standard Supabase client with anonymous key.
 * This client respects RLS policies and should be used for most operations.
 */
export const supabase = isTestMode
  ? createMockClient()
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

/**
 * Admin Supabase client with service role key.
 * This client bypasses Row Level Security (RLS) policies.
 * ONLY use this for:
 * 1. Authentication operations (login/signup)
 * 2. Operations that require admin access
 * 3. When you absolutely need to bypass RLS
 */
export const supabaseAdmin = isTestMode
  ? createMockClient()
  : createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
