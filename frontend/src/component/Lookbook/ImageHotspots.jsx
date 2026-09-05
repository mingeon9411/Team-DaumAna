import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { PRODUCTS } from "../Home/Home";

const SANS = { fontFamily: "'TwayFly', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'TwayFly', 'DM Mono', monospace" };

const byId = (id) => PRODUCTS.find((p) => p.id === id);

// 오늘의집처럼 사진 위에 "+" 핀을 찍어두고, 눌러야 그 상품의 이름·가격이 뜨는
// 위젯 — Lookbook(피드 카드)과 LookbookPost(게시물 상세) 양쪽에서 재사용한다.
// stopPropagation을 준 이유: 피드 카드는 카드 전체가 클릭 시 상세 게시물로
// 이동하는데, 그 위에 얹힌 핀 클릭까지 같이 버블링되면 핀만 누르려 해도
// 게시물이 열려버린다.
function ImageHotspots({ image, alt, tags, className = "" }) {
  const navigate = useNavigate();
  const [openTagId, setOpenTagId] = useState(null);

  return (
    <div className={`relative ${className}`}>
      {/* 팝오버가 열려있을 때 바깥을 클릭하면 닫히도록 — 팝오버 자체보다 z-index를
          낮춰 팝오버 클릭(상세페이지 이동)은 그대로 통과시킨다. */}
      {openTagId != null && (
        <div
          className="fixed inset-0 z-0"
          onClick={(e) => { e.stopPropagation(); setOpenTagId(null); }}
        />
      )}
      <div className="overflow-hidden rounded-2xl bg-muted w-full h-full">
        <img src={image} alt={alt} className="w-full h-full object-cover" />
      </div>
      {tags.map((tag) => {
        const p = byId(tag.id);
        if (!p) return null;
        const isOpen = openTagId === tag.id;
        return (
          <div
            key={tag.id}
            className="absolute z-10"
            style={{ left: `${tag.x}%`, top: `${tag.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpenTagId(isOpen ? null : tag.id); }}
              aria-label={`${p.name} 정보 보기`}
              className="flex items-center justify-center w-7 h-7 rounded-full text-white shadow-lg transition-transform hover:scale-110"
              style={{
                background: "#2f6fed",
                transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                boxShadow: "0 0 0 4px rgba(47,111,237,0.28)",
              }}
            >
              <Plus size={15} strokeWidth={2.5} />
            </button>

            {isOpen && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigate(`/item/${tag.id}`); }}
                className="absolute top-1/2 left-full ml-2 -translate-y-1/2 flex items-center gap-2.5 bg-white text-left rounded-xl shadow-xl p-2 pr-4 hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                <img src={p.image} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                <span className="flex flex-col">
                  <span className="text-xs font-medium text-neutral-900" style={SANS}>{p.name}</span>
                  <span className="text-xs font-semibold text-neutral-900" style={MONO}>₩{p.price}</span>
                </span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ImageHotspots;
