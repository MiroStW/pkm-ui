# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Vector Database Integration

The application uses Pinecone as its vector database for semantic search capabilities. To set up Pinecone:

1. Create a Pinecone account at [pinecone.io](https://www.pinecone.io/)
2. Create a new index with the following settings:

   - Dimensions: 1536 (matches OpenAI's text-embedding-3-small model)
   - Metric: Cosine
   - Pod Type: Starter (for development) or an appropriate size for production

3. Get your API key and index name from the Pinecone dashboard

4. add them to .env

5. Test the integration:
   ```bash
   bun scripts/test-pinecone.ts
   ```

The integration includes:

- Vector storage for document embeddings
- Semantic search using OpenAI embeddings
- Caching layer for improved performance
- Utility functions for querying and storing documents

For more details, see the implementation in `src/lib/ai/vectordb.ts`.
