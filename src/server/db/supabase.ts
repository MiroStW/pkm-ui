import { createClient } from "@supabase/supabase-js";
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";

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

// Create a mock Supabase client for tests or use the real one for production
export const supabase = isTestMode
  ? createMockClient()
  : createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
