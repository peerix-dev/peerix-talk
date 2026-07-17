import { useLayoutEffect, useEffect, useRef, useState } from "react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useRoom } from "@/hooks/use-room";
import { VideoTile } from "@/views/room/video-tile";
import { Spinner } from "@/components/ui/spinner";

export function VideoGrid({
  asideOpen = false,
  className = "",
}: {
  asideOpen?: boolean;
  className?: string;
}) {
  const { participants } = useRoom();
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef(new Map<string, HTMLDivElement>());
  const prevRectsRef = useRef(new Map<string, DOMRect>());
  const [layout, setLayout] = useState({
    cols: 1,
    rows: 1,
    tileW: 0,
    tileH: 0,
  });

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
  }, [layout.cols, layout.rows]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const update = () => {
      setLayout(calcGridSize(node));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [participants.length]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "grid h-full w-full overflow-hidden content-center items-center justify-center justify-items-center gap-2",
        asideOpen && "hidden md:grid",
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(${layout.cols}, ${layout.tileW}px)`,
        gridTemplateRows: `repeat(${layout.rows}, ${layout.tileH}px)`,
      }}
    >
      {participants.length === 0 ? (
        <Empty className="col-span-full flex h-full items-center justify-center">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Spinner data-icon="inline-start" />
            </EmptyMedia>
            <EmptyTitle>{t("room.empty")}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        participants.map((tile) => {
          const id = `${tile.peer}-${tile.label}`;
          return (
            <VideoTile
              key={id}
              peer={tile.peer}
              label={tile.label}
              name={tile.name}
              audio={tile.audio}
              video={tile.video}
              mirror={tile.mirror}
              muted={tile.muted}
              speaking={tile.speaking}
              stream={tile.stream}
              ref={(el) => {
                if (el) tileRefs.current.set(id, el);
                else tileRefs.current.delete(id);
              }}
            />
          );
        })
      )}
    </div>
  );
}

function calcGridSize(grid: HTMLDivElement) {
  const n = grid.childElementCount;
  if (n === 0) return { cols: 0, rows: 0, tileW: 0, tileH: 0 };

  const ar = 16 / 9;
  const gap = 8; // gap-2
  const cw = grid.clientWidth || window.innerWidth;
  const ch = grid.clientHeight || window.innerHeight;

  let bestCols = 1;
  let bestRows = 1;
  let bestTileW = 0;
  let bestTileH = 0;
  let bestScore = -Infinity;

  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const cellW = (cw - (cols - 1) * gap) / cols;
    const cellH = (ch - (rows - 1) * gap) / rows;
    const tileW = Math.min(cellW, cellH * ar);
    const tileH = tileW / ar;
    const score = tileW * tileH * n - (cols * rows - n) * tileW * tileH * 0.02;

    if (
      score - bestScore > 1e-6 ||
      (Math.abs(score - bestScore) < 1e-6 && cols * rows < bestCols * bestRows)
    ) {
      bestCols = cols;
      bestRows = rows;
      bestTileW = tileW;
      bestTileH = tileH;
      bestScore = score;
    }
  }

  return { cols: bestCols, rows: bestRows, tileW: bestTileW, tileH: bestTileH };
}
