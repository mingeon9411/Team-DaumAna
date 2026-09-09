import "./HomeHeroBanner.css";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pause, Play, ArrowRight } from "lucide-react";
import rugBInterior from "../../assets/interior/(소품) 북유럽풍 러그 B형 -인테리어.jpg";
import nordicSofaInterior from "../../assets/interior/(소파) 북유럽 소파 - 인테리어.jpg";

const SERIF = { fontFamily: "'GmarketSans', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'GmarketSans', 'Noto Sans KR', sans-serif" };

// 오른쪽 두 카드는 실제 판매 중인 상품(PRODUCTS의 id)과 연결해, 인테리어 컷을
// 누르면 바로 그 상품 상세페이지로 이동한다 — 이케아류 배너의 "예쁜 사진 +
// 구매 유도" 패턴을 그대로 살리되 광고가 아니라 실제 상품으로 이어지게 한다.
const PROMO_CARDS = [
  { id: 1, image: rugBInterior, caption: "이번 가을, 러그 15% 할인" },
  { id: 5, image: nordicSofaInterior, caption: "새로 온 북유럽 소파" },
];

// 카테고리 탭 맨 위 웰컴 배너 — 왼쪽은 브랜드 영상, 오른쪽은 구매 유도 카드 2장.
function HomeHeroBanner({
  videoSrc = "/videos/jipdaum-video-1-compressed.mp4",
  videoCaption = "집다움에 오신 걸 환영합니다",
  promoCards = PROMO_CARDS,
}) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
    setPlaying((v) => !v);
  };

  return (
    <div className="heroBannerGrid">
      <div className="heroBannerVideo">
        <video
          ref={videoRef}
          className="heroBannerVideoEl"
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
        />
        <button
          type="button"
          className="heroBannerPauseBtn"
          onClick={toggleVideo}
          aria-label={playing ? "영상 일시정지" : "영상 재생"}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <p className="heroBannerCaption" style={SERIF}>{videoCaption}</p>
      </div>

      <div className="heroBannerCards">
        {promoCards.map((c) => (
          <button
            type="button"
            key={c.id}
            className="heroBannerCard"
            onClick={() => navigate(`/item/${c.id}`)}
            // 원본 파일명에 공백·괄호가 들어있어(예: "(소품) ... -인테리어.jpg"),
            // 인용부호 없는 url(...)에 그대로 넣으면 CSS가 이를 잘못된 값으로 보고
            // 통째로 무시해버린다(카드에 이미지가 하나도 안 뜨던 원인) — 큰따옴표로 감싼다.
            style={{ backgroundImage: `url("${c.image}")` }}
          >
            <span className="heroBannerCardCaption" style={SANS}>
              {c.caption}
              <ArrowRight size={14} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default HomeHeroBanner;
