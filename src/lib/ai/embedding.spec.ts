import { test, expect, describe } from "bun:test";
import {
  generateChunks,
  createEmbedding,
  createEmbeddings,
  calculateSimilarity,
} from "./embedding";

describe("embedding", () => {
  describe("generateChunks", () => {
    test("splits text into chunks by sentences with default maxChunkLength", () => {
      const input =
        "This is sentence one. This is sentence two. This is sentence three.";
      const chunks = generateChunks(input);
      // Our implementation combines sentences into a single chunk
      // when they're below the maxChunkLength (default 1000)
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toContain("This is sentence one.");
      expect(chunks[0]).toContain("This is sentence two.");
      expect(chunks[0]).toContain("This is sentence three.");
    });

    test("respects maxChunkLength parameter", () => {
      const input =
        "Short sentence one. Short sentence two. Short sentence three. Short sentence four.";
      // Setting max length that can fit roughly 2 sentences
      const chunks = generateChunks(input, 40);
      expect(chunks.length).toBeGreaterThan(1);
      // The first chunk should be less than or equal to maxChunkLength
      if (chunks[0]) {
        expect(chunks[0].length).toBeLessThanOrEqual(40);
      }
    });

    test("handles empty input", () => {
      const chunks = generateChunks("");
      expect(chunks).toHaveLength(0);
    });

    test("combines short sentences to form chunks of appropriate size", () => {
      const longInput = Array(10).fill("Short sentence.").join(" ");
      const chunks = generateChunks(longInput, 100);
      // Should have multiple chunks with reasonable sizes
      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach((chunk) => {
        expect(chunk.length).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("createEmbedding", () => {
    test("returns a mock embedding of correct dimensions", async () => {
      const text = "This is a test sentence.";
      const embedding = await createEmbedding(text);

      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding).toHaveLength(1024);

      // Check that values are numbers and within reasonable range
      embedding.forEach((value) => {
        expect(typeof value).toBe("number");
        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("createEmbeddings", () => {
    test("processes multiple chunks correctly", async () => {
      const chunks = [
        "First test chunk.",
        "Second test chunk.",
        "Third test chunk.",
      ];

      const embeddings = await createEmbeddings(chunks);

      expect(Array.isArray(embeddings)).toBe(true);
      expect(embeddings).toHaveLength(chunks.length);

      // Each embedding should be a 1024-dimensional vector
      embeddings.forEach((embedding) => {
        expect(Array.isArray(embedding)).toBe(true);
        expect(embedding).toHaveLength(1024);
      });
    });
  });

  describe("calculateSimilarity", () => {
    test("returns 1.0 for identical embeddings", () => {
      // Create a properly typed number array
      const embedding: number[] = new Array(10).fill(0).map(() => 0.1);
      const similarity = calculateSimilarity(embedding, embedding);
      expect(similarity).toBeCloseTo(1.0);
    });

    test("returns 0.0 for orthogonal embeddings", () => {
      const embedding1 = [1, 0, 0, 0];
      const embedding2 = [0, 1, 0, 0];
      const similarity = calculateSimilarity(embedding1, embedding2);
      expect(similarity).toBeCloseTo(0.0);
    });

    test("returns -1.0 for opposite embeddings", () => {
      const embedding1 = [1, 1, 1];
      const embedding2 = [-1, -1, -1];
      const similarity = calculateSimilarity(embedding1, embedding2);
      expect(similarity).toBeCloseTo(-1.0);
    });

    test("handles null-ish values in embeddings", () => {
      // Create embeddings with some zeros (simulating null-ish values handled by ??)
      const embedding1 = [0.5, 0, 0.5];
      const embedding2 = [0.5, 0, 0.5];

      const similarity = calculateSimilarity(embedding1, embedding2);
      expect(similarity).toBeCloseTo(1.0);
    });

    test("throws error for mismatched dimensions", () => {
      const embedding1 = [0.1, 0.2, 0.3];
      const embedding2 = [0.1, 0.2];

      expect(() => {
        calculateSimilarity(embedding1, embedding2);
      }).toThrow("Embeddings must have the same dimensions");
    });
  });
});
