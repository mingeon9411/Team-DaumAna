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
export function useNestedLenis(ref, { enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const lenis = new Lenis({ wrapper: el, content: el });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [ref, enabled]);
}
