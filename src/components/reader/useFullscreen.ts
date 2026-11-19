import { useEffect, useRef, useState } from "react";

export function useFullscreen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canFullscreen = typeof document !== "undefined" && document.fullscreenEnabled;

  useEffect(() => {
    function handleChange() {
      setIsFullscreen(document.fullscreenElement === ref.current);
    }

    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void ref.current?.requestFullscreen();
    }
  }

  return { ref, isFullscreen, canFullscreen, toggleFullscreen };
}