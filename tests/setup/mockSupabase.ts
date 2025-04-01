/**
 * Mock Supabase for testing with Bun and Playwright
 */

import { v4 as uuidv4 } from "uuid";
import type { PostgrestError } from "@supabase/supabase-js";

// Type definitions for mock data
interface MockChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  metadata: Record<string, unknown>;
}

interface MockChatMessage {
  id: string;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

type MockData = MockChatSession | MockChatMessage;

// In-memory storage for tests
const mockStorage: {
  chat_sessions: Record<string, MockChatSession>;
  chat_messages: Record<string, MockChatMessage>;
} = {
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

// Type definitions to help with mocking
interface MockSelectResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

// Type for our mock Supabase client to ensure compatibility with tests
type MockSupabaseClient = {
  from: (table: string) => {
    select: <T = unknown>() => {
      single: () => MockSelectResponse<T>;
      eq: (
        column: string,
        value: string,
      ) => {
        single: () => MockSelectResponse<T>;
        order: (
          column: string,
          options: { ascending: boolean },
        ) => MockSelectResponse<T[]>;
        eq: (
          column: string,
          value: string,
        ) => {
          select: <U = unknown>() => {
            single: () => MockSelectResponse<U>;
          };
        };
      };
    };
    insert: (data: unknown) => {
      select: <T = unknown>() => {
        single: () => MockSelectResponse<T>;
      };
    };
    update: (data: unknown) => {
      eq: (
        column: string,
        value: string,
      ) => {
        eq: (
          column: string,
          value: string,
        ) => {
          select: <T = unknown>() => {
            single: () => MockSelectResponse<T>;
          };
        };
      };
    };
    delete: () => {
      eq: (
        column: string,
        value: string,
      ) => {
        eq: (column: string, value: string) => MockSelectResponse<null>;
      };
    };
  };
};

/**
 * Creates a mock Supabase client for testing purposes
 */
export function createMockSupabaseClient(): MockSupabaseClient {
  function cloneData<T>(data: T): T {
    return JSON.parse(JSON.stringify(data)) as T;
  }

  function createErrorObject(message: string): PostgrestError {
    return {
      message,
      details: "",
      hint: "",
      code: "PGRST116",
      name: "PostgrestError",
    };
  }

  let lastData: MockData | null = null;

  // This is a simplified mock that doesn't implement all PostgrestQueryBuilder methods
  // but provides the methods we need for our tests
  const client = {
    from: (_table: string) => {
      const table = _table;
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
                  (s: MockChatSession) =>
                    s[column as keyof MockChatSession] === value,
                );
                return {
                  data: session ? cloneData(session) : null,
                  error: null,
                };
              }
              if (table === "chat_messages") {
                const messages = Object.values(
                  mockStorage.chat_messages,
                ).filter(
                  (m: MockChatMessage) =>
                    m[column as keyof MockChatMessage] === value,
                );

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
            eq: (nestedColumn: string, nestedValue: string) => ({
              select: () => ({
                single: () => {
                  // Double eq filtering
                  if (table === "chat_sessions") {
                    const sessions = Object.values(mockStorage.chat_sessions);
                    const session = sessions.find(
                      (s) =>
                        s[column as keyof MockChatSession] === value &&
                        s[nestedColumn as keyof MockChatSession] ===
                          nestedValue,
                    );
                    return {
                      data: session ? cloneData(session) : null,
                      error: null,
                    };
                  }
                  return { data: null, error: null };
                },
              }),
            }),
          }),
        }),
        insert: (data: unknown) => {
          const id = (data as { id?: string }).id ?? uuidv4();
          const now = new Date().toISOString();

          if (table === "chat_sessions") {
            const sessionData = data as Partial<MockChatSession>;
            const newSession: MockChatSession = {
              id,
              user_id: sessionData.user_id ?? "",
              title: sessionData.title ?? "",
              created_at: now,
              updated_at: now,
              is_favorite: false,
              metadata: {},
            };
            mockStorage.chat_sessions[id] = newSession;
            lastData = newSession;
          }

          if (table === "chat_messages") {
            const messageData = data as Partial<MockChatMessage>;
            const newMessage: MockChatMessage = {
              id,
              session_id: messageData.session_id ?? "",
              role: messageData.role ?? "user",
              content: messageData.content ?? "",
              created_at: now,
              metadata: {},
            };
            mockStorage.chat_messages[id] = newMessage;
            lastData = newMessage;
          }

          return {
            select: <T = unknown>() => ({
              single: () => ({
                data: lastData ? (cloneData(lastData) as T) : null,
                error: null,
              }),
            }),
          };
        },
        update: (data: unknown) => ({
          eq: (column: string, value: string) => ({
            eq: (nestedColumn: string, nestedValue: string) => ({
              select: <T = unknown>() => ({
                single: () => {
                  if (
                    table === "chat_sessions" &&
                    column === "id" &&
                    nestedColumn === "user_id"
                  ) {
                    const session = mockStorage.chat_sessions[value];
                    if (session && session.user_id === nestedValue) {
                      const now = new Date().toISOString();
                      const updatedSession: MockChatSession = {
                        ...session,
                        ...(data as Partial<MockChatSession>),
                        updated_at: now,
                        id: value,
                        user_id: nestedValue,
                      };
                      mockStorage.chat_sessions[value] = updatedSession;
                      lastData = updatedSession;
                      return {
                        data: cloneData(updatedSession) as T,
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
                    ([msgId, msg]: [string, MockChatMessage]) => {
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

  // Return as MockSupabaseClient
  return client as MockSupabaseClient;
}
