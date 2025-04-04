"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatMessage } from "./chatMessage";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  SearchFilters,
  type SearchFilters as SearchFiltersType,
} from "./searchFilters";

export function Chat() {
  const [input, setInput] = useState<string>("");
  const [filters, setFilters] = useState<SearchFiltersType>({
    dateRange: { startDate: null, endDate: null },
    categories: [],
    searchScope: "all",
  });

  const { messages, status, handleInputChange, handleSubmit } = useChat({
    body: {
      filters, // Pass filters as body parameter to the API
    },
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [previousStatus, setPreviousStatus] = useState(status);

  // Determine loading state from status
  const isLoading = status === "streaming" || status === "submitted";

  // Track status changes for CSS transitions
  useEffect(() => {
    // Keep track of the previous status
    setPreviousStatus(status);
  }, [status]);

  // Scroll to bottom when new messages arrive or during streaming
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, status]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
    setInput("");
  };

  // Get the last message to add indicators if needed
  const lastMessage = messages[messages.length - 1];
  const isLastMessageAssistant = lastMessage?.role === "assistant";

  // Determine if we just completed streaming (for the completion indicator)
  const justCompleted =
    status !== "streaming" && previousStatus === "streaming";

  // Handle filter changes
  const handleFilterChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">
            Your conversation will appear here
          </p>
        ) : (
          messages.map((message) => {
            // Skip 'data' messages
            if (message.role === "data") return null;

            return (
              <ChatMessage
                key={message.id}
                message={{
                  role: message.role,
                  content: message.content,
                }}
              />
            );
          })
        )}

        {/* Loading indicator when waiting for first response */}
        {isLoading && status !== "streaming" && (
          <div className="text-muted-foreground flex animate-pulse items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>AI is thinking...</p>
          </div>
        )}

        {/* Streaming indicator when response is being streamed */}
        {status === "streaming" && isLastMessageAssistant && (
          <div className="text-muted-foreground flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"></div>
              <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"></div>
              <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"></div>
            </div>
          </div>
        )}

        {/* Completion indicator with CSS transition */}
        <div
          className={`flex items-center gap-2 text-green-500 transition-all duration-300 ${
            justCompleted
              ? "my-2 max-h-8 opacity-100"
              : "pointer-events-none my-0 max-h-0 opacity-0"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <p className="text-sm">Response complete</p>
        </div>

        {/* This empty div helps us scroll to the bottom */}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleInputChange(e);
            }}
            placeholder="Type your message..."
            className="min-w-0 flex-1 rounded-md border px-3 py-2"
            disabled={isLoading}
          />
          <SearchFilters filters={filters} onChange={handleFilterChange} />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
