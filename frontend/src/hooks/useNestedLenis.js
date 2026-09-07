import { useEffect } from "react";
import Lenis from "lenis";

// App.jsx가 띄우는 Lenis는 홈 전체를 가로로 스냅시키는 용도(orientation:
// "horizontal")라, #home-products처럼 자기 안에서 세로로 길게 스크롤되는
// hsnap 패널은 아예 그 인스턴스를 안 타게 막아뒀다(section의 data-lenis-prevent +
// onWheel stopPropagation — 안 막으면 휠을 돌릴 때마다 옆 패널로 스냅해버린다).
// 그 결과 이 패널만 네이티브 스크롤이라 나머지 사이트의 관성 스크롤과 느낌이
// 달랐다 — 이 훅은 그 패널 하나에만 스코프된 두 번째 Lenis 인스턴스를 붙여
// 같은 부드러운 관성을 준다. wrapper=content=같은 엘리먼트로 두면 Lenis가
// DOM을 새로 감싸지 않고 그 엘리먼트의 실제 scrollTop을 그대로 부드럽게
// 몰아준다(가상 스크롤/transform 방식이 아니라 네이티브 스크롤을 보간).
// duration/smoothWheel 값은 사이트의 다른 페이지 전용 Lenis 인스턴스와 맞춘 것 —
// 같은 사이트 안에서 패널마다 관성 느낌이 다르면 어색하다.
export function useNestedLenis(ref, { enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const lenis = new Lenis({ wrapper: el, content: el, duration: 1.8, smoothWheel: true, autoRaf: true });

    // wrapper와 content가 같은 고정 높이 패널이라 콘텐츠만 늘어나면 ResizeObserver가
    // 감지하지 못한다. 상품·리뷰 렌더링 뒤에도 Lenis의 최대 스크롤 범위를 갱신한다.
    let resizeFrame = null;
    const refreshLimit = () => {
      if (resizeFrame !== null) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = null;
        lenis.resize();
      });
    };
    const contentObserver = new MutationObserver(refreshLimit);
    contentObserver.observe(el, { childList: true, subtree: true });

    // 휠 관성이 아직 진행 중일 때(최대 duration=1.8초) 네이티브 스크롤바를 잡아
    // 끌면 버벅였다 — Lenis는 자기가 만든 보간 애니메이션이 도는 동안
    // (isScrolling === "smooth") 네이티브 scroll 이벤트를 무시하고 매 프레임
    // scrollTop을 자기 목표값으로 계속 되돌려 써서, 드래그로 옮긴 위치가
    // 스냅되듯 튕겨 돌아왔다. 스크롤바 여백(el.clientWidth 바깥) 클릭을 감지해
    // 그 즉시 진행 중이던 보간을 취소하면, 이후 드래그는 순수 네이티브
    // 스크롤이라 부드럽게 먹는다.
    const onPointerDown = (e) => {
      if (e.target === el && e.offsetX >= el.clientWidth) {
        lenis.scrollTo(lenis.actualScroll, { immediate: true });
      }
    };
    el.addEventListener("pointerdown", onPointerDown);

    return () => {
      contentObserver.disconnect();
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
      el.removeEventListener("pointerdown", onPointerDown);
      lenis.destroy();
    };
  }, [ref, enabled]);
}
