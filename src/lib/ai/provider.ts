import { openai } from "@ai-sdk/openai";

// Default model to use for chat completions
export const DEFAULT_MODEL = "gpt-4o-mini";

// Default model to use for embeddings
export const EMBEDDING_MODEL = "text-embedding-3-small";

// API key for OpenAI
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Creates an OpenAI provider with the default model
 * @returns Configured OpenAI provider
 */
export function createOpenAIProvider() {
  if (!OPENAI_API_KEY && process.env.NODE_ENV !== "test") {
    console.warn("OpenAI API key is not configured");
  }

  return openai(DEFAULT_MODEL);
}

/**
 * Default options for streaming text
 */
export const defaultStreamOptions = {
  temperature: 0.7,
  maxTokens: 1000,
};
