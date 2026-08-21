import "./MyPage.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logoutUser, getOrderHistory, getMyCoupons, cancelOrder, getMe } from "../../api";
import { getWishlist, removeWish } from "../../utils/wishlist";
import korfurni from "../../assets/products/korfurni.png";
import bird2 from "../../assets/decor/bird2.png";
import bird from "../../assets/decor/bird.png";
import flowers from "../../assets/decor/flowers.png";
import orientCloud from "../../assets/decor/orient_cloud.png";
import flower2Img from "../../assets/decor/flower2.png";
import Receipt from "./Receipt";
import TrackingModal from "./TrackingModal";
import AddressModal from "./AddressModal";
import { useAuthModal } from "../../context/AuthModalContext";
import { useMyPageModal } from "../../context/MyPageModalContext";
import { useWithdrawModal } from "../../context/WithdrawModalContext";
import JDLogo from "../../assets/J.D 로고.svg";
// -sm: 34px로만 쓰여서 원본(1015x600, 750KB) 대신 축소본을 쓴다.
import JipdaumHanokLogo from "../../assets/logo/Jipdaum-logo-Light-transparent-sm.png";
import JipdaumHanokLogoDark from "../../assets/logo/Jipdaum-logo-Dark-transparent-sm.png";

const STATUS_LABEL = {
  PENDING: "입금대기",
  ORDERED: "주문완료",
  SHIPPED: "배송중",
  DELIVERED: "배송완료",
  CANCELLED: "취소",
};

const GRADE_CONFIG = [
  { key: "VVIP",   rank: 1, min: 1500000, color1: "#0f0800", color2: "#3a1e00", accent: "#f5c842", img: bird2,       desc: "150만원 이상" },
  { key: "VIP",    rank: 2, min: 700000,  color1: "#120020", color2: "#2a0045", accent: "#c084fc", img: bird,        desc: "70만원 이상" },
  { key: "GOLD",   rank: 3, min: 300000,  color1: "#222222", color2: "#6b2e00", accent: "#f59e0b", img: flowers,     desc: "30만원 이상" },
  { key: "SILVER", rank: 4, min: 100000,  color1: "#1c2830", color2: "#2c3e50", accent: "#94a3b8", img: orientCloud, desc: "10만원 이상" },
  { key: "BRONZE", rank: 5, min: 0,       color1: "#2e1508", color2: "#4a2010", accent: "#b87333", img: flower2Img,  desc: "기본 등급" },
];

function formatDate(isoStr) {
  if (!isoStr) return "";
  return new Date(isoStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function MyPage() {
  const navigate = useNavigate();
  const { openLogin } = useAuthModal();
  const { isOpen, closeMyPage } = useMyPageModal();
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
  const [wishlist, setWishlist] = useState(() => getWishlist());
  const [activeSection, setActiveSection] = useState("main");
  const [darkMode, setDarkMode] = useState(
    () => document.body.classList.contains("dark")
  );

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
    const syncDarkMode = () => setDarkMode(document.body.classList.contains("dark"));
    window.addEventListener("darkmodechange", syncDarkMode);
    return () => window.removeEventListener("darkmodechange", syncDarkMode);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    getOrderHistory()
      // res.data가 배열이 아니면(만료된 토큰 등으로 인증 실패 응답이 예상과 다르게 와도)
      // orders.filter/.reduce에서 앱 전체가 죽지 않도록 방어한다.
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
    getMyCoupons()
      .then((res) => setMyCoupons(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
    getMe()
      .then((res) => setProfile(res.data))
      .catch(() => setProfile(null));
  }, [isOpen]);

  useEffect(() => {
    setWishlist(getWishlist());
  }, [activeSection]);

  const handleRemoveWish = (id) => {
    removeWish(id);
    setWishlist(getWishlist());
  };

  const counts = {
    PENDING: orders.filter((o) => o.status === "PENDING").length,
    ORDERED: orders.filter((o) => o.status === "ORDERED").length,
    SHIPPED: orders.filter((o) => o.status === "SHIPPED").length,
    DELIVERED: orders.filter((o) => o.status === "DELIVERED").length,
  };

  const totalSpent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const userGrade =
    totalSpent >= 1500000 ? "VVIP" :
    totalSpent >= 700000  ? "VIP"  :
    totalSpent >= 300000  ? "GOLD" :
    totalSpent >= 100000  ? "SILVER" : "BRONZE";
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
    } catch (e) {}
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

  if (!isOpen) return null;

  return (
    <div className="mypageModalOverlay">
    <main className="mypage" data-lenis-prevent>
      <button type="button" className="mypageModalClose" onClick={closeMyPage} aria-label="닫기">
        ×
      </button>

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


      <aside className="mypageSide">
        <div className="mypageLogoRow">
          <img src={JDLogo} alt="J.D" className="mypageLogoJD" />
          <span className="mypageLogoDivider" />
          <img
            src={darkMode ? JipdaumHanokLogoDark : JipdaumHanokLogo}
            alt="집다움"
            className="mypageLogoHanok"
          />
        </div>
        <nav>
          <p className={activeSection === "main" ? "active" : ""} onClick={() => setActiveSection("main")}>마이페이지</p>
          <p className={activeSection === "orders" ? "active" : ""} onClick={() => setActiveSection("orders")}>주문내역 조회</p>
          <p className={activeSection === "wishlist" ? "active" : ""} onClick={() => setActiveSection("wishlist")}>위시리스트</p>
          <p className={activeSection === "grade" ? "active" : ""} onClick={() => setActiveSection("grade")}>회원등급</p>
          <p className={activeSection === "coupon" ? "active" : ""} onClick={() => setActiveSection("coupon")}>쿠폰</p>
          <p className={activeSection === "points" ? "active" : ""} onClick={() => setActiveSection("points")}>적립금</p>
          <p className={activeSection === "address" ? "active" : ""} onClick={() => setActiveSection("address")}>배송지 관리</p>
          <p className={activeSection === "inquiry" ? "active" : ""} onClick={() => setActiveSection("inquiry")}>1:1 문의</p>
          <p className={activeSection === "profile" ? "active" : ""} onClick={() => setActiveSection("profile")}>회원 정보</p>
          <p onClick={handleLogout}>로그아웃</p>
        </nav>
      </aside>

      <section className="mypageBox">
        {/* ── 히어로 (항상 표시) ── */}
        <div className="mypageHero">
          <p className="mypageHeroSub">
            {activeSection === "coupon" ? "MY COUPON" : "MY PAGE"}
          </p>
          <p className="welcomeText">반갑습니다, <strong>{nickname}</strong>님</p>
        </div>

        {/* ── 메인 섹션 ── */}
        {activeSection === "main" && (
          <>
            <div className="userInfoGrid">
              <div>
                <span>회원등급</span>
                <strong>MARU</strong>
              </div>
              <div>
                <span>적립금</span>
                <strong>0P</strong>
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
                  <strong>{counts.PENDING}</strong>
                </div>
                <div>
                  <p>상품준비중</p>
                  <strong>{counts.ORDERED}</strong>
                </div>
                <div>
                  <p>배송중</p>
                  <strong>{counts.SHIPPED}</strong>
                </div>
                <div>
                  <p>배송완료</p>
                  <strong>{counts.DELIVERED}</strong>
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
              {wishlist.length === 0 ? (
                <p className="emptyText">관심상품 내역이 없습니다.</p>
              ) : (
                <div className="wishPreviewGrid">
                  {wishlist.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="wishPreviewCard"
                      onClick={() => { closeMyPage(); navigate(`/product/${item.id}`); }}
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
            <div className="myCouponBanner" style={{ backgroundImage: `url(${korfurni})` }}>
              <div className="myCouponBannerOverlay" />
              <div className="myCouponBannerCenter">
                <p className="myCouponBannerSub">MY COUPON</p>
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
              <img className="gradeHeroImg" src={currentGradeInfo.img} alt="" />
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
                    <img className="gradeTierImg" src={g.img} alt={g.key} />
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
            {wishlist.length === 0 ? (
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
                    onClick={() => { closeMyPage(); navigate(`/product/${item.id}`); }}
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
                <h2>내 계정 관리</h2>
                <p>회원탈퇴 시 회원 정보와 주문 내역이 삭제됩니다.</p>
              </div>
              <button className="withdrawBtn" onClick={() => { closeMyPage(); openWithdraw(); }}>
                회원탈퇴
              </button>
            </section>
          </section>
        )}
      </section>
    </main>
    </div>
  );
}

export default MyPage;
