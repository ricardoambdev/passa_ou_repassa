"use client";

import { useCallback, useEffect, useRef } from "react";

type SoundName =
  | "question"
  | "correct"
  | "wrong"
  | "challenge"
  | "pass"
  | "repass"
  | "pay"
  | "score"
  | "timer-tick"
  | "timer-loop"
  | "timer-end"
  | "game-over"
  | "penalty"
  | "cricket"
  | "vou-nada"
  | "michael-jackson-hee-hee"
  | "sexy-meaw";

export function useSounds() {
  const allSounds = useRef<HTMLAudioElement[]>([]);
  const lop = useRef<HTMLAudioElement | null>(null);

  function stopAll() {
    if (lop.current) {
      lop.current.pause();
      lop.current.currentTime = 0;
      lop.current = null;
    }
    allSounds.current.forEach((el) => {
      el.pause();
      el.currentTime = 0;
    });
    allSounds.current = [];
  }

  function track(el: HTMLAudioElement) {
    el.addEventListener("ended", () => {
      allSounds.current = allSounds.current.filter((s) => s !== el);
    });
    allSounds.current.push(el);
  }

  const playSound = useCallback((name: SoundName) => {
    try {
      stopAll();

      const el = new Audio(`/sounds/${name}.mp3`);
      el.volume = name === "timer-loop" || name === "timer-tick" ? 0.3 : 0.5;

      if (name === "timer-loop" || name === "timer-tick") {
        el.loop = true;
        lop.current = el;
      } else {
        track(el);
      }

      el.play().catch(() => {});
    } catch {}
  }, []);

  const stopSound = useCallback(() => {
    stopAll();
  }, []);

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  return { playSound, stopSound };
}
