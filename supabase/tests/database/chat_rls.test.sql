-- Tests for chat storage RLS policies
BEGIN;

SELECT plan(4); -- 4 statements to run

-- Test if RLS is enabled on tables
SELECT is_rls_enabled('public', 'chat_sessions', 'RLS should be enabled on chat_sessions');
SELECT is_rls_enabled('public', 'chat_messages', 'RLS should be enabled on chat_messages');

-- Test if policies exist
SELECT policies_are('public', 'chat_sessions', ARRAY['User can CRUD their own chat sessions'], 'chat_sessions should have the correct policy');
SELECT policies_are('public', 'chat_messages', ARRAY['User can CRUD messages in their own sessions'], 'chat_messages should have the correct policy');

-- Finish the test
SELECT * FROM finish();

ROLLBACK;