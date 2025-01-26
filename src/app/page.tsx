"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import { ChatMessage } from "@/components/ChatMessage";

interface Message {
  content: string;
  sender: "user" | "assistant";
}

interface FormInputs {
  message: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInputs>();

  const sendMessageMutation = api.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { content: data.reply, sender: "assistant" },
      ]);
      
      void import("@/lib/speech/speak").then(({ speak }) => {
        void speak(data.reply);
      });
    },
  });

  const onSubmit = (data: FormInputs) => {
    setMessages((prev) => [...prev, { content: data.message, sender: "user" }]);
    void sendMessageMutation.mutateAsync({ message: data.message }).then(() => {
      reset();
    });
  };

  return (
    <main className="container mx-auto max-w-2xl p-4">
      <div className="mb-4 rounded-lg bg-white p-4 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Chat with Dobby Unleashed</h1>
        
        <div className="mb-4 h-[60vh] overflow-y-auto rounded-lg bg-gray-50 p-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.content}
              sender={message.sender}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
          <input
            {...register("message", { required: "Message is required" })}
            className="flex-1 rounded-lg border border-gray-300 p-2"
            placeholder="Type your message..."
            disabled={sendMessageMutation.isPending}
          />
          <button
            type="submit"
            disabled={sendMessageMutation.isPending}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
          >
            {sendMessageMutation.isPending ? "Sending..." : "Send"}
          </button>
        </form>
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>
    </main>
  );
}
