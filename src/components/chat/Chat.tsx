"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/Button";

export function Chat() {
  const [input, setInput] = useState<string>("");
  const { messages, status, handleInputChange, handleSubmit } = useChat();

  const isLoading = status === "submitted";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
    setInput("");
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
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
}
