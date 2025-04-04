-- User Settings Table for Cross-Device Synchronization
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_chat_history BOOLEAN DEFAULT TRUE,
  sync_settings BOOLEAN DEFAULT TRUE,
  continue_conversations BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings_data JSONB DEFAULT '{}'::JSONB
);

-- Add RLS policy to protect user settings
CREATE POLICY "Users can only CRUD their own settings"
ON user_settings
FOR ALL
USING (auth.uid() = user_id);

-- Enable Row Level Security on table
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Add trigger to update updated_at column
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();