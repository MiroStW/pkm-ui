# Supabase Integration for PKM Chatbot

This directory contains the Supabase database configuration for the PKM Chatbot project.

## Database Schema

The database schema includes tables for:

- `chat_sessions`: Stores chat sessions with user associations
- `chat_messages`: Stores individual messages within chat sessions

## Migrations

The migrations directory contains SQL scripts to set up the database schema:

- `01_chat_storage.sql`: Creates tables for chat sessions and messages, along with appropriate Row Level Security (RLS) policies

## Testing

To verify that the Supabase integration is working correctly, run:

```bash
# Navigate to the pkm-ui directory
cd pkm-ui

# Run the test script
bun run src/tests/db-test.ts
```

## Local Development

For local development with Supabase:

1. Create a `.env.local` file in the project root with your Supabase credentials:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

2. Apply migrations to your local Supabase instance:

```bash
# Using the Supabase CLI
supabase db push
```

## Production Setup

For production, ensure that Row Level Security (RLS) policies are properly configured to protect user data. The migrations include RLS policies that restrict access to:

- Users can only see their own chat sessions
- Users can only access messages in their own sessions
