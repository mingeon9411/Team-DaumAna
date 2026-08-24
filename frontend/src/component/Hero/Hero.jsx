import "./Hero.css";
import {
  useReducer,
  useEffect,
  useRef,
  useCallback,
  useState,
  useId,
} from "react";
import sunset from "../../assets/decor/sunset.png";
import mount from "../../assets/decor/mount.png";

// 실제 슬라이드 목록
const REAL_SLIDES = [
  { id: "s1", type: "video", src: "/videos/uhdfps.mp4" },
  { id: "s2", type: "image", src: sunset, alt: "노을 풍경" },
  { id: "s3", type: "image", src: mount, alt: "산 풍경" },
];

// 무한 루프용 clone 슬라이드 [마지막, ...원본, 첫번째]
// id가 서로 겹치지 않으므로 index를 굳이 key에 덧붙이지 않아도 된다.
const SLIDES = [
  { ...REAL_SLIDES[REAL_SLIDES.length - 1], id: "clone-last" },
  ...REAL_SLIDES,
  { ...REAL_SLIDES[0], id: "clone-first" },
];

const FIRST_REAL_INDEX = 1;
const LAST_REAL_INDEX = REAL_SLIDES.length; // SLIDES 기준 마지막 진짜 슬라이드 위치
const IMAGE_SLIDE_DURATION = 5000;
const VIDEO_FALLBACK_DURATION = 15000; // ended 이벤트가 안 올 때 대비한 안전장치

function sliderReducer(state, action) {
  switch (action.type) {
    case "NEXT": {
      if (state.isTransitioning) return state;
      return { currentIndex: state.currentIndex + 1, isTransitioning: true };
    }
    case "PREV": {
      if (state.isTransitioning) return state;
      return { currentIndex: state.currentIndex - 1, isTransitioning: true };
    }
    case "GOTO": {
      if (state.isTransitioning) return state;
      if (action.targetIndex === state.currentIndex) return state;
      return { currentIndex: action.targetIndex, isTransitioning: true };
    }
    case "TRANSITION_END": {
      if (state.currentIndex === SLIDES.length - 1) {
        return { currentIndex: FIRST_REAL_INDEX, isTransitioning: false };
      }
      if (state.currentIndex === 0) {
        return { currentIndex: LAST_REAL_INDEX, isTransitioning: false };
      }
      return { ...state, isTransitioning: false };
    }
    default:
      return state;
  }
}

function Hero() {
  const [state, dispatch] = useReducer(sliderReducer, {
    currentIndex: FIRST_REAL_INDEX,
    isTransitioning: false,
  });

  const [isHovering, setIsHovering] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const isAutoplayPaused =
    isHovering || isTouching || isTabHidden || prefersReducedMotion;

  const touchStartRef = useRef(null);
  const videoRefs = useRef([]);
  const trackRef = useRef(null);
  const headingId = useId();

  const handleNext = useCallback(() => dispatch({ type: "NEXT" }), []);
  const handlePrev = useCallback(() => dispatch({ type: "PREV" }), []);
  const handleGoto = useCallback(
    (realIndex) =>
      dispatch({ type: "GOTO", targetIndex: realIndex + FIRST_REAL_INDEX }),
    []
  );

  const handleTransitionEnd = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== "transform") return;
    dispatch({ type: "TRANSITION_END" });
  };

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);
    const onChange = (e) => setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => setIsTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  // [버그 수정] reduced-motion이면 transition:none이라 transitionend가 절대 안 온다.
  // 그러면 isTransitioning이 true로 영구 고정되어 버튼/키보드/스와이프/dot이 전부 막힌다.
  // 트랜지션 대기 상태로 들어가면 다음 프레임에 바로 TRANSITION_END를 dispatch해 우회한다.
  useEffect(() => {
    if (!prefersReducedMotion || !state.isTransitioning) return;
    const raf = requestAnimationFrame(() => {
      dispatch({ type: "TRANSITION_END" });
    });
    return () => cancelAnimationFrame(raf);
  }, [prefersReducedMotion, state.isTransitioning]);

  // 슬라이드 자동 전환 — 비디오는 고정 시간이 아니라 재생이 끝나는 시점(ended)에 넘어간다.
  // (기존 코드는 모든 슬라이드를 5초마다 강제로 넘겨서 영상이 끝까지 재생될 일이 없었다.)
  useEffect(() => {
    if (isAutoplayPaused) return;

    const activeSlide = SLIDES[state.currentIndex];
    if (!activeSlide) return;

    if (activeSlide.type === "video") {
      const videoEl = videoRefs.current[state.currentIndex];
      if (!videoEl) return;

      const onEnded = () => handleNext();
      videoEl.addEventListener("ended", onEnded);
      const fallbackTimer = setTimeout(handleNext, VIDEO_FALLBACK_DURATION);

      return () => {
        videoEl.removeEventListener("ended", onEnded);
        clearTimeout(fallbackTimer);
      };
    }

    const timer = setTimeout(handleNext, IMAGE_SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [state.currentIndex, isAutoplayPaused, handleNext]);

  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === state.currentIndex && !isAutoplayPaused) {
        video.play().catch(() => {});
      } else {
        video.pause();
        if (idx !== state.currentIndex) {
          video.currentTime = 0;
        }
      }
    });
  }, [state.currentIndex, isAutoplayPaused]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setIsTouching(true);
  };

  const handleTouchEnd = (e) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    setIsTouching(false);
    if (!start) return;

    const touch = e.changedTouches[0];
    const diffX = start.x - touch.clientX;
    const diffY = start.y - touch.clientY;

    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) handleNext();
      else handlePrev();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    }
  };

  const activeRealIndex = state.currentIndex - FIRST_REAL_INDEX;

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="메인 하이라이트 배너"
      aria-labelledby={headingId}
      tabIndex={0}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
    >
      <h2 id={headingId} className="sr-only">
        추천 콘텐츠 슬라이드
      </h2>
      <p className="sr-only" aria-live="polite">
        {`${REAL_SLIDES.length}개 중 ${activeRealIndex + 1}번째 슬라이드`}
      </p>

      <div
        ref={trackRef}
        className="heroSlider"
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `translate3d(-${state.currentIndex * 100}%, 0, 0)`,
          transition:
            state.isTransitioning && !prefersReducedMotion
              ? "transform 500ms cubic-bezier(0.25, 1, 0.5, 1)"
              : "none",
          willChange: state.isTransitioning ? "transform" : "auto",
        }}
      >
        {SLIDES.map((slide, index) => (
          <div className="heroSlide" key={slide.id} aria-hidden={index !== state.currentIndex}>
            {slide.type === "video" ? (
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                className="heroMedia"
                src={slide.src}
                muted
                playsInline
                preload={index === FIRST_REAL_INDEX ? "auto" : "metadata"}
              />
            ) : (
              <img
                className="heroMedia"
                src={slide.src}
                alt={slide.alt || "배너 이미지"}
                loading={index === FIRST_REAL_INDEX ? "eager" : "lazy"}
              />
            )}
          </div>
        ))}
      </div>

      <div className="overlay"></div>

      <div className="heroContent">
        <p className="subText">KOREAN LIVING CURATION</p>
        <h1>
          '집다움' 에서<br />
          나만의 여름 공간을 완성해보세요.
        </h1>
        <button type="button">둘러보기</button>
      </div>

      <button type="button" className="heroPrev" onClick={handlePrev} aria-label="이전 슬라이드">
        <span />
      </button>
      <button type="button" className="heroNext" onClick={handleNext} aria-label="다음 슬라이드">
        <span />
      </button>

      <div role="tablist" aria-label="슬라이드 선택" className="heroDots">
        {REAL_SLIDES.map((slide, realIndex) => {
          const isActive = realIndex === activeRealIndex;
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`${realIndex + 1}번째 슬라이드로 이동`}
              onClick={() => handleGoto(realIndex)}
              className={"heroDot" + (isActive ? " active" : "")}
            />
          );
        })}
      </div>
    </section>
  );
}

export default Hero;
