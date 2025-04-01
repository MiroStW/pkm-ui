/**
 * Mock Supabase for testing with Bun and Playwright
 */

import { v4 as uuidv4 } from "uuid";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../src/server/db/types";

// In-memory storage for tests
const mockStorage = {
  chat_sessions: {},
  chat_messages: {},
};

/**
 * Sets up the test environment by setting environment variables
 * and initializing any necessary test state.
 */
export function setupTestEnv(): void {
  // Set environment variables for testing
  process.env.USE_MOCK_SUPABASE = "true";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://mock-supabase-url";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";

  // Clear any existing test data
  mockStorage.chat_sessions = {};
  mockStorage.chat_messages = {};

  console.log("Test environment set up with USE_MOCK_SUPABASE=true");
}

/**
 * Creates a mock Supabase client for testing purposes
 */
export function createMockSupabaseClient(): Partial<SupabaseClient<Database>> {
  function cloneData(data: any) {
    return JSON.parse(JSON.stringify(data));
  }

  function createErrorObject(message: string) {
    return {
      message,
      details: "",
      hint: "",
      code: "PGRST116",
      name: "PostgrestError",
    };
  }

  return {
    from: (table: string) => {
      let lastData = null;

      return {
        select: () => ({
          single: () => {
            if (lastData) {
              const data = cloneData(lastData);
              lastData = null;
              return { data, error: null };
            }
            return { data: null, error: null };
          },
          eq: (column: string, value: string) => ({
            single: () => {
              if (table === "chat_sessions") {
                const session = Object.values(mockStorage.chat_sessions).find(
                  (s: any) => s[column] === value,
                );
                return {
                  data: session ? cloneData(session) : null,
                  error: null,
                };
              }
              if (table === "chat_messages") {
                const messages = Object.values(
                  mockStorage.chat_messages,
                ).filter((m: any) => m[column] === value);

                // Don't sort for now, just return all messages that match the filter
                return {
                  data: messages.length > 0 ? cloneData(messages) : [],
                  error: null,
                };
              }
              return { data: null, error: null };
            },
            order: () => {
              return { data: [], error: null };
            },
          }),
        }),
        insert: (data: any) => {
          const id = data.id || uuidv4();
          const now = new Date().toISOString();

          if (table === "chat_sessions") {
            const newSession = {
              id,
              user_id: data.user_id || "",
              title: data.title || "",
              created_at: now,
              updated_at: now,
              is_favorite: false,
              metadata: {},
            };
            mockStorage.chat_sessions[id] = newSession;
            lastData = newSession;
          }

          if (table === "chat_messages") {
            const newMessage = {
              id,
              session_id: data.session_id || "",
              role: data.role || "user",
              content: data.content || "",
              created_at: now,
              metadata: {},
            };
            mockStorage.chat_messages[id] = newMessage;
            lastData = newMessage;
          }

          return {
            select: () => ({
              single: () => ({
                data: lastData ? cloneData(lastData) : null,
                error: null,
              }),
            }),
          };
        },
        update: (data: any) => ({
          eq: (column: string, value: string) => ({
            eq: (nestedColumn: string, nestedValue: string) => ({
              select: () => ({
                single: () => {
                  if (
                    table === "chat_sessions" &&
                    column === "id" &&
                    nestedColumn === "user_id"
                  ) {
                    const session = mockStorage.chat_sessions[value];
                    if (session && session.user_id === nestedValue) {
                      const now = new Date().toISOString();
                      const updatedSession = {
                        ...session,
                        ...data,
                        updated_at: now,
                        id: value,
                        user_id: nestedValue,
                      };
                      mockStorage.chat_sessions[value] = updatedSession;
                      lastData = updatedSession;
                      return {
                        data: cloneData(updatedSession),
                        error: null,
                      };
                    }
                  }

                  return {
                    data: null,
                    error: createErrorObject("Record not found"),
                  };
                },
              }),
            }),
          }),
        }),
        delete: () => ({
          eq: (column: string, value: string) => ({
            eq: (nestedColumn: string, nestedValue: string) => {
              if (
                table === "chat_sessions" &&
                column === "id" &&
                nestedColumn === "user_id"
              ) {
                const session = mockStorage.chat_sessions[value];
                if (session && session.user_id === nestedValue) {
                  delete mockStorage.chat_sessions[value];
                  // Cascade delete messages
                  Object.entries(mockStorage.chat_messages).forEach(
                    ([msgId, msg]: [string, any]) => {
                      if (msg.session_id === value) {
                        delete mockStorage.chat_messages[msgId];
                      }
                    },
                  );
                }
              }
              return {
                data: null,
                error: null,
              };
            },
          }),
        }),
      };
    },
  };
}
