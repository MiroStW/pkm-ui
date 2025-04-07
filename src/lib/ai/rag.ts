import { type SearchResult, queryVectorDB } from "./vectordb";
import { generateChunks } from "./embedding";
import { createOpenAIProvider } from "./provider";
import type { Message, CoreMessage } from "ai";

/**
 * Maximum tokens for context to include in the prompt
 */
const MAX_CONTEXT_TOKENS = 4000;

/**
 * Rough estimation of tokens based on character count
 * @param text The text to estimate token count for
 * @returns Estimated token count
 */
function estimateTokenCount(text: string): number {
  // Based on GPT tokenization, approximately 4 characters per token on average
  return Math.ceil(text.length / 4);
}

/**
 * Interface for the context retrieved from the vector store
 */
export interface RetrievedContext {
  documents: SearchResult[];
  contextText: string;
}

/**
 * Get relevant context from vector store based on query text
 * @param queryText The user's query text
 * @param filter Optional metadata filter
 * @returns Object containing retrieved documents and formatted context text
 */
export async function getRelevantContext(
  queryText: string,
  filter?: Record<string, unknown>,
): Promise<RetrievedContext> {
  // Query the vector database for relevant documents
  const searchResults = await queryVectorDB(queryText, 5, filter);

  // Format the context text from relevant documents
  let contextText = searchResults
    .map((doc) => {
      // Format each document with its source information
      const sourceInfo =
        typeof doc.metadata.source === "string"
          ? `Source: ${doc.metadata.source}`
          : "Source: Unknown";

      return `---\n${doc.content ?? ""}\n${sourceInfo}\n`;
    })
    .join("\n");

  // Check if we need to truncate context to fit token limits
  const tokenCount = estimateTokenCount(contextText);

  if (tokenCount > MAX_CONTEXT_TOKENS) {
    // Rechunk the text to fit within token limits
    const contextChunks = generateChunks(contextText, MAX_CONTEXT_TOKENS * 4); // 4 chars per token approx
    contextText = contextChunks[0] ?? "";
  }

  return {
    documents: searchResults,
    contextText,
  };
}

/**
 * System prompt template for retrieval augmented generation
 */
const RAG_SYSTEM_PROMPT = `You are a personal knowledge assistant that helps answer questions based on the user's personal knowledge management (PKM) system.
When responding, follow these guidelines:
1. Use ONLY the provided context to answer questions.
2. If the context doesn't contain the answer, say "I don't have information about that in your knowledge base" instead of making up an answer. In this case also output the context information provided below.
3. Be concise and direct in your responses.
4. When referencing information, cite the source if available.
5. Focus only on answering the current question without adding unnecessary information.

Context information:
{{context}}`;

/**
 * Create a system message with context for RAG
 * @param contextText The context text to include in the system message
 * @returns System message with embedded context
 */
export function createRagSystemMessage(contextText: string): Message {
  return {
    role: "system",
    content: RAG_SYSTEM_PROMPT.replace("{{context}}", contextText),
    id: crypto.randomUUID(),
  };
}

/**
 * Generate a response using RAG approach
 * @param queryText The user's query text
 * @param messages Previous conversation messages
 * @param filter Optional metadata filter
 * @returns The RAG-enhanced OpenAI provider and messages
 */
export async function createRagOpenAIProvider(
  queryText: string,
  messages: CoreMessage[],
  filter?: Record<string, unknown>,
) {
  // Get relevant context from vector store
  const { contextText } = await getRelevantContext(queryText, filter);

  // Create a system message with context
  const systemMessage = createRagSystemMessage(contextText);

  // Convert CoreMessages to Messages with IDs if needed
  const messagesWithIds = messages.map((msg) => {
    if ("id" in msg) return msg as Message;
    return {
      ...msg,
      id: crypto.randomUUID(),
    } as Message;
  });

  // Create a new messages array with the system message
  const enhancedMessages: Message[] = [systemMessage, ...messagesWithIds];

  // Return the OpenAI provider (the messages will be used in the API route)
  return {
    provider: createOpenAIProvider(),
    messages: enhancedMessages,
  };
}
