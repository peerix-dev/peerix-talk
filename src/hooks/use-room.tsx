import { useState, useCallback } from "react";

export interface Message {
  author: string;
  text: string;
  time: number;
}

export function useRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [cam, setCam] = useState(false);
  const [mic, setMic] = useState(false);
  const [scr, setScr] = useState(false);

  const toggleCam = useCallback(
    (next?: boolean) => setCam(next !== undefined ? next : (prev) => !prev),
    [],
  );
  const toggleMic = useCallback(
    (next?: boolean) => setMic(next !== undefined ? next : (prev) => !prev),
    [],
  );
  const toggleScr = useCallback(
    (next?: boolean) => setScr(next !== undefined ? next : (prev) => !prev),
    [],
  );

  return {
    messages,
    setMessages,
    cam,
    mic,
    scr,
    toggleCam,
    toggleMic,
    toggleScr,
  };
}
