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
