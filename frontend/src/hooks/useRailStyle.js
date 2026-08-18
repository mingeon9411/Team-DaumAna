import { useEffect, useRef, useState } from "react";

// 하단 독바(Sidebar)에서 고르는 레인보우(글래스)/메탈릭/파스텔 스타일을 다른 컴포넌트에서도
// 그대로 따라가고 싶을 때 쓰는 훅. Sidebar가 localStorage에 쓰고 "railstylechange"
// 이벤트를 쏘면(다크모드와 같은 패턴) 여기서 받아서 값을 갱신한다.
export function useRailStyle() {
  const [railStyle, setRailStyle] = useState(
    () => localStorage.getItem("railStyle") || "glass"
  );
  const [styleSwitching, setStyleSwitching] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    const sync = () => setRailStyle(localStorage.getItem("railStyle") || "glass");
    window.addEventListener("railstylechange", sync);
    return () => window.removeEventListener("railstylechange", sync);
  }, []);

  useEffect(() => {
    // 첫 마운트 시엔 전환 애니메이션 재생 안 함 (Sidebar와 동일한 처리)
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setStyleSwitching(true);
    const timer = setTimeout(() => setStyleSwitching(false), 2000);
    return () => clearTimeout(timer);
  }, [railStyle]);

  return { railStyle, styleSwitching };
}
