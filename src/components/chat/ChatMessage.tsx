"use client";

import { cn } from "@/lib/utils";
import type { CoreMessage } from "ai";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";

interface ChatMessageProps {
  message: CoreMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Handle different types of content
  const renderContent = () => {
    if (typeof message.content === "string") {
      return message.content;
    }

    // If content is an array (parts), render text parts
    if (Array.isArray(message.content)) {
      return message.content.map((part, index) => {
        if ("text" in part) {
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
