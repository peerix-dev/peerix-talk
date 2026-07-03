import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { VideoTile, type VideoTileProps } from "@/views/room/video-tile";

const PARTICIPANTS: VideoTileProps[] = [
  { id: "1", name: "Alice", audio: false, video: false, speaking: false },
  { id: "2", name: "Bob", audio: true, video: false, speaking: true },
  { id: "3", name: "Charlie", audio: true, video: false, speaking: false },
  { id: "4", name: "David", audio: true, video: false, speaking: false },
  { id: "5", name: "Eve", audio: false, video: false, speaking: false },
  { id: "6", name: "Frank", audio: true, video: false, speaking: false },
  { id: "7", name: "Grace", audio: true, video: false, speaking: false },
  { id: "8", name: "Heidi", audio: true, video: false, speaking: false },
  { id: "9", name: "Ivan", audio: false, video: false, speaking: false },
];

export function VideoGrid({
  asideOpen = false,
  className = "",
}: {
  asideOpen?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef(new Map<string, HTMLDivElement>());
  const prevRectsRef = useRef(new Map<string, DOMRect>());
  const [cols, setCols] = useState(1);
  const [rows, setRows] = useState(1);

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const nextRects = new Map<string, DOMRect>();

    for (const [id, el] of tileRefs.current) {
      const rect = el.getBoundingClientRect();
      nextRects.set(id, rect);

      const prev = prevRectsRef.current.get(id);
      if (!prev || reduceMotion) continue;

      const dx = prev.left - rect.left;
      const dy = prev.top - rect.top;
      const sx = prev.width / rect.width;
      const sy = prev.height / rect.height;

      if (
        Math.abs(dx) < 0.5 &&
        Math.abs(dy) < 0.5 &&
        Math.abs(sx - 1) < 0.01 &&
        Math.abs(sy - 1) < 0.01
      )
        continue;

      el.animate(
        [
          {
            transformOrigin: "top left",
            transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
          },
          { transformOrigin: "top left", transform: "none" },
        ],
        { duration: 240, easing: "cubic-bezier(0.2, 0.7, 0, 1)", fill: "both" },
      );
    }

    prevRectsRef.current = nextRects;
  }, [cols, rows]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const update = () => {
      const [c, r] = calcGridSize(node);
      setCols(c);
      setRows(r);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [PARTICIPANTS.length]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "grid h-full w-full content-center items-stretch justify-center justify-items-stretch gap-2",
        asideOpen && "hidden md:grid",
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {PARTICIPANTS.map((tile) => (
        <VideoTile
          key={tile.id!}
          name={tile.name}
          audio={tile.audio}
          video={tile.video}
          speaking={tile.speaking}
          ref={(el) => {
            if (el) tileRefs.current.set(tile.id!, el);
            else tileRefs.current.delete(tile.id!);
          }}
        />
      ))}
    </div>
  );
}

function calcGridSize(grid: HTMLDivElement): [number, number] {
  const n = grid.childElementCount;
  if (n === 0) return [0, 0];

  const ar = 16 / 9;
  const cw = grid.clientWidth || window.innerWidth;
  const ch = grid.clientHeight || window.innerHeight;

  let best = [1, 1] as [number, number];
  let bestScore = -Infinity;

  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const cellW = cw / cols;
    const cellH = ch / rows;
    const tileW = Math.min(cellW, cellH * ar);
    const tileH = tileW / ar;
    const score = tileW * tileH * n - (cols * rows - n) * tileW * tileH * 0.02;

    if (
      score - bestScore > 1e-6 ||
      (Math.abs(score - bestScore) < 1e-6 && cols * rows < best[0] * best[1])
    ) {
      best = [cols, rows];
      bestScore = score;
    }
  }

  return best;
}
