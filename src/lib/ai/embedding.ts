// Define the embedding model
export const EMBEDDING_MODEL = "text-embedding-3-small";

/**
 * Generate chunks from a text input
 * @param input The text to chunk
 * @param maxChunkLength Maximum length of each chunk (optional)
 * @returns Array of text chunks
 */
export const generateChunks = (
  input: string,
  maxChunkLength = 1000,
): string[] => {
  // Simple chunking by splitting on periods and filtering empty items
  const sentences = input
    .trim()
    .split(".")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => s + ".");

  const chunks: string[] = [];
  let currentChunk = "";

  // Combine sentences into chunks of appropriate size
  for (const sentence of sentences) {
    if (
      currentChunk.length + sentence.length > maxChunkLength &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk);
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  // Add the last chunk if it's not empty
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
};

/**
 * Create an embedding for a text chunk
 * This is a placeholder implementation that will need to be updated
 * with the correct AI SDK integration in Phase 3 of the implementation plan
 * @param text The text to embed
 * @returns Promise resolving to an array of numbers representing the embedding
 */
export const createEmbedding = async (text: string): Promise<number[]> => {
  try {
    // Mock implementation for now
    // In Phase 3, we'll implement this with the OpenAI embeddings API
    console.log(`Creating embedding for text: "${text.substring(0, 50)}..."`);

    // Return a mock embedding (in practice, this would come from the OpenAI API)
    // Random 1536-dimensional embedding (common size for OpenAI embeddings)
    const mockEmbedding = Array(1536)
      .fill(0)
      .map(() => Math.random() - 0.5);
    return mockEmbedding;
  } catch (error) {
    console.error("Error creating embedding:", error);
    throw error;
  }
};

/**
 * Create embeddings for multiple text chunks
 * @param chunks Array of text chunks to embed
 * @returns Promise resolving to an array of embeddings
 */
export const createEmbeddings = async (
  chunks: string[],
): Promise<number[][]> => {
  const embeddings: number[][] = [];

  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk);
    embeddings.push(embedding);
  }

  return embeddings;
};

/**
 * Calculate cosine similarity between two embeddings
 * @param embedding1 First embedding
 * @param embedding2 Second embedding
 * @returns Similarity score (0-1, where 1 is most similar)
 */
export const calculateSimilarity = (
  embedding1: number[],
  embedding2: number[],
): number => {
  if (embedding1.length !== embedding2.length) {
    throw new Error("Embeddings must have the same dimensions");
  }

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  // Use loop to ensure we have defined values
  for (let i = 0; i < embedding1.length; i++) {
    // Check if the values are defined, using nullish coalescing operator
    const val1 = embedding1[i] ?? 0;
    const val2 = embedding2[i] ?? 0;

    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
};
