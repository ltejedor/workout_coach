"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/trpc/react";
import { ChatMessage } from "@/components/ChatMessage";
import { SpeechControl } from "@/components/SpeechControl";
import toast from "react-hot-toast";

interface Message {
  content: string;
  sender: "user" | "assistant";
}

interface FormInputs {
  message: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastMotionMessage, setLastMotionMessage] = useState(0);
  const [lastMovementTime, setLastMovementTime] = useState(Date.now());
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

  const sendMotivationMutation = api.sendMessage.useMutation({
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

  const addMotionMessage = useCallback((content: string) => {
    const now = Date.now();
    const messageDebounceTime = 5000; // Minimum time between motion messages in ms
    if (now - lastMotionMessage > messageDebounceTime) {
      setMessages(prev => [...prev, { content, sender: "assistant" }]);
      setLastMotionMessage(now);
      setLastMovementTime(now); // Update last movement time when motion is detected
    }
  }, [lastMotionMessage]);

  const setupMotionListeners = useCallback(() => {
    let lastX: number | undefined;
    let lastY: number | undefined;
    let lastZ: number | undefined;
    let moveCounter = 0;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      let acc = event.acceleration;
      // If acceleration is not available, try accelerationIncludingGravity
      if (!acc || !acc.hasOwnProperty('x')) {
        acc = event.accelerationIncludingGravity;
      }

      // Sometimes there's no valid data, so bail early
      if (!acc || acc.x === null) return;

      // Only process if x, y, z are not null and > 1
      if (acc.x !== null && acc.y !== null && acc.z !== null &&
          Math.abs(acc.x) >= 1 && Math.abs(acc.y) >= 1 && Math.abs(acc.z) >= 1) {
        if (lastX === undefined || lastY === undefined || lastZ === undefined) {
          lastX = acc.x;
          lastY = acc.y;
          lastZ = acc.z;
          return;
        }

        // Now TypeScript knows these values are defined
        const deltaX = Math.abs(acc.x - lastX);
        const deltaY = Math.abs(acc.y - lastY);
        const deltaZ = Math.abs(acc.z - lastZ);

        if (deltaX + deltaY + deltaZ > 3) {
          moveCounter++;
        } else {
          moveCounter = Math.max(0, moveCounter - 1);
        }

        if (moveCounter > 2) {
          addMotionMessage('Detected significant device movement!');
          moveCounter = 0; // reset
        }

        // Update last positions
        lastX = acc.x;
        lastY = acc.y;
        lastZ = acc.z;
      }
    };

    window.addEventListener('devicemotion', handleDeviceMotion, false);

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [addMotionMessage]);

  // Set up periodic motivation check
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastMovement = now - lastMovementTime;

      if (timeSinceLastMovement <= 10000) {
        // If movement detected in last 10 seconds, send supportive message
        void sendMotivationMutation.mutateAsync({
          message: "Say something supportive about my workout."
        });
      } else {
        // If no movement detected, send motivational message
        void sendMotivationMutation.mutateAsync({
          message: "Say something mean to get me to start running again and keep me motivated."
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [lastMovementTime, sendMotivationMutation]);

  useEffect(() => {
    // Check if we need to request permission (iOS 13+)
    if (
      typeof window.DeviceMotionEvent !== 'undefined' &&
      typeof window.DeviceMotionEvent.requestPermission === 'function'
    ) {
      const button = document.createElement('button');
      button.className = 'fixed bottom-4 right-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600';
      button.textContent = 'Enable Motion';

      const handleClick = async () => {
        try {
          const response = await window.DeviceMotionEvent.requestPermission?.();
          if (response === 'granted') {
            toast.success('Motion detection enabled!');
            setupMotionListeners();
            button.remove();
          } else {
            toast.error('Motion permission denied');
          }
        } catch (err) {
          toast.error('Error requesting motion permission');
          console.error('Error requesting motion permission:', err);
        }
      };

      button.addEventListener('click', () => {
        void handleClick();
      });

      document.body.appendChild(button);

      return () => {
        button.remove();
      };
    } else {
      // No permission needed, setup listeners directly
      return setupMotionListeners();
    }
  }, [setupMotionListeners]);

  const onSubmit = (data: FormInputs) => {
    setMessages((prev) => [...prev, { content: data.message, sender: "user" }]);
    void sendMessageMutation.mutateAsync({ message: data.message }).then(() => {
      reset();
    });
  };

  return (
    <main className="container mx-auto max-w-2xl p-4">
      <div className="mb-4 rounded-lg bg-white p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Chat with Dobby Unleashed</h1>
          <SpeechControl />
        </div>

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
