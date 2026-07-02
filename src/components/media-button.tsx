import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MicOff01Icon,
  VideoIcon,
  Mic01Icon,
  VideoOffIcon,
  ChevronDown,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MediaKind = "audio" | "video";

interface MediaButtonProps {
  kind: MediaKind;
  enabled: boolean;
  deviceId: string;
  onToggle: () => void;
  onDeviceChange: (deviceId: string) => void;
}

export interface MediaDevice {
  deviceId: string;
  label: string;
}

const BAR_COUNT = 21;

const ICON_MAP = {
  audio: { on: Mic01Icon, off: MicOff01Icon },
  video: { on: VideoIcon, off: VideoOffIcon },
} as const;

async function enumerateDevices(kind: MediaKind): Promise<MediaDevice[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((d) => d.kind === `${kind}input`)
      .map(
        (d) =>
          ({
            deviceId: d.deviceId,
            label:
              d.label ||
              `${kind === "audio" ? "Microphone" : "Camera"} ${d.deviceId.slice(0, 5)}`,
          }) as MediaDevice,
      );
  } catch {
    return [];
  }
}

function startAudioAnalysis(
  stream: MediaStream,
  barCount: number,
  onUpdate: (levels: number[]) => void,
): () => void {
  let timer: ReturnType<typeof setTimeout>;

  let audioContext: AudioContext | null = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 64;
  analyser.smoothingTimeConstant = 0.8;

  source.connect(analyser);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function updateLevels() {
    analyser.getByteFrequencyData(dataArray);

    // Map frequency bins to bars, averaging nearby bins
    const newLevels: number[] = [];
    const binsPerBar = Math.floor(bufferLength / barCount);
    for (let i = 0; i < barCount; i++) {
      let sum = 0;
      for (let j = 0; j < binsPerBar; j++) {
        sum += dataArray[i * binsPerBar + j];
      }
      newLevels.push(sum / binsPerBar / 255);
    }
    onUpdate(newLevels);
    timer = setTimeout(updateLevels, 100);
  }

  updateLevels();

  return () => {
    if (audioContext) {
      clearTimeout(timer);
      audioContext.close();
      audioContext = null;
      onUpdate(Array(barCount).fill(0));
    }
  };
}

export function MediaButton({
  kind,
  enabled,
  deviceId,
  onToggle,
  onDeviceChange,
}: MediaButtonProps) {
  const icon = ICON_MAP[kind][enabled ? "on" : "off"];
  const { t } = useTranslation();
  const [devices, setDevices] = useState<MediaDevice[]>([]);
  const [audioLevels, setAudioLevels] = useState(Array(BAR_COUNT).fill(0));
  const [currentDeviceId, setCurrentDeviceId] = useState<string>(deviceId);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream>(null);
  const disposeAudioRef = useRef<() => void>(null);
  const [videoReady, setVideoReady] = useState(false);

  const startMediaProcessing = async (deviceId: string) => {
    setVideoReady(false);
    const stream = await navigator.mediaDevices.getUserMedia({
      [kind]: deviceId ? { deviceId: { exact: deviceId } } : true,
    });
    streamRef.current = stream;
    const foundDevices = await enumerateDevices(kind);
    setDevices(foundDevices);
    if (foundDevices.length && !currentDeviceId) {
      setCurrentDeviceId(foundDevices[0].deviceId);
    }
    if (kind === "video") {
      setVideoReady(false);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } else {
      disposeAudioRef.current?.();
      disposeAudioRef.current = startAudioAnalysis(
        stream,
        BAR_COUNT,
        (levels) => setAudioLevels(levels),
      );
    }
  };

  const stopMediaProcessing = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    disposeAudioRef.current?.();
  };

  const handleOpenChange = async (open: boolean) => {
    if (open) startMediaProcessing(currentDeviceId);
    else {
      stopMediaProcessing();
      onDeviceChange(currentDeviceId);
    }
  };

  const handleDeviceChange = (deviceId: string) => {
    setCurrentDeviceId(deviceId);
    stopMediaProcessing();
    startMediaProcessing(deviceId);
  };

  // Clean up
  useEffect(() => {
    return () => {
      stopMediaProcessing();
    };
  }, []);

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <ButtonGroup>
        <Button
          size="lg"
          variant={enabled ? "outline" : "destructive"}
          onClick={onToggle}
        >
          <HugeiconsIcon icon={icon} />
        </Button>
        <DropdownMenuTrigger asChild>
          <Button size="icon-lg" variant={enabled ? "outline" : "destructive"}>
            <HugeiconsIcon icon={ChevronDown} />
          </Button>
        </DropdownMenuTrigger>
      </ButtonGroup>
      <DropdownMenuContent className="w-56" align="end">
        {kind === "audio" && (
          <>
            <div className="flex items-end justify-center gap-1 h-16">
              {audioLevels.map((level, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-primary transition-all duration-75"
                  style={{
                    height: `${Math.max(8, level * 100)}%`,
                    opacity: 0.3 + level * 0.7,
                  }}
                />
              ))}
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        {kind === "video" && (
          <>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onPlaying={() => setVideoReady(true)}
                onLoadedData={() => setVideoReady(true)}
                className="rounded-md w-full aspect-video object-cover bg-muted rotate-y-180"
              />
              {!videoReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            value={currentDeviceId}
            onValueChange={handleDeviceChange}
          >
            {devices.map((device) => (
              <DropdownMenuRadioItem
                key={device.deviceId}
                value={device.deviceId}
                onSelect={(event) => event.preventDefault()}
              >
                {device.label}
              </DropdownMenuRadioItem>
            ))}
            {devices.length === 0 && (
              <DropdownMenuRadioItem disabled value="">
                {t("actions.noInputDevices")}
              </DropdownMenuRadioItem>
            )}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
