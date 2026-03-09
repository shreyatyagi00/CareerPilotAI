import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EDGE = 40;
const TRIGGER = 100;
const MAX_VERTICAL = 100;

export default function useSwipeBackWithAnimation(to, pageRef) {
  const navigate = useNavigate();

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let swiping = false;

    const getX = (e) =>
      e.touches ? e.touches[0].clientX : e.clientX;

    const getY = (e) =>
      e.touches ? e.touches[0].clientY : e.clientY;

    const onStart = (e) => {
      const page = pageRef.current;
      if (!page) return;

      const x = getX(e);
      const y = getY(e);

      if (x <= EDGE) {
        swiping = true;
        startX = x;
        startY = y;
        page.style.transition = "none";
      }
    };

    const onMove = (e) => {
      if (!swiping) return;

      const page = pageRef.current;
      if (!page) return;

      const x = getX(e);
      const y = getY(e);

      const dx = x - startX;
      const dy = Math.abs(y - startY);

      if (dy > MAX_VERTICAL) {
        swiping = false;
        page.style.transform = "";
        page.style.opacity = "";
        return;
      }

      if (dx > 0) {
        page.style.transform = `translateX(${dx}px)`;
        page.style.opacity = `${1 - dx / 400}`;
      }
    };

    const onEnd = (e) => {
      if (!swiping) return;

      const page = pageRef.current;
      if (!page) return;

      swiping = false;

      const x = getX(e);
      const dx = x - startX;

      page.style.transition =
        "transform 0.3s ease, opacity 0.3s ease";

      if (dx > TRIGGER) {
        page.style.transform = "translateX(100%)";
        page.style.opacity = "0";
        setTimeout(() => navigate(to), 300);
      } else {
        page.style.transform = "translateX(0)";
        page.style.opacity = "1";
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
 
    window.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);

    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);

      window.removeEventListener("mousedown", onStart);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
    };
  }, [navigate, to, pageRef]);
}