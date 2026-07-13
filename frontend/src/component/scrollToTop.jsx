import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop({ lenis }) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (lenis?.current) {
      lenis.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, lenis]);

  return null;
}

export default ScrollToTop;