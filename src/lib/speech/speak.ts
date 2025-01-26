"use client";

export function speak(text: string) {
  // Check if speech synthesis is available
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);

  // Function to set voice
  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const googleUKMale = voices.find(
      voice => voice.name === 'Zarvox' && voice.lang === 'en-US'
    );
    if (googleUKMale) {
      utterance.voice = googleUKMale;
    } else {
      // Fallback to any English voice if Google UK Male is not available
      const englishVoice = voices.find(voice => voice.lang.startsWith('en-'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }
  };

  // Try to set voice immediately
  setVoice();

  // If voices aren't loaded yet, wait for them
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = setVoice;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Speak the text
  window.speechSynthesis.speak(utterance);
}
