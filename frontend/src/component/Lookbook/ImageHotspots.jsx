import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { resolveProductVariant } from "../Home/Home";

const SANS = { fontFamily: "'GmarketSans', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'GmarketSans', 'DM Mono', monospace" };

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
        const p = resolveProductVariant(tag.id, tag.color);
        if (!p) return null;
        const isOpen = openTagId === tag.id;
        // ProductCard(Home.jsx)와 동일한 할인율 계산 — 카드 스타일을 통일한다.
        const priceNum = Number(p.price.replace(/,/g, ""));
        const originalNum = p.originalPrice ? Number(p.originalPrice.replace(/,/g, "")) : 0;
        const hasDiscount = originalNum > priceNum;
        const discountPct = hasDiscount ? Math.round((1 - priceNum / originalNum) * 100) : 0;
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

            {/* 항상 마운트해두고 opacity/scale만 토글 — {isOpen && ...}로 마운트/언마운트를
                가르면 트랜지션이 붙을 새 없이 순간적으로 나타나 보인다. 닫혀있을 땐
                pointer-events-none·tabIndex=-1로 안 보이는 버튼이 눌리거나 탭으로
                포커스되는 걸 막는다. */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigate(`/item/${tag.id}`); }}
              tabIndex={isOpen ? 0 : -1}
              aria-hidden={!isOpen}
              className={`absolute top-1/2 left-full ml-2 -translate-y-1/2 flex gap-4 bg-card border border-border text-left rounded-2xl shadow-xl p-4 w-72 origin-left transition-all duration-300 ease-out ${
                isOpen
                  ? "opacity-100 scale-100 translate-x-0 pointer-events-auto hover:border-foreground/30"
                  : "opacity-0 scale-95 -translate-x-2 pointer-events-none"
              }`}
            >
              <img src={p.image} alt="" className="w-20 h-20 rounded-xl object-cover shrink-0" />
              <span className="flex flex-col min-w-0">
                {p.label && (
                  <span
                    className="text-[10px] font-semibold text-foreground/70 border border-border rounded px-1.5 py-0.5 w-fit mb-1"
                    style={MONO}
                  >
                    {p.label}
                  </span>
                )}
                <span className="text-sm font-medium text-foreground truncate" style={SANS}>{p.name}</span>
                {hasDiscount && (
                  <span className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] font-bold text-white bg-[#c0392b] rounded px-1 py-0.5" style={MONO}>
                      {discountPct}%
                    </span>
                    <span className="text-xs text-muted-foreground line-through" style={MONO}>
                      ₩{p.originalPrice}
                    </span>
                  </span>
                )}
                <span className="text-base font-bold text-foreground mt-0.5" style={MONO}>₩{p.price}</span>
                <span className="text-xs text-muted-foreground mt-1">무료배송</span>
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ImageHotspots;
