"use client";

interface ChatMessageProps {
  message: string;
  sender: "assistant";
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-3xl font-bold text-center max-w-3xl px-8 py-6 rounded-lg bg-gray-200 text-gray-800">
        {message}
      </div>
    </div>
  );
}
