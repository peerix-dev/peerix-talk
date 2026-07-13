import { useState, useCallback, useContext, createContext } from "react";

export interface Message {
  id: string;
  peer?: string;
  author: string;
  text: string;
  time: number;
}

export interface Participant {
  peer: string;
  label: string;
  name: string;
  audio?: boolean;
  video?: boolean;
  muted?: boolean;
  mirror?: boolean;
  speaking?: boolean;
  stream?: MediaStream;
}

interface RoomState {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  cam: boolean;
  mic: boolean;
  scr: boolean;
  toggleCam: (next?: boolean) => void;
  toggleMic: (next?: boolean) => void;
  toggleScr: (next?: boolean) => void;
}

const RoomContext = createContext<RoomState | null>(null);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
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

  return (
    <RoomContext.Provider
      value={{
        messages,
        setMessages,
        participants,
        setParticipants,
        cam,
        mic,
        scr,
        toggleCam,
        toggleMic,
        toggleScr,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used within RoomProvider");
  return ctx;
}
