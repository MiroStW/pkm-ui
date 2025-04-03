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

// Define type for OpenAI API response
interface OpenAIEmbeddingResponse {
  data: {
    embedding: number[];
    index: number;
    object: string;
  }[];
  model: string;
  object: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Create an embedding for a text chunk
 * @param text The text to embed
 * @returns Promise resolving to an array of numbers representing the embedding
 */
export const createEmbedding = async (text: string): Promise<number[]> => {
  try {
    // Get API key
    const apiKey = process.env.OPENAI_API_KEY;

    // Use mock embeddings if:
    // 1. We're in development mode or
    // 2. The API key is missing/invalid or
    // 3. The API key is a placeholder
    const useMockEmbedding =
      process.env.NODE_ENV === "development" ||
      !apiKey ||
      apiKey.includes("test") ||
      apiKey === "fake-api-key";

    if (useMockEmbedding) {
      console.log(
        `Creating mock embedding for text: "${text.substring(0, 50)}..."`,
      );

      // Return a deterministic mock embedding based on the hash of the text
      // This ensures similar texts get similar embeddings
      const hash = text.split("").reduce((acc, char) => {
        return (acc * 31 + char.charCodeAt(0)) & 0xffffffff;
      }, 0);

      // Seed the random generator with the hash of the text
      const seededRandom = (seed: number) => {
        return () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };
      };

      const random = seededRandom(hash);

      // Generate a stable mock embedding (dimensions match OpenAI's embedding model)
      const mockEmbedding = Array(1536)
        .fill(0)
        .map(() => random() - 0.5);

      return mockEmbedding;
    }

    // In production with a valid API key, use actual OpenAI API
    console.log(
      `Creating OpenAI embedding for text: "${text.substring(0, 50)}..."`,
    );

    // Make an API call to OpenAI's embeddings endpoint
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: text,
        model: EMBEDDING_MODEL,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const result = (await response.json()) as OpenAIEmbeddingResponse;
    return result.data[0]?.embedding ?? [];
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
