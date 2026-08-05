import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./KoreanHall.css";
import products from "../../data/products";
import irworobongdo from "../../assets/decor/irworobongdo.svg";

const FILM_SOURCES = ["/videos/jipdaum-hanok.mp4", "/videos/jipdaum-kor.mp4"];

function KoreanHall() {
  const navigate = useNavigate();
  const filmVideoRef = useRef(null);
  const gridRef = useRef(null);
  const [filmIndex, setFilmIndex] = useState(0);
  const [filmEnded, setFilmEnded] = useState(false);

  useEffect(() => {
    if (filmIndex === 0) return;
    filmVideoRef.current?.play().catch(() => {});
  }, [filmIndex]);

  // 상품 상세페이지의 "목록으로" 버튼으로 돌아온 경우, 대문·필름 인트로를 다시
  // 보여주지 않고 상품 목록으로 바로 스크롤한다 (Home.jsx의 skipHomeDefaultPanel과 동일한 패턴).
  useEffect(() => {
    if (!sessionStorage.getItem("skipKoreanHallIntro")) return;
    sessionStorage.removeItem("skipKoreanHallIntro");
    const timer = setTimeout(() => {
      gridRef.current?.scrollIntoView({ block: "start" });
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleFilmEnded = () => {
    if (filmIndex < FILM_SOURCES.length - 1) {
      setFilmIndex((i) => i + 1);
    } else {
      setFilmEnded(true);
    }
  };

  return (
    <div className="khPage" data-hsnap data-lenis-prevent>
      <img src={irworobongdo} alt="" aria-hidden="true" className="khWatermark" />
      <div className="khIntro">
        <span className="khLabel">KOREAN HALL</span>
        <h2 className="khTitle">한국관</h2>
        <span className="khHairline" />
        <p className="khDesc">
          한국 전통의 결과 멋을 담은 집다움의 큐레이션.
          <br />
          한지, 나전, 도자의 미감을 현대의 공간에 맞게 다시 그렸습니다.
        </p>
      </div>

      <div className={`khFilm${filmEnded ? " khFilmClosed" : ""}`}>
        <video
          ref={filmVideoRef}
          className="khFilmVideo"
          src={FILM_SOURCES[filmIndex]}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={handleFilmEnded}
        />
        <div className="khFilmOverlay" />
        <div className="khFilmCaption">
          <span className="khLabel">A MOMENT IN HANOK</span>
          <p className="khFilmText">
            처마 끝에 머무는 볕과 결,
            <br />
            한국관이 담은 공간의 온도.
          </p>
          <span className="khHairline" />
        </div>
      </div>

      <ul className="khGrid" ref={gridRef}>
        {products.map((product) => (
          <li key={product.id} className="khCard">
            <button
              type="button"
              className="khCardLink"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="khImgWrap">
                <img src={product.image} alt={product.name} className="khImg" />
              </div>
              <div className="khInfo">
                <p className="khName">{product.name}</p>
                <p className="khProductDesc">{product.desc}</p>
                <p className="khPrice">{product.price.toLocaleString()}원</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default KoreanHall;
