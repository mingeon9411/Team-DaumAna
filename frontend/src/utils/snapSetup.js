// 휠 입력마다 패널 전체를 강제로 전환하던 기존 방식 대신, Snap이 기본 제공하는
// 거리 기반 스냅(proximity)을 그대로 쓴다 — 스크롤은 자유롭게 흘러가고, 입력이
// 멈췄을 때만 가장 가까운 패널로 부드럽게 달라붙는다.
export function createPagingController(lenis, snap) {
  function registerPanels() {
    const panels = document.querySelectorAll("[data-hsnap]");
    const unsubAdd = snap.addElements(Array.from(panels), { align: "center" });
    // 라우트가 바뀌면 ScrollToTop이 스크롤 위치를 0으로 되돌리므로, snap이
    // 기억하는 "현재 패널 인덱스"도 함께 0으로 맞춰줘야 다음 스냅이 이전
    // 라우트의 인덱스를 기준으로 엉뚱하게 움직이지 않는다.
    snap.currentSnapIndex = 0;

    // Cart/Checkout/ProductDetail/MyPage처럼 내부 콘텐츠를 자체 스크롤해야 하는
    // 페이지는 data-lenis-prevent로 표시돼 있다. virtual-scroll 이벤트는 lenis의
    // prevent 판정보다 먼저 발생해 Snap의 onSnap도 함께 반응해버리므로, 그 위에
    // 있는 동안은 snap을 아예 멈춰 자동 스냅이 페이지 위치를 되돌리지 않게 한다.
    const preventEls = document.querySelectorAll("[data-lenis-prevent]");
    const onEnter = () => snap.stop();
    const onLeave = () => snap.start();
    preventEls.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      unsubAdd();
      preventEls.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }

  function destroy() {}

  return { registerPanels, destroy };
}
