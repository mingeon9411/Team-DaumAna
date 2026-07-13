import { useState } from "react";
import "./RoomFlow.css";

import a     from "../../assets/scenes/a.png";
import hero1 from "../../assets/scenes/hero1.png";
import hero2 from "../../assets/scenes/hero2.png";
import hero3 from "../../assets/scenes/hero3.png";

const ROOM_LIST = [
  { img: a,     label: "Korean Traditional", sub: "Maru"      },
  { img: hero1, label: "Nordic Room",         sub: "Bedroom"   },
  { img: hero2, label: "Modern Style",        sub: "Living Room" },
  { img: hero3, label: "Natural Space",       sub: "Dining Room" },
];

const rooms = [...ROOM_LIST, ...ROOM_LIST]; // 무한 스크롤용 복제

function RoomFlow() {
  const [selected, setSelected] = useState(null);

  return (
    <section className="roomFlow">
      <div className="roomTitle">
        <p>ROOM TOUR</p>
        <h2>취향이 머무는 공간</h2>
      </div>

      <div className="roomTrack">
        {rooms.map((room, index) => (
          <button
            key={index}
            className="roomCard"
            onClick={() => setSelected(room)}
            style={{ backgroundImage: `url(${room.img})` }}
          >
            <div className="roomCardOverlay" />
            <div className="roomCardLabel">
              <p className="roomCardSub">{room.sub}</p>
              <p className="roomCardName">{room.label}</p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="roomModal" onClick={() => setSelected(null)}>
          <div
            className="roomModalInner"
            style={{ backgroundImage: `url(${selected.img})` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="roomModalLabel">
              <p className="roomModalSub">{selected.sub}</p>
              <p className="roomModalName">{selected.label}</p>
            </div>
            <button className="roomModalClose" onClick={() => setSelected(null)}>✕</button>
          </div>
        </div>
      )}
    </section>
  );
}

export default RoomFlow;
