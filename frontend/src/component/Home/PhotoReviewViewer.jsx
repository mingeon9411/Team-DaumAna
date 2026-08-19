import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, X, ChevronLeft, ChevronRight } from "lucide-react";

const SERIF = { fontFamily: "'TwayFly', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'TwayFly', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'TwayFly', 'DM Mono', monospace" };

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
};

/**
 * 실제 구매자가 올린 포토리뷰를 보여주는 라이트박스. LookbookViewer.jsx(관리자 큐레이션
 * 사진용, 가짜 좋아요/댓글로 꾸며진 인스타 스타일 목업)와 달리 여기 나오는 닉네임·평점·
 * 코멘트는 전부 실제 데이터라, 꾸며낸 콘텐츠를 섞지 않는다.
 *
 * @param {{ reviews: Array<object>, index: number, onClose: () => void, onNavigate: (i:number) => void }} props
 */
function PhotoReviewViewer({ reviews, index, onClose, onNavigate }) {
  const navigate = useNavigate();
  const review = reviews[index];

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
      if (e.key === "ArrowRight" && index < reviews.length - 1) onNavigate(index + 1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [index, reviews.length, onClose, onNavigate]);

  if (!review) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4" onClick={onClose}>
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-5 right-5 text-white/80 hover:text-white transition-colors"
      >
        <X size={24} />
      </button>
      <span className="absolute top-6 left-6 text-xs text-white/70" style={MONO}>
        {index + 1} / {reviews.length}
      </span>

      {index > 0 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNavigate(index - 1); }}
          aria-label="이전 사진"
          className="absolute left-3 md:left-6 text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
      )}
      {index < reviews.length - 1 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNavigate(index + 1); }}
          aria-label="다음 사진"
          className="absolute right-3 md:right-6 text-white/70 hover:text-white transition-colors"
        >
          <ChevronRight size={28} />
        </button>
      )}

      <div
        className="grid md:grid-cols-2 w-full max-w-3xl max-h-[85vh] bg-card rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-muted">
          <img
            src={review.review_image_url}
            alt={`${review.user_nickname}님이 올린 사진`}
            className="w-full h-full object-cover max-h-[45vh] md:max-h-[85vh]"
          />
        </div>

        <div className="p-6 flex flex-col">
          <p className="text-base font-medium text-foreground mb-2" style={SERIF}>{review.user_nickname}</p>

          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={14} className={n <= review.rating ? "fill-foreground text-foreground" : "text-border"} />
            ))}
          </div>

          {review.comment && (
            <p className="text-sm text-foreground/80 leading-relaxed mb-4 whitespace-pre-wrap" style={SANS}>
              {review.comment}
            </p>
          )}

          <p className="text-xs text-muted-foreground mb-6" style={MONO}>{formatDate(review.created_at)}</p>

          <button
            type="button"
            onClick={() => navigate(`/item/${review.product}`)}
            className="mt-auto w-full rounded-lg border border-foreground text-foreground text-xs tracking-widest py-3 hover:bg-foreground hover:text-background transition-colors"
            style={SANS}
          >
            이 상품 보러가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default PhotoReviewViewer;
