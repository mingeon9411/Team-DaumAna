// 거리 기반 자동 스냅(lenis/snap의 기본 onSnap)은 스크롤을 멈춘 뒤 일정 시간이
// 지나야 어느 패널에 붙을지 정해져서, 사용자가 보기엔 "페이지가 나중에 저 혼자
// 움직이는" 것처럼 느껴진다. 그래서 그 자동 경로는 영구히 꺼두고(snap.stop()),
// 휠 입력이 들어오는 즉시 방향만 보고 다음/이전 패널로 완전히 넘어가도록
// 직접 처리한다 — 살짝만 스크롤해도 한 페이지 전체가 넘어가고, 전환 중에는
// 추가 입력을 잠가서 한 번의 스크롤 동작에 여러 페이지가 넘어가지 않게 한다.
export function createPagingController(lenis, snap) {
  snap.stop();

  const state = { locked: false, overPrevent: false };

  // 고정 시간으로 잠갔다가 풀면, 트랙패드/휠의 관성(모멘텀) 스크롤이 얼마나
  // 길게 이어질지 알 수 없어 그 순간까지도 입력이 남아있으면 다음 전환을 또
  // 트리거해서 여러 페이지가 연쇄적으로 넘어가 버린다. 그래서 "마지막 휠
  // 이벤트로부터 일정 시간 조용해야 잠금 해제"하는 디바운스 방식으로, 관성이
  // 얼마나 길게 이어지든 완전히 가라앉을 때까지 새 트리거를 막는다.
  const QUIET_MS = 700;
  let quietTimer = null;

  const holdLock = () => {
    clearTimeout(quietTimer);
    quietTimer = setTimeout(() => { state.locked = false; }, QUIET_MS);
  };

  const onVirtualScroll = (data) => {
    if (state.overPrevent) return;
    if (state.locked) {
      holdLock(); // 같은 제스처의 관성 꼬리 — 트리거 없이 잠금만 연장
      return;
    }
    if (data.deltaY > 0) {
      state.locked = true;
      holdLock();
      snap.next();
    } else if (data.deltaY < 0) {
      state.locked = true;
      holdLock();
      snap.previous();
    }
  };
  lenis.on("virtual-scroll", onVirtualScroll);

  function registerPanels() {
    const panels = document.querySelectorAll("[data-hsnap]");
    const unsubAdd = snap.addElements(Array.from(panels), { align: "center" });
    // 라우트가 바뀌면 ScrollToTop이 스크롤 위치를 0으로 되돌리므로, snap이
    // 기억하는 "현재 패널 인덱스"도 함께 0으로 맞춰줘야 next()/previous()가
    // 이전 라우트의 인덱스를 기준으로 엉뚱하게 움직이지 않는다.
    snap.currentSnapIndex = 0;

    const preventEls = document.querySelectorAll("[data-lenis-prevent]");
    const onEnter = () => { state.overPrevent = true; };
    const onLeave = () => { state.overPrevent = false; };
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

  function destroy() {
    clearTimeout(quietTimer);
    lenis.off("virtual-scroll", onVirtualScroll);
  }

  return { registerPanels, destroy };
}
