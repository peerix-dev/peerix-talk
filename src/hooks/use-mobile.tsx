import { useState, useEffect } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    /Android|iPhone|iPad/i.test(navigator.userAgent),
  );

  useEffect(() => {
    const mq = window.matchMedia(
      "only screen and (max-width: 768px) and (max-height: 768px)",
    );

    const update = () => setIsMobile(mq.matches);
    update();

    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}
