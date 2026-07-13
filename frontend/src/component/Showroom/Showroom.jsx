import "./Showroom.css";
import { useState } from "react";

import showroom1 from "../../assets/scenes/showroom1.jpg";
import table from "../../assets/products/table.jpg";
import table2 from "../../assets/products/table2.jpg";

function Showroom() {
  const [activeIndex, setActiveIndex] = useState(0);

  const spaces = [
    {
      title: "한옥 프라이빗 갤러리",
      location: "이음더플레이스",
      desc: "전통의 구조와 현대적 감각이 공존하는 공간",
      image: showroom1,
    },
    {
      title: "우드 라이프 룸",
      location: "성수 쇼룸",
      desc: "따뜻한 목재와 미니멀한 가구가 어우러진 공간",
      image: table,
    },
    {
      title: "오브제 스튜디오",
      location: "북촌",
      desc: "공예와 라이프스타일 오브제를 큐레이션한 공간",
      image: table2,
    },
  ];

  return (
    <section className="ShowroomAccordion">
      {spaces.map((space, index) => (
        <button
          type="button"
          key={index}
          className={`spacePanel ${activeIndex === index ? "active" : ""}`}
          onClick={() => setActiveIndex(index)}
        >
          <img src={space.image} alt={space.title} />

          <div className="spaceInfo">
            <p>{space.location}</p>
            <h2>{space.title}</h2>
            <span>{space.desc}</span>
          </div>
        </button>
      ))}
    </section>
  );
}

export default Showroom;