import { forwardRef, useEffect, useRef, useState } from "react";
import { toSvg } from "jdenticon";
import type { Participant } from "@/hooks/use-room";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { MicOff02Icon } from "@hugeicons/core-free-icons";

export const VideoTile = forwardRef<HTMLDivElement, Participant>(
  function VideoTile(
    { peer, name, audio, video, mirror, muted, speaking, stream },
    ref,
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [loading, setLoading] = useState(video);

    useEffect(() => {
      const el = videoRef.current;
      if (!el || !stream) return;
      el.srcObject = stream;
      el.play().catch(() => {});
    }, [audio, video, stream]);

    return (
      <div
        ref={ref}
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-md border-2 bg-linear-to-br from-[#4f46e5]/20 to-[#10b981]/20 shadow-sm transition-colors duration-200 motion-reduce:transition-none",
          speaking ? "border-[#10b981]/50" : "border-[#4f46e5]/50",
        )}
      >
        {video && (
          <video
            ref={videoRef}
            className={cn(
              "h-full w-full object-cover",
              mirror && "rotate-y-180",
            )}
            muted={muted ?? false}
            onPlaying={() => setLoading(false)}
            onLoadedData={() => setLoading(false)}
          />
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div
              className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary"
              role="status"
              aria-label="Loading"
            />
          </div>
        )}

        {!loading && !video && (
          <div
            className="absolute inset-0 flex items-center justify-center [&>svg]:max-h-[50%] [&>svg]:max-w-[50%]"
            dangerouslySetInnerHTML={{ __html: toSvg(peer || name, 64) }}
          />
        )}

        {!loading && !audio && (
          <div className="absolute top-1 right-1 rounded-full bg-muted p-1">
            <HugeiconsIcon
              icon={MicOff02Icon}
              size={14}
              className="text-destructive"
            />
          </div>
        )}

        {name && (
          <div className="absolute bottom-1 left-1 rounded bg-muted px-1 text-xs text-muted-foreground">
            {name}
          </div>
        )}
      </div>
    );
  },
);
