"use client";

import { cn } from "@/lib/utils";
import type { CoreMessage } from "ai";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: CoreMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Handle different types of content
  const renderContent = () => {
    if (typeof message.content === "string") {
      // Use ReactMarkdown for assistant messages to properly render markdown
      if (!isUser) {
        return (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        );
      }
      // For user messages, render as plain text
      return message.content;
    }

    // If content is an array (parts), render text parts
    if (Array.isArray(message.content)) {
      return message.content.map((part, index) => {
        if ("text" in part) {
          // For assistant messages, use ReactMarkdown for text parts
          if (!isUser && typeof part.text === "string") {
            return (
              <div
                key={index}
                className="prose prose-sm dark:prose-invert max-w-none"
              >
                <ReactMarkdown>{part.text}</ReactMarkdown>
              </div>
            );
          }
          return <span key={index}>{part.text}</span>;
        }
        return null;
      });
    }

    // Fallback
    return "No content available";
  };

  return (
    <div
      className={cn(
        "flex w-full gap-3 p-4",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <Avatar>
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {renderContent()}
      </div>
      {isUser && (
        <Avatar>
          <AvatarFallback>You</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
