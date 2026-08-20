import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop({ lenis, controller, panelsUnsub }) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (lenis?.current) {
      lenis.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    // 최초 마운트 시점 등록은 App.jsx에서 직접 처리한다 (이 이펙트가 그보다 먼저
    // 커밋되어 controller.current가 아직 비어있을 수 있기 때문). 여기서는 라우트가
    // 실제로 바뀐 이후(= controller가 이미 준비된 이후)의 재등록만 담당한다.
    if (controller?.current) {
      panelsUnsub?.current?.();
      if (panelsUnsub) panelsUnsub.current = controller.current.registerPanels();
    }
  }, [pathname, lenis, controller, panelsUnsub]);

  return null;
}

export default ScrollToTop;