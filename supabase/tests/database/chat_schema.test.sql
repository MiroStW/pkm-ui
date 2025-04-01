-- Tests for chat storage schema
BEGIN;

SELECT plan(9); -- 9 statements to run

-- Test if tables exist
SELECT has_table('public', 'chat_sessions', 'chat_sessions table should exist');
SELECT has_table('public', 'chat_messages', 'chat_messages table should exist');

-- Test if chat_sessions has the right columns
SELECT has_column('public', 'chat_sessions', 'id', 'chat_sessions should have id column');
SELECT has_column('public', 'chat_sessions', 'user_id', 'chat_sessions should have user_id column');
SELECT has_column('public', 'chat_sessions', 'title', 'chat_sessions should have title column');

-- Test if chat_messages has the right columns
SELECT has_column('public', 'chat_messages', 'id', 'chat_messages should have id column');
SELECT has_column('public', 'chat_messages', 'session_id', 'chat_messages should have session_id column');
SELECT has_column('public', 'chat_messages', 'role', 'chat_messages should have role column');
SELECT has_column('public', 'chat_messages', 'content', 'chat_messages should have content column');

-- Finish the test
SELECT * FROM finish();

ROLLBACK;