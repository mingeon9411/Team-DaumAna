import { useEffect, useRef, useState } from "react";
import "./KoreanHall.css";
import products from "../../data/products";
import { useProductModal } from "../../context/ProductModalContext";
import irworobongdo from "../../assets/decor/irworobongdo.svg";

function KoreanHall() {
  const { openProduct } = useProductModal();
  const filmVideoRef = useRef(null);
  const filmStarted = useRef(false);
  const [filmEnded, setFilmEnded] = useState(false);

  useEffect(() => {
    const el = filmVideoRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || filmStarted.current) return;
        filmStarted.current = true;
        el.play().catch(() => {});
        io.disconnect();
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
          src="/videos/jipdaum-kor.mp4"
          muted
          playsInline
          preload="auto"
          onEnded={() => setFilmEnded(true)}
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

      <ul className="khGrid">
        {products.map((product) => (
          <li key={product.id} className="khCard">
            <button
              type="button"
              className="khCardLink"
              onClick={() => openProduct(product.id)}
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
