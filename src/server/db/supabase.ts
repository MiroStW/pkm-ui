import { createClient } from "@supabase/supabase-js";

// Get Supabase URL and service role key from env vars
const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Check for missing env vars
if (!supabaseUrl) throw new Error("Missing SUPABASE_URL");
if (!supabaseKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

// Check if we're in test mode
const isTestMode = process.env.USE_MOCK_SUPABASE === "true";

// Create a mock Supabase client for tests or use the real one for production
export const supabase = isTestMode
  ? createMockSupabaseClient()
  : createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

/**
 * Creates a mock Supabase client for testing purposes
 */
function createMockSupabaseClient() {
  // Mock test user for authentication
  const TEST_USER = {
    id: "test-user-id",
    email: "test@example.com",
    password_hash: "password_hash_value", // The actual hash isn't important for tests
    name: "Test User",
  };

  console.log("Using mock Supabase client for testing");

  // Return a mock implementation of the Supabase client
  return {
    from: (table: string) => {
      return {
        select: (columns?: string) => {
          console.log(`Mock Supabase: SELECT from ${table}`);
          return {
            eq: (column: string, value: string) => {
              console.log(`Mock Supabase: WHERE ${column} = ${value}`);
              return {
                single: () => {
                  // For authentication testing - always return success for test user
                  if (
                    table === "users" &&
                    column === "email" &&
                    value === TEST_USER.email
                  ) {
                    console.log(
                      `Mock Supabase: Found test user ${TEST_USER.email}`,
                    );
                    return {
                      data: TEST_USER,
                      error: null,
                    };
                  }

                  // Default user not found
                  console.log(`Mock Supabase: User not found for ${value}`);
                  return {
                    data: null,
                    error: { message: "User not found" },
                  };
                },
              };
            },
          };
        },
        insert: (data: Record<string, string | undefined>) => {
          console.log(`Mock Supabase: INSERT into ${table}`, data);
          return {
            select: (columns?: string) => {
              return {
                single: <T>() => {
                  // For registration testing - always succeed
                  if (table === "users" && data.email) {
                    console.log(
                      `Mock Supabase: User registered: ${data.email}`,
                    );
                    return {
                      data: { id: "new-user-id", ...data } as unknown as T,
                      error: null,
                    };
                  }

                  return {
                    data: null,
                    error: { message: "Failed to insert data" },
                  };
                },
              };
            },
          };
        },
      };
    },
  };
}
