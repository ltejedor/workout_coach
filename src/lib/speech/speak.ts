"use client";

let isSpeechEnabled = false;

export function setSpeechEnabled(enabled: boolean) {
  isSpeechEnabled = enabled;
}

export function speak(text: string) {
  if (!isSpeechEnabled) return;

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);

  // No assignment to `utterance.voice` here.
  // If iOS Safari honors the user’s default voice from Settings,
  // it *could* use Daniel (Enhanced).

  // Cancel any ongoing speech before speaking
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
