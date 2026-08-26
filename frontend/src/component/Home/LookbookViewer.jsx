import { useState, useEffect } from "react";
import { X, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import JDLogo from "../../assets/J.D 로고.svg";
import "./LookbookViewer.css";

function toHiRes(src, size = 1600) {
  try {
    const url = new URL(src);
    url.searchParams.set("w", String(size));
    url.searchParams.set("h", String(size));
    url.searchParams.set("q", "85");
    return url.toString();
  } catch {
    return src;
  }
}

const CAPTIONS = [
  "오늘의 무드, 집다움과 함께 🌿",
  "빛이 머무는 자리, 우리 집의 계절 ☀️",
  "작은 소품 하나로 완성되는 분위기 ✨",
  "주말엔 이런 공간에서 쉬고 싶다는 생각이 들어요 🏡",
  "집다움 쇼룸에서 담아온 오늘의 장면 📷",
  "네추럴한 톤으로 완성한 리빙 스타일링",
  "따뜻한 계절감이 느껴지는 인테리어 소품들",
  "집다움이 제안하는 오늘의 홈 스타일링",
];

const SAMPLE_COMMENTS = [
  { user: "hana_home", text: "여기 소품 어디서 구하신 거예요?!" },
  { user: "j_minsu", text: "분위기 진짜 좋다 😍" },
  { user: "wood.and.linen", text: "저장 완료.. 우리집도 이렇게 꾸미고 싶어요" },
  { user: "seoyeon_lee", text: "톤 완전 제 취향이에요" },
  { user: "daily_room_", text: "조명이 예술이네요" },
  { user: "haeun_c", text: "집다움 믿고 삽니다 항상" },
];

function LookbookViewer({ photos, index, onClose, onNavigate }) {
  const [likedMap, setLikedMap] = useState({});
  const [commentsByIndex, setCommentsByIndex] = useState({});
  const [commentInput, setCommentInput] = useState("");
  const [burstId, setBurstId] = useState(0);

  useEffect(() => setCommentInput(""), [index]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
      if (e.key === "ArrowRight" && index < photos.length - 1) onNavigate(index + 1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [index, photos.length, onClose, onNavigate]);

  const liked = !!likedMap[index];
  const baseLikes = ((index * 47 + 213) % 480) + 60;
  const likeCount = baseLikes + (liked ? 1 : 0);
  const daysAgo = (index % 12) + 1;
  const caption = CAPTIONS[index % CAPTIONS.length];
  const comments = [SAMPLE_COMMENTS[index % 6], SAMPLE_COMMENTS[(index + 3) % 6]];
  const myComments = commentsByIndex[index] || [];

  const toggleLike = () => setLikedMap((prev) => ({ ...prev, [index]: !prev[index] }));

  const handleDoubleClick = () => {
    if (!likedMap[index]) setLikedMap((prev) => ({ ...prev, [index]: true }));
    setBurstId((n) => n + 1);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    const text = commentInput.trim();
    if (!text) return;
    setCommentsByIndex((prev) => ({ ...prev, [index]: [...(prev[index] || []), { user: "me", text }] }));
    setCommentInput("");
  };

  return (
    <div className="igOverlay" onClick={onClose}>
      <button className="igCloseBtn" onClick={onClose} aria-label="닫기">
        <X size={22} />
      </button>
      <span className="igCounter">{index + 1} / {photos.length}</span>

      {index > 0 && (
        <button className="igNavBtn igNavPrev" onClick={(e) => { e.stopPropagation(); onNavigate(index - 1); }} aria-label="이전 사진">
          <ChevronLeft size={22} />
        </button>
      )}
      {index < photos.length - 1 && (
        <button className="igNavBtn igNavNext" onClick={(e) => { e.stopPropagation(); onNavigate(index + 1); }} aria-label="다음 사진">
          <ChevronRight size={22} />
        </button>
      )}

      <div className="igCard" onClick={(e) => e.stopPropagation()}>
        <div className="igImageSide" onDoubleClick={handleDoubleClick}>
          <img src={toHiRes(photos[index])} alt={`리빙 갤러리 ${index + 1}`} className="igImage" />
          {burstId > 0 && (
            <Heart
              key={burstId}
              className="igBurstHeart"
              size={90}
              fill="#fff"
              stroke="#fff"
              onAnimationEnd={() => setBurstId(0)}
            />
          )}
        </div>

        <div className="igInfoSide">
          <div className="igHeader">
            <span className="igAvatar"><img src={JDLogo} alt="" /></span>
            <div className="igHeaderText">
              <span className="igUsername">jipdaum_official</span>
              <span className="igLocation">집다움 쇼룸 · 서울</span>
            </div>
            <button className="igFollowBtn" type="button">팔로우</button>
            <MoreHorizontal size={18} className="igMoreIcon" />
          </div>

          <div className="igCommentsScroll" data-lenis-prevent>
            <div className="igCommentRow">
              <span className="igAvatar igAvatarSm"><img src={JDLogo} alt="" /></span>
              <p><span className="igUsername">jipdaum_official</span> {caption}</p>
            </div>
            {comments.map((c, i) => (
              <div className="igCommentRow" key={i}>
                <span className="igAvatarInitial">{c.user[0].toUpperCase()}</span>
                <p><span className="igUsername">{c.user}</span> {c.text}</p>
              </div>
            ))}
            {myComments.map((c, i) => (
              <div className="igCommentRow" key={"mine" + i}>
                <span className="igAvatarInitial igAvatarMe">나</span>
                <p><span className="igUsername">me</span> {c.text}</p>
              </div>
            ))}
          </div>

          <div className="igActionsRow">
            <div className="igActionsLeft">
              <button onClick={toggleLike} className={"igIconBtn" + (liked ? " liked" : "")} aria-label="좋아요">
                <Heart size={22} fill={liked ? "currentColor" : "none"} />
              </button>
              <button className="igIconBtn" aria-label="댓글" type="button">
                <MessageCircle size={22} />
              </button>
              <button className="igIconBtn" aria-label="공유" type="button">
                <Send size={22} />
              </button>
            </div>
            <button className="igIconBtn" aria-label="저장" type="button">
              <Bookmark size={22} />
            </button>
          </div>

          <p className="igLikeCount">좋아요 {likeCount.toLocaleString()}개</p>
          <p className="igDate">{daysAgo}일 전</p>

          <form className="igCommentForm" onSubmit={handleAddComment}>
            <input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="댓글 달기..."
            />
            <button type="submit" disabled={!commentInput.trim()}>게시</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LookbookViewer;
