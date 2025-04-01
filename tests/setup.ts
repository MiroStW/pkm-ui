/**
 * Global setup for Bun tests
 *
 * This file is automatically loaded by Bun when running tests.
 */

/// <reference types="bun-types" />
import { expect, afterEach, type ExpectExtendMatchers } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

// Extend Bun's expect with Testing Library matchers
expect.extend(matchers as unknown as ExpectExtendMatchers<unknown>);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Force test mode for all tests
process.env.USE_MOCK_SUPABASE = "true";
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://mock-supabase-url";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";

console.log("Global test setup complete - Mock Supabase enabled");
