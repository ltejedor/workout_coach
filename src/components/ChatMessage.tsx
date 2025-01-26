"use client";

interface ChatMessageProps {
  message: string;
  sender: "user" | "assistant";
}

export function ChatMessage({ message, sender }: ChatMessageProps) {
  return (
    <div
      className={`mb-4 flex ${
        sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          sender === "user"
            ? "bg-blue-500 text-white"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
