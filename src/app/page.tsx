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
  const [isMoving, setIsMoving] = useState(false);
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

  // Function to handle motion state changes
  const handleMotionStateChange = useCallback((newIsMoving: boolean) => {
    if (newIsMoving !== isMoving) {
      setIsMoving(newIsMoving);
      if (newIsMoving) {
        void sendMotivationMutation.mutateAsync({
          message: "You're my coach. Say something very enthusiastic and encouraging about me starting to run!"
        });
      } else {
        void sendMotivationMutation.mutateAsync({
          message: "You're my coach. Say something extremely mean about me stopping my workout and tell me to get moving again!"
        });
      }
    }
    if (newIsMoving) {
      setLastMovementTime(Date.now());
    }
  }, [isMoving, sendMotivationMutation]);

  const setupMotionListeners = useCallback(() => {
    let lastX: number | undefined;
    let lastY: number | undefined;
    let lastZ: number | undefined;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      let acc = event.acceleration;
      if (!acc || !acc.hasOwnProperty('x')) {
        acc = event.accelerationIncludingGravity;
      }

      if (!acc || acc.x === null) return;

      if (acc.x !== null && acc.y !== null && acc.z !== null) {
        if (lastX === undefined || lastY === undefined || lastZ === undefined) {
          lastX = acc.x;
          lastY = acc.y;
          lastZ = acc.z;
          return;
        }

        const deltaX = Math.abs(acc.x - lastX);
        const deltaY = Math.abs(acc.y - lastY);
        const deltaZ = Math.abs(acc.z - lastZ);

        const totalMovement = deltaX + deltaY + deltaZ;
        const newIsMoving = totalMovement > 2;

        handleMotionStateChange(newIsMoving);

        lastX = acc.x;
        lastY = acc.y;
        lastZ = acc.z;
      }
    };

    window.addEventListener('devicemotion', handleDeviceMotion, false);

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [handleMotionStateChange]);

  // Set up periodic motivation check for sustained states
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastMovement = now - lastMovementTime;

      if (isMoving && timeSinceLastMovement <= 10000) {
        void sendMotivationMutation.mutateAsync({
          message: "You're my workout coach. Say something supportive about the fact that I'm runnning."
        });
      } else if (!isMoving && timeSinceLastMovement > 10000) {
        void sendMotivationMutation.mutateAsync({
          message: "You're my workout coach. Say something horrifyingly mean to get me to start moving again."
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [lastMovementTime, isMoving, sendMotivationMutation]);

  useEffect(() => {
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
