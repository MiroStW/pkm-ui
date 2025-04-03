#!/bin/bash

# Test script for Pinecone vector database integration
# Run with: ./scripts/test-vector-integration.sh

# Set up temporary environment variables if not running in CI
if [ -z "$PINECONE_API_KEY" ]; then
  echo "No Pinecone API key found in environment, using placeholder for testing..."
  export PINECONE_API_KEY="pinecone-test-api-key"
fi

if [ -z "$PINECONE_INDEX" ]; then
  echo "No Pinecone index found in environment, using placeholder for testing..."
  export PINECONE_INDEX="pinecone-test-index"
fi

if [ -z "$PINECONE_ENVIRONMENT" ]; then
  echo "No Pinecone environment found, using placeholder for testing..."
  export PINECONE_ENVIRONMENT="gcp-starter"
fi

# Run type checking to ensure our code is valid
echo "Running type checking..."
bun check || { echo "Type checking failed!"; exit 1; }

# Run the test script
echo "Running Pinecone integration test..."
bun scripts/test-pinecone.ts || { echo "Pinecone integration test failed!"; exit 1; }

echo "All vector database integration tests passed!"