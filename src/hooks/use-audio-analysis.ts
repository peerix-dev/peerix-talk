import { useEffect, useRef, useState } from "react";

const BAR_COUNT = 21;

export function useAudioLevels(stream: MediaStream | null) {
  const streamRef = useRef<MediaStream | null>(stream);
  const [levels, setLevels] = useState(() => Array(BAR_COUNT).fill(0));
  const [tick, setTick] = useState(0);

  // Detect stream changes
  useEffect(() => {
    if (stream !== streamRef.current) {
      streamRef.current = stream;
      setTick((t) => t + 1);
    }
  }, [stream]);

  // Setup audio analysis when stream changes
  useEffect(() => {
    const currentStream = streamRef.current;

    if (!currentStream) {
      setLevels(Array(BAR_COUNT).fill(0));
      return;
    }

    if (!currentStream.getAudioTracks().length) {
      setLevels(Array(BAR_COUNT).fill(0));
      return;
    }

    try {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(currentStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const binsPerBar = Math.floor(bufferLength / BAR_COUNT);

      let timer: ReturnType<typeof setTimeout>;

      function update() {
        analyser.getByteFrequencyData(dataArray);

        const newLevels: number[] = [];
        for (let i = 0; i < BAR_COUNT; i++) {
          let sum = 0;
          for (let j = 0; j < binsPerBar; j++) {
            sum += dataArray[i * binsPerBar + j];
          }
          newLevels.push(sum / binsPerBar / 255);
        }
        setLevels(newLevels);
        timer = setTimeout(update, 100);
      }

      update();

      return () => {
        clearTimeout(timer);
        audioContext.close();
        setLevels(Array(BAR_COUNT).fill(0));
      };
    } catch {
      setLevels(Array(BAR_COUNT).fill(0));
    }
  }, [tick]);

  return levels;
}
