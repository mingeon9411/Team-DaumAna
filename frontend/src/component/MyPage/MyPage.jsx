import "./MyPage.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LuChevronLeft, LuCrown, LuTrophy, LuMedal, LuLeaf, LuUser } from "react-icons/lu";
import { logoutUser, getOrderHistory, getMyCoupons, cancelOrder, getMe, getMyInquiries, createInquiry, updateSecurityQa } from "../../api";
import { SECURITY_QUESTIONS } from "../../data/securityQuestions";
import { useWishlist } from "../../hooks/useWishlist";
import bird2 from "../../assets/decor/bird2.png";
import flowers from "../../assets/decor/flowers.png";
import Receipt from "./Receipt";
import TrackingModal from "./TrackingModal";
import AddressModal from "./AddressModal";
import { useAuthModal } from "../../context/AuthModalContext";
import { useMyPageModal } from "../../context/MyPageModalContext";
import { useWithdrawModal } from "../../context/WithdrawModalContext";
import HomeHeroBanner from "../Home/HomeHeroBanner";

// 사이드바 nav(마이페이지/주문내역/위시리스트/...)를 대체하는 상단 탭 목록.
// key는 activeSection 값과 그대로 대응한다.
const TABS = [
  { key: "main", label: "마이페이지" },
  { key: "orders", label: "주문내역 조회" },
  { key: "wishlist", label: "위시리스트" },
  { key: "grade", label: "회원등급" },
  { key: "coupon", label: "쿠폰" },
  { key: "address", label: "배송지 관리" },
  { key: "inquiry", label: "1:1 문의" },
  { key: "profile", label: "회원 정보" },
];

const STATUS_LABEL = {
  PENDING: "입금대기",
  ORDERED: "주문완료",
  SHIPPED: "배송중",
  DELIVERED: "배송완료",
  CANCELLED: "취소",
};

// 일반 < 그린 < 브론즈 < 실버 < 골드 순 — 배열은 gradeIdx 계산 편의상 높은
// 등급부터(골드가 0번) 담아둔다. min은 누적 구매금액 기준 승급 조건.
const GRADE_CONFIG = [
  { key: "골드",   rank: 1, min: 1500000, color1: "#2a1c00", color2: "#6b4a00", accent: "#f5c842", Icon: LuCrown,  desc: "150만원 이상" },
  { key: "실버",   rank: 2, min: 700000,  color1: "#1c2830", color2: "#3d4f5c", accent: "#94a3b8", Icon: LuTrophy, desc: "70만원 이상" },
  { key: "브론즈", rank: 3, min: 300000,  color1: "#2e1508", color2: "#5a2f14", accent: "#b87333", Icon: LuMedal,  desc: "30만원 이상" },
  { key: "그린",   rank: 4, min: 100000,  color1: "#0f2418", color2: "#1f4a30", accent: "#4ade80", Icon: LuLeaf,   desc: "10만원 이상" },
  { key: "일반",   rank: 5, min: 0,       color1: "#26221c", color2: "#3f3a30", accent: "#9ca3af", Icon: LuUser,   desc: "기본 등급" },
];

function formatDate(isoStr) {
  if (!isoStr) return "";
  return new Date(isoStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function normalizeOrder(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  return {
    ...order,
    total_amount: Number(order.total_amount) || 0,
    items: items.map((item) => ({
      ...item,
      ordered_price: Number(item.ordered_price) || 0,
      quantity: Number(item.quantity) || 0,
    })),
  };
}

function MyPage() {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const { closeMyPage } = useMyPageModal();
  const { openWithdraw } = useWithdrawModal();
  const [nickname, setNickname] = useState(() => localStorage.getItem("nickname") || "회원");
  const [nicknameDraft, setNicknameDraft] = useState(nickname);
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem("profileImage") || "");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [myCoupons, setMyCoupons] = useState([]);
  const [profile, setProfile] = useState(null);
  const { wishlist, removeWish: handleRemoveWish, loading: wishlistLoading, error: wishlistError } = useWishlist();
  // 보안질문 설정/변경 — 안내 모달(EmailVerify.jsx)을 계속 건너뛴 회원의 유일한 재설정 경로.
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaAnswer, setQaAnswer] = useState("");
  const [qaMessage, setQaMessage] = useState("");
  const [qaSaving, setQaSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("main");

  // 배송지 관리 — 별도 백엔드 모델이 없어 위시리스트/리뷰와 같은 방식으로 로컬에 저장한다.
  const [addresses, setAddresses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("savedAddresses")) || [];
    } catch {
      return [];
    }
  });
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // 1:1 문의 — 관리자는 Django Admin에서 answer 필드를 채워 답변한다.
  const [inquiries, setInquiries] = useState([]);
  const [inquiryTitle, setInquiryTitle] = useState("");
  const [inquiryContent, setInquiryContent] = useState("");
  const [inquirySubmitting, setInquirySubmitting] = useState(false);

  const updateAddresses = (next) => {
    setAddresses(next);
    localStorage.setItem("savedAddresses", JSON.stringify(next));
  };

  const handleSaveAddress = (data) => {
    if (editingAddress) {
      updateAddresses(
        addresses.map((a) =>
          a.id === editingAddress.id
            ? { ...a, ...data, isDefault: data.isDefault ? true : a.isDefault }
            : data.isDefault ? { ...a, isDefault: false } : a
        )
      );
    } else {
      const newAddress = { ...data, id: Date.now() };
      updateAddresses(
        data.isDefault
          ? [...addresses.map((a) => ({ ...a, isDefault: false })), newAddress]
          : [...addresses, newAddress]
      );
    }
    setAddressModalOpen(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (id) => {
    if (!window.confirm("이 배송지를 삭제하시겠습니까?")) return;
    updateAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleSetDefaultAddress = (id) => {
    updateAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  // 닉네임/프로필 사진 — 별도 백엔드 저장 API가 없어(실제 계정 서비스는 별개인 Spring 서버가
  // 담당) 사이트 전체가 표시용으로 참조하는 localStorage의 nickname 키에 맞춰 로컬로 저장한다.
  const handleNicknameSave = () => {
    const trimmed = nicknameDraft.trim();
    if (!trimmed) {
      alert("닉네임을 입력해주세요.");
      return;
    }
    setNickname(trimmed);
    localStorage.setItem("nickname", trimmed);
    alert("닉네임이 저장되었습니다.");
  };

  // 아이디/비밀번호 찾기 본인확인용 보안질문 설정·변경.
  const handleSaveSecurityQa = async () => {
    if (!qaQuestion) {
      setQaMessage("보안 질문을 선택해주세요.");
      return;
    }
    if (!qaAnswer.trim()) {
      setQaMessage("답변을 입력해주세요.");
      return;
    }
    setQaSaving(true);
    setQaMessage("");
    try {
      await updateSecurityQa(qaQuestion, qaAnswer);
      setProfile((prev) => (prev ? { ...prev, has_security_question: true, security_question: qaQuestion } : prev));
      setQaAnswer("");
      setQaMessage("저장되었습니다.");
    } catch (err) {
      setQaMessage(err.response?.data?.error || "저장에 실패했습니다.");
    } finally {
      setQaSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // localStorage 용량을 아끼기 위해 작은 정사각형으로 리사이즈해서 저장한다.
        const size = 240;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        const scale = Math.max(size / img.width, size / img.height);
        const sw = size / scale;
        const sh = size / scale;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setProfileImage(dataUrl);
        localStorage.setItem("profileImage", dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  useEffect(() => {
    getOrderHistory()
      // res.data가 배열이 아니면(만료된 토큰 등으로 인증 실패 응답이 예상과 다르게 와도)
      // orders.filter/.reduce에서 앱 전체가 죽지 않도록 방어한다.
      .then((res) => setOrders(Array.isArray(res.data) ? res.data.map(normalizeOrder) : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
    getMyCoupons()
      .then((res) => setMyCoupons(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
    getMe()
      .then((res) => {
        setProfile(res.data);
        if (res.data?.security_question) setQaQuestion(res.data.security_question);
      })
      .catch(() => setProfile(null));
    getMyInquiries()
      .then((res) => setInquiries(Array.isArray(res.data) ? res.data : []))
      .catch(() => setInquiries([]));
  }, []);



  const counts = {
    PENDING: orders.filter((o) => o.status === "PENDING").length,
    ORDERED: orders.filter((o) => o.status === "ORDERED").length,
    SHIPPED: orders.filter((o) => o.status === "SHIPPED").length,
    DELIVERED: orders.filter((o) => o.status === "DELIVERED").length,
  };

  // 입금대기(PENDING) 주문은 아직 결제가 확정되지 않았으므로 등급 누적 금액에서 제외한다.
  const completedOrders = orders.filter((o) => ["ORDERED", "SHIPPED", "DELIVERED"].includes(o.status));
  const totalSpent = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const userGrade =
    totalSpent >= 1500000 ? "골드" :
    totalSpent >= 700000  ? "실버" :
    totalSpent >= 300000  ? "브론즈" :
    totalSpent >= 100000  ? "그린" : "일반";
  const gradeIdx = GRADE_CONFIG.findIndex((g) => g.key === userGrade);
  const currentGradeInfo = GRADE_CONFIG[gradeIdx];
  const nextGradeInfo = gradeIdx > 0 ? GRADE_CONFIG[gradeIdx - 1] : null;
  const progressToNext = nextGradeInfo
    ? Math.min(100, Math.floor(((totalSpent - currentGradeInfo.min) / (nextGradeInfo.min - currentGradeInfo.min)) * 100))
    : 100;

  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh_token");
    try {
      if (refresh) await logoutUser({ refresh });
    } catch {
      // Logout is best-effort: local credentials must still be cleared.
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("nickname");
    // 로그인 시(SocialCallback/EmailVerify)는 다 쏘는데 로그아웃만 빠져 있었음 —
    // Sidebar의 로그인 상태 표시, 챗봇의 대화 메모리 삭제 등이 이 이벤트에 기대고 있다.
    window.dispatchEvent(new Event("authchange"));
    closeMyPage();
    navigate("/");
    openLogin();
  };

  const handleCancelOrder = async (e, orderId) => {
    e.stopPropagation();
    if (!window.confirm("주문을 취소하시겠습니까?")) return;
    try {
      await cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED", payment_status: null } : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || "주문 취소에 실패했습니다.");
    }
  };

  const handleShowTracking = (e, order) => {
    e.stopPropagation();
    setTrackingOrder(order);
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryTitle.trim() || !inquiryContent.trim()) {
      alert("제목과 문의 내용을 모두 입력해주세요.");
      return;
    }
    setInquirySubmitting(true);
    try {
      const res = await createInquiry(inquiryTitle.trim(), inquiryContent.trim());
      setInquiries((prev) => [res.data, ...prev]);
      setInquiryTitle("");
      setInquiryContent("");
    } catch (err) {
      alert(err.response?.data?.message || "문의 등록에 실패했습니다.");
    } finally {
      setInquirySubmitting(false);
    }
  };

  return (
    // metallicSilver — 상품 목록 그리드(Home.jsx #home-products)와 같은 파스텔 배경
    // 클래스. Settings.jsx/CustomerCenter.jsx와 같은 전면 페이지 패턴(히어로 +
    // 콘텐츠). 사이드바 대신 히어로 아래 가로 탭으로 섹션을 전환한다.
    <div className="mypagePage metallicSilver" data-hsnap data-lenis-prevent>
      <div className="mypageWrap">
        <div className="mypageTopRow">
          <button type="button" className="mypageBackBtn" onClick={closeMyPage}>
            <LuChevronLeft size={14} /> 홈으로
          </button>
          <button type="button" className="mypageLogoutBtn" onClick={handleLogout}>로그아웃</button>
        </div>

        <HomeHeroBanner videoSrc="/videos/uhdfps.mp4" />

        {trackingOrder && (
          <TrackingModal
            order={trackingOrder}
            onClose={() => setTrackingOrder(null)}
          />
        )}

        {selectedOrder && (
          <Receipt
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}

        <AddressModal
          isOpen={addressModalOpen}
          onClose={() => { setAddressModalOpen(false); setEditingAddress(null); }}
          onSave={handleSaveAddress}
          initialData={editingAddress}
        />

        <section className="mypageHero">
          <p className="mypageHeroSub">
            {activeSection === "coupon" ? "내 쿠폰" : "마이페이지"}
          </p>
          <p className="welcomeText">반갑습니다, <strong>{nickname}</strong>님</p>
        </section>

        <nav className="mypageTabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={"mypageTab" + (activeSection === tab.key ? " active" : "")}
              onClick={() => setActiveSection(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mypageBox">
        {/* ── 메인 섹션 ── */}
        {activeSection === "main" && (
          <>
            <div className="userInfoGrid">
              <div>
                <span>회원등급</span>
                <strong>{userGrade} 회원</strong>
              </div>
              <div
                className="couponCell"
                onClick={() => setActiveSection("coupon")}
              >
                <span>쿠폰</span>
                <strong>{myCoupons.length}개</strong>
              </div>
            </div>

            <section className="orderSection">
              <h2>주문내역</h2>

              <div className="orderStatus">
                <div>
                  <p>입금대기</p>
                  <strong className={counts.PENDING > 0 ? "active" : ""}>{counts.PENDING}</strong>
                </div>
                <div>
                  <p>상품준비중</p>
                  <strong className={counts.ORDERED > 0 ? "active" : ""}>{counts.ORDERED}</strong>
                </div>
                <div>
                  <p>배송중</p>
                  <strong className={counts.SHIPPED > 0 ? "active" : ""}>{counts.SHIPPED}</strong>
                </div>
                <div>
                  <p>배송완료</p>
                  <strong className={counts.DELIVERED > 0 ? "active" : ""}>{counts.DELIVERED}</strong>
                </div>
              </div>

              {loading ? (
                <p className="emptyText">불러오는 중...</p>
              ) : orders.length === 0 ? (
                <p className="emptyText">주문 내역이 없습니다.</p>
              ) : (
                <div className="orderList">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className={"orderCard" + (order.payment_status === "SUCCESS" ? " clickable" : "")}
                      onClick={() => order.payment_status === "SUCCESS" && setSelectedOrder(order)}
                    >
                      <div className="orderCardHead">
                        <div className="orderCardHeadLeft">
                          <span className="orderNo">주문번호 #{order.id}</span>
                          <span className="orderDate">{formatDate(order.order_date)}</span>
                        </div>
                        <span className={"statusBadge " + order.status}>
                          {STATUS_LABEL[order.status] || order.status_display}
                        </span>
                      </div>

                      <div className="orderCardBody">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="orderItemRow">
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt={item.product_name}
                                className="orderItemThumb"
                              />
                            ) : (
                              <div className="orderItemThumbEmpty" />
                            )}
                            <div className="orderItemInfo">
                              <p className="orderItemName">{item.product_name}</p>
                              <p className="orderItemPrice">
                                {item.ordered_price.toLocaleString()}원 x {item.quantity}개
                              </p>
                            </div>
                            <span className="orderItemAmt">
                              {(item.ordered_price * item.quantity).toLocaleString()}원
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="orderCardFoot">
                        <span className="orderPayMethod">
                          {order.payment_method || "결제수단 미확인"}
                        </span>
                        <span className="orderTotal">
                          총 {order.total_amount.toLocaleString()}원
                        </span>
                        {order.status === "PENDING" && (
                          <button
                            className="orderCancelBtn"
                            onClick={(e) => handleCancelOrder(e, order.id)}
                          >
                            주문 취소
                          </button>
                        )}
                        {order.payment_status === "SUCCESS" && (
                          <button
                            className="orderTrackingBtn"
                            onClick={(e) => handleShowTracking(e, order)}
                          >
                            배송조회
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="wishSection">
              <div className="sectionTop">
                <h2>위시리스트</h2>
                <button onClick={() => setActiveSection("wishlist")}>전체보기</button>
              </div>
              {wishlistLoading ? <p>위시리스트를 불러오는 중입니다.</p> : wishlistError ? <p role="alert">{wishlistError}</p> : wishlist.length === 0 ? (
                <p className="emptyText">관심상품 내역이 없습니다.</p>
              ) : (
                <div className="wishPreviewGrid">
                  {wishlist.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="wishPreviewCard"
                      onClick={() => { closeMyPage(); navigate(`/item/${item.id}`); }}
                    >
                      <div className="wishPreviewImgBox">
                        <img src={item.image} alt={item.name} />
                        <button
                          className="wishRemoveBtn"
                          onClick={(e) => { e.stopPropagation(); handleRemoveWish(item.id); }}
                          aria-label="위시리스트 삭제"
                        >♥</button>
                      </div>
                      <p className="wishPreviewName">{item.name}</p>
                      <p className="wishPreviewPrice">{(item.price ?? 0).toLocaleString()}원</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="accountSection">
              <div>
                <h2>내 계정 관리</h2>
                <p>회원정보 수정, 비밀번호 변경, 회원탈퇴를 관리할 수 있습니다.</p>
              </div>
              <button className="withdrawBtn" onClick={() => { closeMyPage(); openWithdraw(); }}>
                회원탈퇴
              </button>
            </section>
          </>
        )}

        {/* ── 쿠폰 섹션 ── */}
        {activeSection === "coupon" && (
          <section className="myCouponSection">
            {/* 배너 */}
            <div className="myCouponBanner">
              <div className="myCouponBannerOverlay" />
              <div className="myCouponBannerCenter">
                <p className="myCouponBannerSub">내 쿠폰</p>
                <p className="myCouponBannerTitle">나의 쿠폰함</p>
                <p className="myCouponBannerCount">
                  <strong>{myCoupons.length}</strong>장 보유 중
                </p>
              </div>
            </div>

            {myCoupons.length === 0 ? (
              <div className="myCouponEmpty">
                <span className="myCouponEmptyIcon">🎫</span>
                <p>보유한 쿠폰이 없습니다</p>
                <span>이벤트 또는 관리자를 통해 쿠폰을 받아보세요</span>
              </div>
            ) : (
              <div className="myCouponList">
                {myCoupons.map((c) => {
                  const formatDiscount = (c) => {
                    if (c.discount_type === "FIXED")
                      return `${c.discount_value.toLocaleString()}원 할인`;
                    let txt = `${c.discount_value}% 할인`;
                    if (c.max_discount_amount)
                      txt += ` (최대 ${c.max_discount_amount.toLocaleString()}원)`;
                    return txt;
                  };
                  const isPercent = c.discount_type === "PERCENT";
                  return (
                    <div
                      className={"cpCard" + (isPercent ? " percent" : " fixed")}
                      key={c.id}
                    >
                      <div className="cpCardLeft">
                        <span className="cpValue">
                          {isPercent
                            ? `${c.discount_value}%`
                            : `${c.discount_value.toLocaleString()}원`}
                        </span>
                        <span className="cpValueLabel">쿠폰 할인카드</span>
                      </div>
                      <div className="cpCardRight">
                        <img
                          className="cpCardDeco"
                          src={isPercent ? bird2 : flowers}
                          alt=""
                        />
                        <p className="cpName">{c.name}</p>
                        <p className="cpDesc">{formatDiscount(c)}</p>
                        {c.min_order_amount > 0 && (
                          <p className="cpCond">
                            {c.min_order_amount.toLocaleString()}원 이상 구매 시
                          </p>
                        )}
                        <div className="cpBottom">
                          <span className="cpCode">{c.code}</span>
                          {c.expiry_date ? (
                            <span className="cpExpiry">~ {c.expiry_date}</span>
                          ) : (
                            <span className="cpExpiry noExpiry">제한 없음</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="myCouponFootNote">쿠폰은 결제에서 사용가능 합니다.</p>
          </section>
        )}

        {/* ── 주문내역 피드 섹션 ── */}
        {activeSection === "orders" && (
          <section className="myOrderFeedSection">
            <div className="myOrderFeedHeader">
              <h2>주문 내역</h2>
              {!loading && <span className="myOrderFeedCount">총 {orders.length}건</span>}
            </div>

            {loading ? (
              <p className="emptyText">불러오는 중...</p>
            ) : orders.length === 0 ? (
              <div className="myOrderFeedEmpty">
                <span className="myOrderFeedEmptyIcon">📦</span>
                <p>주문 내역이 없습니다</p>
                <span>첫 주문을 시작해보세요</span>
              </div>
            ) : (
              <div className="feedList">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={"feedItem" + (order.payment_status === "SUCCESS" ? " clickable" : "")}
                    onClick={() => order.payment_status === "SUCCESS" && setSelectedOrder(order)}
                  >
                    <div className="feedDot" />
                    <div className="feedMeta">
                      <span className="feedDate">{formatDate(order.order_date)}</span>
                      <span className={"statusBadge " + order.status}>
                        {STATUS_LABEL[order.status] || order.status_display}
                      </span>
                    </div>
                    <div className="feedCard">
                      <div className="feedCardTop">
                        <span className="feedOrderNo">주문번호 #{order.id}</span>
                      </div>
                      <div className="feedThumbStrip">
                        {order.items.map((item, idx) =>
                          item.product_image ? (
                            <img
                              key={idx}
                              src={item.product_image}
                              alt={item.product_name}
                              className="feedThumb"
                              title={item.product_name}
                            />
                          ) : (
                            <div key={idx} className="feedThumbEmpty" />
                          )
                        )}
                      </div>
                      <div className="feedCardFoot">
                        <span className="feedItemCount">상품 {order.items.length}개</span>
                        <span className="feedTotal">
                          총 {order.total_amount.toLocaleString()}원
                        </span>
                        {order.status === "PENDING" && (
                          <button
                            className="orderCancelBtn"
                            onClick={(e) => handleCancelOrder(e, order.id)}
                          >
                            주문 취소
                          </button>
                        )}
                        {order.payment_status === "SUCCESS" && (
                          <button
                            className="orderTrackingBtn"
                            onClick={(e) => handleShowTracking(e, order)}
                          >
                            배송조회
                          </button>
                        )}
                        {order.payment_status === "SUCCESS" && (
                          <span className="feedReceipt">영수증 보기 →</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── 회원 등급 섹션 ── */}
        {activeSection === "grade" && (
          <section className="myGradeSection">
            {/* 현재 등급 히어로 */}
            <div
              className="gradeHeroCard"
              style={{ background: `linear-gradient(135deg, ${currentGradeInfo.color1}, ${currentGradeInfo.color2})` }}
            >
              <currentGradeInfo.Icon className="gradeHeroImg" style={{ color: currentGradeInfo.accent }} />
              <div className="gradeHeroContent">
                <p className="gradeHeroLabel">현재 등급</p>
                <p className="gradeHeroName" style={{ color: currentGradeInfo.accent }}>
                  {currentGradeInfo.key}
                </p>
                <p className="gradeHeroSpent">
                  총 구매금액 <strong>{totalSpent.toLocaleString()}원</strong>
                </p>
                {nextGradeInfo ? (
                  <div className="gradeHeroProgress">
                    <div className="gradeHeroProgressLabel">
                      <span>다음 등급은?</span>
                      <span style={{ color: currentGradeInfo.accent }}>
                        {(nextGradeInfo.min - totalSpent).toLocaleString()}원
                      </span>
                    </div>
                    <div className="gradeProgressBarBg">
                      <div
                        className="gradeProgressBarFill"
                        style={{ width: `${progressToNext}%`, background: currentGradeInfo.accent, color: currentGradeInfo.accent }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="gradeHeroMax" style={{ color: currentGradeInfo.accent }}>
                    ✦ 최고 등급 달성
                  </p>
                )}
              </div>
            </div>

            {/* 등급 기준 목록 */}
            <p className="gradeTierTitle">등급 기준</p>
            <div className="gradeTierList">
              {GRADE_CONFIG.map((g) => {
                const isCurrent = g.key === userGrade;
                const isAchieved = totalSpent >= g.min;
                return (
                  <div
                    className={"gradeTierCard" + (isCurrent ? " current" : isAchieved ? " achieved" : " locked")}
                    key={g.key}
                    style={isCurrent ? { borderColor: g.accent } : undefined}
                  >
                    <div
                      className="gradeTierLeft"
                      style={{ background: `linear-gradient(160deg, ${g.color1}, ${g.color2})` }}
                    >
                      <span className="gradeTierRank">#{g.rank}</span>
                      <span className="gradeTierName" style={{ color: g.accent }}>{g.key}</span>
                    </div>
                    <g.Icon className="gradeTierImg" style={{ color: g.accent }} />
                    <div className="gradeTierInfo">
                      <p className="gradeTierDesc">{g.desc}</p>
                      <p className="gradeTierMin">
                        {g.min > 0
                          ? `누적 ${g.min.toLocaleString()}원 이상 구매`
                          : "신규 가입 시 기본 등급"}
                      </p>
                    </div>
                    <div className="gradeTierStatus">
                      {isCurrent && (
                        <span className="gradeTierBadge badgeCurrent" style={{ background: g.accent }}>
                          현재 등급
                        </span>
                      )}
                      {!isCurrent && isAchieved && (
                        <span className="gradeTierBadge badgeAchieved">✓등급 달성</span>
                      )}
                      {!isAchieved && (
                        <span className="gradeTierBadge badgeLocked">잠금</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 위시리스트 섹션 ── */}
        {activeSection === "wishlist" && (
          <section className="myWishSection">
            <div className="myWishCountBar">
              총 <strong>{wishlist.length}</strong>개의 관심상품
            </div>
            {wishlistLoading ? <p>위시리스트를 불러오는 중입니다.</p> : wishlistError ? <p role="alert">{wishlistError}</p> : wishlist.length === 0 ? (
              <div className="myWishEmpty">
                <span className="myWishEmptyIcon">🤍</span>
                <p>관심상품이 없습니다</p>
                <span>상품의 하트 버튼을 눌러 위시리스트에 추가해보세요</span>
              </div>
            ) : (
              <div className="myWishGrid">
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="myWishCard"
                    onClick={() => { closeMyPage(); navigate(`/item/${item.id}`); }}
                  >
                    <div className="myWishImgBox">
                      <img src={item.image} alt={item.name} />
                      <button
                        className="myWishHeartBtn"
                        onClick={(e) => { e.stopPropagation(); handleRemoveWish(item.id); }}
                        aria-label="위시리스트 삭제"
                      >♥</button>
                    </div>
                    <div className="myWishInfo">
                      <p className="myWishName">{item.name}</p>
                      {item.desc && <p className="myWishDesc">{item.desc}</p>}
                      <p className="myWishPrice">{(item.price ?? 0).toLocaleString()}원</p>
                      {item.review > 0 && (
                        <p className="myWishReview">★ {item.review}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── 배송지 관리 섹션 ── */}
        {activeSection === "address" && (
          <section className="myAddressSection">
            <div className="addressSectionHead">
              <div>
                <h2>배송지 관리</h2>
                <p>자주 쓰는 배송지를 등록해두면 결제 시 빠르게 선택할 수 있습니다.</p>
              </div>
              <button
                type="button"
                className="addressAddBtn"
                onClick={() => { setEditingAddress(null); setAddressModalOpen(true); }}
              >
                + 새 배송지 추가
              </button>
            </div>

            {addresses.length === 0 ? (
              <p className="addressEmptyText">등록된 배송지가 없습니다.</p>
            ) : (
              <div className="addressCardList">
                {addresses.map((a) => (
                  <div className={"addressCard" + (a.isDefault ? " default" : "")} key={a.id}>
                    <div className="addressCardHead">
                      <span className="addressCardLabel">{a.label}</span>
                      {a.isDefault && <span className="addressDefaultBadge">기본 배송지</span>}
                    </div>
                    <p className="addressCardRecipient">{a.recipient} · {a.phone}</p>
                    <p className="addressCardLine">{a.address} {a.detail}</p>
                    <div className="addressCardBtns">
                      {!a.isDefault && (
                        <button type="button" onClick={() => handleSetDefaultAddress(a.id)}>기본으로 설정</button>
                      )}
                      <button
                        type="button"
                        onClick={() => { setEditingAddress(a); setAddressModalOpen(true); }}
                      >
                        수정
                      </button>
                      <button type="button" onClick={() => handleDeleteAddress(a.id)}>삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── 1:1 문의 섹션 ── */}
        {activeSection === "inquiry" && (
          <section className="myInquirySection">
            <div className="inquiryFormCard">
              <h2>문의 남기기</h2>
              <form className="inquiryForm" onSubmit={handleSubmitInquiry}>
                <label>
                  제목
                  <input
                    type="text"
                    value={inquiryTitle}
                    onChange={(e) => setInquiryTitle(e.target.value)}
                    placeholder="문의 제목을 입력해주세요"
                    maxLength={200}
                  />
                </label>
                <label>
                  문의 내용
                  <textarea
                    value={inquiryContent}
                    onChange={(e) => setInquiryContent(e.target.value)}
                    placeholder="문의하실 내용을 자세히 적어주시면 빠르게 답변드릴게요."
                    rows={6}
                  />
                </label>
                <button type="submit" className="inquirySubmitBtn" disabled={inquirySubmitting}>
                  {inquirySubmitting ? "전송 중..." : "전송"}
                </button>
              </form>
            </div>

            <div className="inquiryListCard">
              <h2>문의 내역</h2>
              {inquiries.length === 0 ? (
                <p className="emptyText">등록한 문의가 없습니다.</p>
              ) : (
                <div className="inquiryList">
                  {inquiries.map((q) => (
                    <div key={q.id} className="inquiryItem">
                      <div className="inquiryItemHead">
                        <span className="inquiryItemTitle">{q.title}</span>
                        <span className={"inquiryStatusBadge" + (q.answer ? " answered" : "")}>
                          {q.answer ? "답변완료" : "답변대기"}
                        </span>
                      </div>
                      <p className="inquiryItemDate">{formatDate(q.created_at)}</p>
                      <p className="inquiryItemContent">{q.content}</p>
                      {q.answer && (
                        <div className="inquiryAnswerBox">
                          <span className="inquiryAnswerLabel">관리자 답변</span>
                          <p>{q.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 회원 정보 섹션 ── */}
        {activeSection === "profile" && (
          <section className="myProfileSection">
            <div className="profileEditCard">
              <label className="profileAvatarUpload">
                {profileImage ? (
                  <img src={profileImage} alt="프로필 사진" className="profileAvatarImg" />
                ) : (
                  <span className="profileAvatarPlaceholder">{(profile?.nickname || nickname).slice(0, 1)}</span>
                )}
                <span className="profileAvatarEditBadge">사진 변경</span>
                <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
              </label>

              <div className="profileNicknameEdit">
                <label htmlFor="nicknameInput">닉네임</label>
                <div className="profileNicknameRow">
                  <input
                    id="nicknameInput"
                    type="text"
                    value={nicknameDraft}
                    onChange={(e) => setNicknameDraft(e.target.value)}
                    placeholder="닉네임을 입력해주세요"
                  />
                  <button type="button" onClick={handleNicknameSave} disabled={nicknameDraft.trim() === nickname}>
                    저장
                  </button>
                </div>
              </div>
            </div>

            <div className="profileInfoCard">
              <div className="profileInfoRow">
                <span>닉네임</span>
                <strong>{nickname}</strong>
              </div>
              <div className="profileInfoRow">
                <span>아이디</span>
                <strong>{profile?.username || "-"}</strong>
              </div>
              <div className="profileInfoRow">
                <span>이메일</span>
                <strong>
                  {profile?.email || "-"}
                  {profile?.is_email_verified && (
                    <em className="profileVerifiedBadge">인증완료</em>
                  )}
                </strong>
              </div>
            </div>

            <section className="accountSection">
              <div>
                <h2>보안 질문</h2>
                <p>
                  {profile?.has_security_question
                    ? "아이디·비밀번호를 잊었을 때 본인확인에 쓰입니다. 답변만 다시 입력하면 변경됩니다."
                    : "아직 설정되지 않았습니다 — 설정해두면 아이디·비밀번호 찾기를 이용할 수 있어요."}
                </p>
              </div>
              <div className="securityQaRow">
                <select value={qaQuestion} onChange={(e) => setQaQuestion(e.target.value)}>
                  <option value="">질문 선택</option>
                  {SECURITY_QUESTIONS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="답변"
                  value={qaAnswer}
                  onChange={(e) => setQaAnswer(e.target.value)}
                />
                <button type="button" onClick={handleSaveSecurityQa} disabled={qaSaving}>
                  {qaSaving ? "저장 중..." : "저장"}
                </button>
              </div>
              {qaMessage && <p className="profileInfoRow"><span>{qaMessage}</span></p>}
            </section>

            <section className="accountSection">
              <div>
                <h2>내 계정 관리</h2>
                <p>회원탈퇴 시 회원 정보와 주문 내역이 삭제됩니다.</p>
              </div>
              <button className="withdrawBtn" onClick={() => { closeMyPage(); openWithdraw(); }}>
                회원탈퇴
              </button>
            </section>
          </section>
        )}
        </div>
      </div>
    </div>
  );
}

export default MyPage;
