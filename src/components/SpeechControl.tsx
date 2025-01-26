"use client";

import { useState } from "react";
import { setSpeechEnabled } from "@/lib/speech/speak";

export function SpeechControl() {
  const [isEnabled, setIsEnabled] = useState(false);

  const handleToggle = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    setSpeechEnabled(newState);
    
    // Trigger an empty utterance to enable future programmatic speech
    if (newState && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`rounded-lg px-4 py-2 text-white ${
        isEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
      }`}
    >
      Speech {isEnabled ? 'Enabled' : 'Disabled'}
    </button>
  );
}
