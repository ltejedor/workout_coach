"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/trpc/react";
import { ChatMessage } from "@/components/ChatMessage";
import { SpeechControl } from "@/components/SpeechControl";
import { EnableMotionButton } from "@/components/EnableMotionButton";

export default function Home() {
  const [latestMessage, setLatestMessage] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [lastMovementTime, setLastMovementTime] = useState(Date.now());
  const [showMotionButton, setShowMotionButton] = useState(false);

  const sendMotivationMutation = api.sendMessage.useMutation({
    onSuccess: (data) => {
      setLatestMessage(data.reply);

      void import("@/lib/speech/speak").then(({ speak }) => {
        void speak(data.reply);
      });
    },
  });

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
    let lastEventTime = 0; // Track last time we processed an event

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const now = Date.now();

      // Throttle: ignore if < X ms since last check
      if (now - lastEventTime < 300) {
        return;
      }
      lastEventTime = now;

      let acc = event.acceleration;
      if (!acc || !acc.hasOwnProperty('x')) {
        acc = event.accelerationIncludingGravity;
      }
      if (!acc || acc.x == null || acc.y == null || acc.z == null) {
        return;
      }

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

      // Maybe bump this threshold higher so small jitters don't trigger movement
      const newIsMoving = totalMovement > 3;

      handleMotionStateChange(newIsMoving);

      lastX = acc.x;
      lastY = acc.y;
      lastZ = acc.z;
    };

    window.addEventListener('devicemotion', handleDeviceMotion);
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [handleMotionStateChange]);


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
      setShowMotionButton(true);
    } else {
      setupMotionListeners();
    }
  }, [setupMotionListeners]);

  return (
    <main className="min-h-screen">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 flex justify-center space-x-4">
        <SpeechControl />
        {showMotionButton && (
          <EnableMotionButton onPermissionGranted={setupMotionListeners} />
        )}
      </div>

      <div className="h-screen flex items-center justify-center p-4">
        {latestMessage && <ChatMessage message={latestMessage} sender="assistant" />}
      </div>
    </main>
  );
}
