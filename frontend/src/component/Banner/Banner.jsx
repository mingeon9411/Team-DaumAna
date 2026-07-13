import { useState } from "react";
import "./Banner.css";

function Banner() {
  const slides = [
    {
      image: "/banner1.jpg",
      title: "ZIPDAUM",
      text: "취향이 머무는 집",
    },
    {
      image: "/banner2.jpg",
      title: "KOREAN MOOD",
      text: "한국적인 라이프스타일",
    },
  ];

  const [current, setCurrent] = useState(0);

  return (
    <section
      className="banner"
      style={{
        backgroundImage: `url(${slides[current].image})`,
      }}
    >
      <div className="bannerText">
        <h1>{slides[current].title}</h1>
        <p>{slides[current].text}</p>
      </div>

      <button
        className="prevBtn"
        onClick={() => setCurrent(current === 0 ? slides.length - 1 : current - 1)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <button
        className="nextBtn"
        onClick={() => setCurrent(current === slides.length - 1 ? 0 : current + 1)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </section>
  );
}

export default Banner;