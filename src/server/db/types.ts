export interface Database {
  public: {
    Tables: {
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
          is_favorite: boolean;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
          updated_at?: string;
          is_favorite?: boolean;
          metadata?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
          is_favorite?: boolean;
          metadata?: Record<string, unknown>;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: "user" | "assistant";
          content: string;
          created_at?: string;
          metadata?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: "user" | "assistant";
          content?: string;
          created_at?: string;
          metadata?: Record<string, unknown>;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          sync_chat_history: boolean;
          sync_settings: boolean;
          continue_conversations: boolean;
          created_at: string;
          updated_at: string;
          settings_data: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          user_id: string;
          sync_chat_history?: boolean;
          sync_settings?: boolean;
          continue_conversations?: boolean;
          created_at?: string;
          updated_at?: string;
          settings_data?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          user_id?: string;
          sync_chat_history?: boolean;
          sync_settings?: boolean;
          continue_conversations?: boolean;
          created_at?: string;
          updated_at?: string;
          settings_data?: Record<string, unknown>;
        };
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
  };
}
