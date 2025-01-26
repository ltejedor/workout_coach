"use client";

export function speak(text: string) {
  // Check if speech synthesis is available
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create a new utterance with the text
  const utterance = new SpeechSynthesisUtterance(text);

  // Speak the text
  window.speechSynthesis.speak(utterance);
}
