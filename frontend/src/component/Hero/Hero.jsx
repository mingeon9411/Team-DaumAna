import "./Hero.css";
import { useEffect, useState } from "react";
import sunset from "../../assets/decor/sunset.png";
import mount from "../../assets/decor/mount.png";

function Hero() {
  const [offsetY, setOffsetY] = useState(0);
  const [current, setCurrent] = useState(0);
  const [transitionOn, setTransitionOn] = useState(true);

  const realSlides = [
    { type: "video", src: "/videos/uhdfps.mp4" },
    { type: "image", src: sunset },
    { type: "image", src: mount },
  ];

  const slides = [...realSlides, realSlides[0]];

  const nextSlide = () => {
    setCurrent((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (current === 0) {
      setCurrent(realSlides.length - 1);
    } else {
      setCurrent((prev) => prev - 1);
    }
  };

  const handleTransitionEnd = () => {
    if (current === slides.length - 1) {
      setTransitionOn(false);
      setCurrent(0);

      setTimeout(() => {
      setTransitionOn(true);
      }, 50);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

   useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
   }, [current]);

  return (
    <section className="hero">
      <div
        className="heroSlider"
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `translateX(-${current * 100}%)`,
          transition: transitionOn ? "transform 0.7s ease" : "none",
        }}
      >
        {slides.map((slide, index) => (
          <div className="heroSlide" key={index}>
            {slide.type === "video" ? (
              <video
                className="heroMedia"
                autoPlay
                muted
                loop
                playsInline
                style={{
                  transform: `
                    scale(${1 + offsetY * 0.0003})
                    translateY(${offsetY * 0.15}px)
                  `,
                }}
              >
                <source src={slide.src} type="video/mp4" />
              </video>
            ) : (
              <img
                className="heroMedia"
                src={slide.src}
                alt=""
                style={{
                  transform: `
                    scale(${1 + offsetY * 0.0003})
                    translateY(${offsetY * 0.15}px)
                  `,
                }}
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
          여름 공간을 완성해보세요.
        </h1>

        <button>둘러보기</button>
      </div>

      <button className="heroPrev" onClick={prevSlide} aria-label="이전 슬라이드">
        <span />
      </button>
      <button className="heroNext" onClick={nextSlide} aria-label="다음 슬라이드">
        <span />
      </button>

      <div className="heroIndicator">
        <span>{String((current % realSlides.length) + 1).padStart(2, "0")}</span>
        <span className="divider"> / </span>
        <span>{String(realSlides.length).padStart(2, "0")}</span>
      </div>


    </section>
  );
}

export default Hero;