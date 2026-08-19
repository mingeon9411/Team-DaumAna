import { useState } from "react";
import { Star, ImagePlus, X } from "lucide-react";
import { createReview, uploadReviewImage } from "../../api";
import { useAuthModal } from "../../context/AuthModalContext";

const SERIF = { fontFamily: "'TwayFly', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'TwayFly', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'TwayFly', 'DM Mono', monospace" };

/**
 * 룩북 갤러리에 내 공간 사진을 올리는 모달. 실제로는 새 엔티티를 만드는 게 아니라
 * "사진 첨부된 상품 리뷰"를 하나 생성하는 것 — HomeProductDetail.jsx의 리뷰 작성 폼과
 * 같은 API(createReview + uploadReviewImage)를 쓴다. product는 Home.PRODUCTS를
 * 그대로 상위에서 내려받는다(순환 import 방지 + HomeProductDetail.jsx와 동일하게
 * 이 로컬 목록의 id가 실제 DB Product와 1:1로 시딩되어 있는 걸 그대로 활용).
 *
 * @param {{ products: Array<{id:number,name:string}>, onClose: () => void, onUploaded?: (review: object) => void }} props
 */
function PhotoReviewUploadModal({ products, onClose, onUploaded }) {
  const { openLogin } = useAuthModal();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 첨부할 수 있습니다.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const submit = async () => {
    if (!localStorage.getItem("access_token")) {
      alert("로그인이 필요합니다.");
      onClose();
      openLogin();
      return;
    }
    if (!productId) {
      alert("상품을 선택해주세요.");
      return;
    }
    if (!imageFile) {
      alert("사진을 첨부해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const uploadRes = await uploadReviewImage(imageFile);
      const res = await createReview(productId, {
        rating,
        title: "",
        comment: comment.trim(),
        review_image_url: uploadRes.data.url,
      });
      onUploaded?.(res.data);
      onClose();
    } catch {
      alert("사진 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-medium text-foreground" style={SERIF}>내 공간 사진 올리기</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-muted-foreground tracking-widest mb-1.5" style={MONO}>어떤 상품인가요?</p>
        <select
          value={productId}
          onChange={(e) => setProductId(Number(e.target.value))}
          className="w-full rounded-lg border border-border bg-background text-sm text-foreground p-3 mb-4 outline-none focus:border-foreground transition-colors"
          style={SANS}
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <p className="text-xs text-muted-foreground tracking-widest mb-2" style={MONO}>평점</p>
        <div className="flex gap-1.5 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n}점`}
              className="hover:scale-110 transition-transform"
            >
              <Star size={22} className={n <= rating ? "fill-foreground text-foreground" : "text-border"} />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="어떤 공간인지 살짝 설명해주세요 (선택)"
          rows={3}
          className="w-full rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground p-3.5 mb-4 resize-none outline-none focus:border-foreground transition-colors"
          style={SANS}
        />

        <div className="flex items-center gap-3 mb-6">
          {imagePreview ? (
            <div className="relative w-20 h-20 shrink-0">
              <img
                src={imagePreview}
                alt="첨부한 사진 미리보기"
                className="w-20 h-20 rounded-lg object-cover border border-border"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                aria-label="사진 제거"
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center"
              >
                <X size={11} />
              </button>
            </div>
          ) : (
            <label
              htmlFor="galleryUploadImageInput"
              className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-lg px-3 py-2 cursor-pointer hover:text-foreground hover:border-foreground transition-colors"
              style={SANS}
            >
              <ImagePlus size={14} />
              사진 선택 (필수)
            </label>
          )}
          <input
            id="galleryUploadImageInput"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="w-full rounded-lg bg-foreground text-background text-xs tracking-widest py-3 hover:opacity-85 transition-opacity disabled:opacity-50"
          style={SANS}
        >
          {submitting ? "올리는 중..." : "사진 올리기"}
        </button>
      </div>
    </div>
  );
}

export default PhotoReviewUploadModal;
