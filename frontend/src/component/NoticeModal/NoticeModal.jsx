import "./NoticeModal.css";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useNoticeModal } from "../../context/NoticeModalContext";

const NOTICES = [
  {
    id: 1,
    date: "2026.07.10",
    tag: "이벤트",
    title: "7월 할인행사 안내",
    body: "7월 한 달간 전 상품 최대 20% 할인 이벤트를 진행합니다. 회원 등급별 추가 쿠폰도 함께 확인해보세요.",
  },
  {
    id: 2,
    date: "2026.07.05",
    tag: "배송",
    title: "여름 장마철 배송 지연 안내",
    body: "장마철 기상 상황에 따라 일부 지역 배송이 1~2일 지연될 수 있습니다. 양해 부탁드립니다.",
  },
  {
    id: 3,
    date: "2026.06.28",
    tag: "공지",
    title: "고객센터 운영시간 변경 안내",
    body: "고객센터 운영시간이 평일 09:00~18:00으로 변경되었습니다. 주말/공휴일은 휴무입니다.",
  },
  {
    id: 4,
    date: "2026.06.15",
    tag: "이벤트",
    title: "신규 회원 가입 혜택",
    body: "지금 가입하시면 첫 구매 시 사용 가능한 10% 할인 쿠폰을 드립니다.",
  },
];

function NoticeModal() {
  const { isOpen, closeNotice } = useNoticeModal();
  const { pathname } = useLocation();
  const isKoreanHallZone =
    pathname === "/korean-hall" ||
    pathname.startsWith("/product/") ||
    pathname === "/korean-hall/checkout";

  const [selectedId, setSelectedId] = useState(null);

  // 모달이 닫혔다 다시 열릴 때는 항상 목록부터 보여준다.
  useEffect(() => {
    if (!isOpen) setSelectedId(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const selected = NOTICES.find((n) => n.id === selectedId) || null;

  return (
    <div className="noticeModalOverlay">
      <div className={`noticeModalInner${isKoreanHallZone ? " noticeModalKoreanHall" : ""}`}>
        <button
          type="button"
          className="noticeModalClose"
          onClick={closeNotice}
          aria-label="닫기"
        >
          ×
        </button>

        <div className="noticeModalHeader">
          {selected ? (
            <button type="button" className="noticeBackBtn" onClick={() => setSelectedId(null)}>
              <ChevronLeft size={16} /> 목록으로
            </button>
          ) : (
            <h2>공지사항</h2>
          )}
        </div>

        <div className="noticeModalResults" data-lenis-prevent>
          {selected ? (
            <div className="noticeDetail">
              <div className="noticeItemHead">
                <span className="noticeTag">{selected.tag}</span>
                <span className="noticeDate">{selected.date}</span>
              </div>
              <h3 className="noticeDetailTitle">{selected.title}</h3>
              <p className="noticeDetailBody">{selected.body}</p>
            </div>
          ) : (
            <ul className="noticeList">
              {NOTICES.map((notice) => (
                <li key={notice.id} className="noticeItem">
                  <button type="button" className="noticeItemBtn" onClick={() => setSelectedId(notice.id)}>
                    <div className="noticeItemHead">
                      <span className="noticeTag">{notice.tag}</span>
                      <span className="noticeDate">{notice.date}</span>
                    </div>
                    <h3 className="noticeTitle">{notice.title}</h3>
                    <p className="noticeBody">{notice.body}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default NoticeModal;
