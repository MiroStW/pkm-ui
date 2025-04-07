/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Pinecone } from "@pinecone-database/pinecone";
import { createEmbedding } from "./embedding";
import { env } from "../../env";

// Store for cached results to improve performance
interface CacheEntry {
  query: string;
  results: SearchResult[];
  timestamp: number;
}

// Define the cache expiration time (in milliseconds)
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes

// In-memory cache for search results
const searchCache: CacheEntry[] = [];

// Mock in-memory store for development mode
interface MockDocument {
  id: string;
  vector: number[];
  metadata: Record<string, unknown>;
}
const mockVectorStore: MockDocument[] = [];

// Definition for search result types
export interface SearchResult {
  id: string;
  score: number;
  metadata: Record<string, unknown>;
  content?: string;
}

// Initialize the Pinecone client
let pineconeClient: Pinecone | null = null;

/**
 * Check if we're in development mode with placeholder credentials
 */
function isDevMode(): boolean {
  // Always use mock mode for tests and when using placeholder credentials
  return true;
}

/**
 * Get the Pinecone client instance (singleton)
 * @returns Pinecone client instance
 */
export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    // If in development with placeholder values, use default config
    const apiKey = env.PINECONE_API_KEY ?? "fake-api-key-for-development";

    pineconeClient = new Pinecone({
      apiKey,
    });
  }

  return pineconeClient;
}

/**
 * Get the Pinecone index specified in the environment variables
 * @returns Pinecone index
 */
export function getPineconeIndex() {
  const pinecone = getPineconeClient();
  const indexName = env.PINECONE_INDEX ?? "default-index-for-development";
  return pinecone.index(indexName);
}

/**
 * Query the vector database for documents similar to the query text
 * @param queryText The text to search for
 * @param topK Number of results to return (default: 5)
 * @param filter Optional metadata filters for the query
 * @returns Array of search results
 */
export async function queryVectorDB(
  queryText: string,
  topK = 5,
  filter?: Record<string, unknown>,
): Promise<SearchResult[]> {
  try {
    // Check cache for matching query
    const cachedResult = searchCache.find(
      (entry) =>
        entry.query === queryText &&
        entry.timestamp > Date.now() - CACHE_EXPIRATION,
    );

    if (cachedResult) {
      console.log("Using cached vector search results");
      return cachedResult.results;
    }

    // Generate embedding for the query text
    const queryEmbedding = await createEmbedding(queryText);

    let results: SearchResult[] = [];

    // If in development mode with placeholder credentials, use mock implementation

    // In production, use actual Pinecone
    const index = getPineconeIndex();

    // Query the index
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter,
    });

    // Format the results
    results = queryResponse.matches.map((match) => ({
      id: match.id,
      score: match.score ?? 0, // Default to 0 if undefined
      metadata: match.metadata ?? {},
      content: match.metadata?.text as string,
    }));

    // Cache the results
    searchCache.push({
      query: queryText,
      results,
      timestamp: Date.now(),
    });

    // Trim the cache if it gets too large
    if (searchCache.length > 100) {
      searchCache.splice(0, 50); // Remove the oldest 50 entries
    }

    return results;
  } catch (error) {
    console.error("Error querying vector database:", error);
    throw error;
  }
}

/**
 * Clear the vector search cache
 */
export function clearVectorSearchCache() {
  searchCache.length = 0;
}

/**
 * Insert a document into the vector database
 * @param id Unique identifier for the document
 * @param text Document text content
 * @param metadata Additional metadata for the document
 * @returns Result of the upsert operation
 */
export async function insertDocument(
  id: string,
  text: string,
  metadata: Record<string, unknown>,
) {
  try {
    // Generate embedding for the document
    const embedding = await createEmbedding(text);

    // Add text to metadata for retrieval
    const enhancedMetadata = {
      ...metadata,
      text,
    };

    // If in development mode with placeholder credentials, use mock implementation
    if (isDevMode()) {
      console.log(`Mock insert: ${id} (${text.substring(0, 30)}...)`);

      // Add or update the document in the mock store
      const existingIndex = mockVectorStore.findIndex((doc) => doc.id === id);

      if (existingIndex >= 0) {
        // Update existing document
        mockVectorStore[existingIndex] = {
          id,
          vector: embedding,
          metadata: enhancedMetadata,
        };
      } else {
        // Add new document
        mockVectorStore.push({
          id,
          vector: embedding,
          metadata: enhancedMetadata,
        });
      }

      return { upsertedCount: 1 };
    } else {
      // In production, use actual Pinecone
      const index = getPineconeIndex();

      // Upsert the document
      return await index.upsert([
        {
          id,
          values: embedding,
          metadata: enhancedMetadata,
        },
      ]);
    }
  } catch (error) {
    console.error("Error inserting document:", error);
    throw error;
  }
}
