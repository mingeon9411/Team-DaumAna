import { useWishlist } from "../../hooks/useWishlist";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart, X, Search, Camera, ShoppingBag, Star } from "lucide-react";
import "./Home.css";
import ChatBot from "../MyPage/ChatBot";
import LookbookViewer from "./LookbookViewer";
import RecentlyViewedSidebar from "./RecentlyViewedSidebar";
import HomeHeroBanner from "./HomeHeroBanner";
import HomeFeatureBanner from "./HomeFeatureBanner";
import PopularKeywordsSidebar from "../Sidebar/PopularKeywordsSidebar";
import SiteFooter from "../SiteFooter";
import { getRecentlyViewed } from "../../utils/recentlyViewed";
import { useNestedLenis } from "../../hooks/useNestedLenis";
import rugB from "../../assets/products/(러그) 북유럽풍 러그 B형.jpg";
import woodMoodLamp from "../../assets/products/(무드등) 우드 롱 무드등.jpg";
import smallMoodLamp from "../../assets/products/(무드등) 북유럽풍 침대 작은 무드등.jpg";
import linenWoodSofa from "../../assets/products/(소파) 린넨 우드 소파.jpg";
import nordicSofa from "../../assets/products/(소파) 북유럽 소파.jpg";
import europeanWoodSofa from "../../assets/products/(소파) 유러피안 우드 소파.jpg";
import linenLaundryBasket from "../../assets/products/(소품) 린넨 빨래 바구니.jpg";
import patternLaundryBasket from "../../assets/products/(소품) 북유럽 문양 빨래 바구니.jpg";
import rugA from "../../assets/products/(소품) 북유럽풍 러그 A형.jpg";
import ecoWoodLaundryBasket from "../../assets/products/(소품) 친환경 우드 빨래 바구니.jpg";
import woodChair from "../../assets/products/(의자) 우드 의자.jpg";
import woodChairInterior from "../../assets/interior/(의자) 우드 의자 - 인테리어.jpg";
import resortChair from "../../assets/products/(의자) 유럽풍 피서지 의자.jpg";
import nordicBed from "../../assets/products/(침대) 북유럽 침대.jpg";
import pastelPatternBed from "../../assets/products/(침대) 북유럽풍 파스텔 문양 침대.jpg";
import spriteMatA from "../../assets/products/생활용품/발매트/스프라이트 발매트(A타입).png";
import spriteMatB from "../../assets/products/생활용품/발매트/스프라이트 발매트(B타입).png";
import thickTowelA from "../../assets/products/생활용품/수건/두께가 있는 세면 수건(A타입).png";
import thickTowelB from "../../assets/products/생활용품/수건/두꼐가 있는 세면 수건(B타입).png";
import waffleTowel from "../../assets/products/생활용품/수건/와플 문양 수건.png";
import furrySlipperGray from "../../assets/products/생활용품/실내화/부드러운 털 실내화 (그레이).png";
import furrySlipperGreen from "../../assets/products/생활용품/실내화/부드러운 털 실내화 (그린).png";
import furrySlipperBrown from "../../assets/products/생활용품/실내화/부드러운 털 실내화 (브라운).png";
import furrySlipperNavy from "../../assets/products/생활용품/실내화/부드러운 털 실내화(네이비).png";
import drainSandalRed from "../../assets/products/생활용품/욕실화/물이 잘 빠지는 욕실화 (레드).png";
import drainSandalBlack from "../../assets/products/생활용품/욕실화/물이 잘 빠지는 욕실화 (블랙).png";
import drainSandalBlue from "../../assets/products/생활용품/욕실화/물이 잘 빠지는 욕실화 (블루).png";
import drainSandalWhite from "../../assets/products/생활용품/욕실화/물이 잘 빠지는 욕실화 (화이트).png";
import darkBrownSofa from "../../assets/products/소파/(소파) 다크 브라운 고급 소파 - 1.png";
import mushroomLampGreen from "../../assets/products/무드등/(무드등) 버섯 무드등(그린).png";
import mushroomLampNavy from "../../assets/products/무드등/(무드등) 버섯 무드등(네이비).png";
import mushroomLampOrange from "../../assets/products/무드등/(무드등) 버섯 무드등(오렌지).png";
import wideLiberoSandalRed from "../../assets/products/생활용품/욕실화/(욕실화)  미끄럼방지 와이드 리베로 EVA 욕실화 - 레드.png";
import wideLiberoSandalBlue from "../../assets/products/생활용품/욕실화/(욕실화)  미끄럼방지 와이드 리베로 EVA 욕실화 - 블루.png";
import cloudSandalBlack from "../../assets/products/생활용품/욕실화/(욕실화) EVA 미끄러짐 방지 욕실화 - 블랙.png";
import cloudSandalWhite from "../../assets/products/생활용품/욕실화/(욕실화) EVA 미끄러짐 방지 욕실화 - 화이트.png";
// 인테리어 컷 — 일부 상품만 있음. 카드에 커서를 올리면 스튜디오 사진 대신
// 방에 놓인 모습으로 잠깐 전환해서 보여준다(마우스를 떼면 원래 사진으로 복귀).
import rugBInterior from "../../assets/interior/(소품) 북유럽풍 러그 B형 -인테리어.jpg";
import patternLaundryBasketInterior from "../../assets/interior/(소품) 북유럽 문양 빨래 바구니 - 인테리어.jpg";
import rugAInterior from "../../assets/interior/(소품) 북유럽풍 러그 A형 - 인테리어.jpg";
import ecoWoodLaundryBasketInterior from "../../assets/interior/(소품) 친환경 우드 빨래 바구니 - 인테리어.jpg";
import pastelPatternBedInterior from "../../assets/interior/(침대) 북유럽풍 파스텔 문양 침대 - 인테리어.jpg";
import woodMoodLampInterior from "../../assets/interior/(무드등) 북유럽풍 우드 무드등 - 인테리어.jpg";
import smallMoodLampInterior from "../../assets/interior/(무드등) 북유럽풍 침대 작은 무드등 - 인테리어.jpg";
import linenWoodSofaInterior from "../../assets/interior/(소파) 린넨 우드 소파 - 인테리어.jpg";
import nordicSofaInterior from "../../assets/interior/(소파) 북유럽 소파 - 인테리어.jpg";
import europeanWoodSofaInterior from "../../assets/interior/(소파) 유러피안 우드 소파 - 인테리어.jpg";
import resortChairInterior from "../../assets/interior/(의자) 유럽풍 피서지 의자 - 인테리어.png";
import nordicBedInterior from "../../assets/interior/(침대) 북유럽 침대 - 인테리어.jpg";
import darkBrownSofaInterior from "../../assets/interior/(소파) 다크 브라운 고급 소파 - 인테리어.png";
import mushroomLampInterior from "../../assets/interior/(무드등) LED 무드 버섯등 - 인테리어.png";
import wideLiberoSandalInterior from "../../assets/interior/(욕실화)  미끄럼방지 와이드 리베로 EVA 욕실화 - 레드 인테리어.png";
import cloudSandalInterior from "../../assets/interior/(욕실화) EVA 미끄럼 방지 욕실화 - 인테리어 2.png";
import { getCartItems, getProductsByCollection, getPhotoReviews, logoutUser } from "../../api";
import { POSTS } from "../Lookbook/posts";
import { useAuthModal } from "../../context/AuthModalContext";
import { useMyPageModal } from "../../context/MyPageModalContext";


const SERIF = { fontFamily: "'GmarketSans', 'Noto Serif KR', serif" };
const SANS = { fontFamily: "'GmarketSans', 'Noto Sans KR', sans-serif" };
const MONO = { fontFamily: "'GmarketSans', 'DM Mono', monospace" };

// 상품 배지(BESTSELLER/NEW/ECO)는 필터링·매칭 로직(ChatBot, Cart, 이 파일의
// NEW_PRODUCT_TIPS 등)이 product.label 값 자체를 그대로 비교해서 쓰기 때문에
// 데이터는 안 건드리고, 화면에 보여줄 때만 한글로 바꾼다(4060 사용자 직관성 피드백 반영).
export const LABEL_KO = { BESTSELLER: "인기 상품", NEW: "신상품", ECO: "친환경" };
export const labelKo = (label) => LABEL_KO[label] || label;

// 상품 카드(이 파일)·상세페이지(HomeProductDetail.jsx) 둘 다 같은 라벨 뱃지
// 색상을 쓴다 — labelKo와 같은 키를 쓰는 별도 맵이라, 새 라벨이 추가되면 여기도
// 같이 채워야 한다(없으면 기본 색으로만 표시).
export const LABEL_BADGE = {
  BESTSELLER: { className: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800/60" },
  NEW: { className: "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/40 dark:border-blue-800/60" },
  ECO: { className: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800/60" },
};

export const PRODUCTS = [
  { id: 1, no: "No.1", name: "북유럽풍 러그 B형", sub: "멀티 파스텔 아브스트랙트", price: "168,000", originalPrice: "198,000", label: "BESTSELLER",
    desc: "크림 베이스 위에 블루·올리브·더스티핑크가 어우러진 추상 아라베스크 무늬 터프팅 러그입니다. 두툼한 울 파일감이 발끝에 포근하게 감기고, 어느 벽지·바닥재와도 무난하게 어울려 거실이나 침실 중심에 깔기 좋습니다.",
    spec: "SIZE : W160 D230 · MATERIAL : wool, cotton backing",
    image: rugB, interiorImage: rugBInterior, alt: "북유럽풍 러그 B형", brand: "집다움", category: "러그", midCategory: "패턴러그", subCategory: "울 아브스트랙트" },
  { id: 2, no: "No.2", name: "우드 롱 무드등", sub: "내추럴 라탄", price: "118,000", label: "NEW",
    desc: "오크 원목 스탠드에 라탄 케인 원통 갓을 씌운 플로어 조명입니다. 불을 켜면 라탄 사이로 은은한 그물무늬 빛이 새어나와 저녁 시간 거실에 따뜻한 분위기를 더합니다.",
    spec: "SIZE : W38 D38 H118 · MATERIAL : oak, rattan cane",
    image: woodMoodLamp, interiorImage: woodMoodLampInterior, alt: "우드 롱 무드등", brand: "집다움", category: "조명", midCategory: "플로어조명", subCategory: "오크 라탄" },
  { id: 3, no: "No.3", name: "북유럽풍 침대 작은 무드등", sub: "내추럴 우드 & 자연사", price: "49,000", label: "NEW",
    desc: "원뿔형 원목 다리 위에 천연 마사(자연사)를 촘촘히 감아 만든 미니 무드등입니다. 침대 협탁이나 콘솔 위에 올려두면 아늑한 저녁 조명으로 제격입니다.",
    spec: "SIZE : W20 D20 H32 · MATERIAL : wood, jute rope",
    image: smallMoodLamp, interiorImage: smallMoodLampInterior, alt: "북유럽풍 침대 작은 무드등", brand: "집다움", category: "조명", midCategory: "테이블조명", subCategory: "우드 자연사" },
  { id: 4, no: "No.4", name: "린넨 우드 소파", sub: "샌드 베이지", price: "498,000", originalPrice: "560,000", label: "BESTSELLER",
    desc: "오크 프레임 팔걸이를 자연사로 엮고, 두툼한 린넨 쿠션을 올린 2인용 소파입니다. 담백한 프레임과 부드러운 쿠션감이 균형을 이뤄 거실 어디에 두어도 편안한 무게중심이 됩니다.",
    spec: "SIZE : W165 D80 H78 · MATERIAL : linen, oak, rope",
    image: linenWoodSofa, interiorImage: linenWoodSofaInterior, alt: "린넨 우드 소파", brand: "집다움", category: "소파", midCategory: "2인소파", subCategory: "리넨 오크" },
  { id: 5, no: "No.5", name: "북유럽 소파", sub: "아이보리 부클", price: "780,000", originalPrice: "890,000", label: "NEW",
    desc: "곡선을 그리며 이어지는 프레임에 부클 원단을 두른 라운지형 3인 소파입니다. 낮은 좌면과 넉넉한 팔걸이가 몸을 편안히 감싸 주고, 오브제 같은 실루엣이 거실의 시선을 자연스럽게 붙잡습니다.",
    spec: "SIZE : W240 D95 H70 · MATERIAL : boucle, ash wood",
    image: nordicSofa, interiorImage: nordicSofaInterior, alt: "북유럽 소파", brand: "집다움", category: "소파", midCategory: "3인소파", subCategory: "부클 애쉬우드" },
  { id: 6, no: "No.6", name: "유러피안 우드 소파", sub: "머스터드 옐로우", price: "560,000", label: "NEW",
    desc: "라탄 케인을 짜 넣은 등받이와 월넛 톤 원목 프레임이 클래식한 무드를 더하는 3인용 소파입니다. 머스터드 컬러 쿠션이 포인트가 되어 차분한 공간에 생기를 불어넣습니다.",
    spec: "SIZE : W205 D85 H82 · MATERIAL : rattan cane, walnut, cotton",
    image: europeanWoodSofa, interiorImage: europeanWoodSofaInterior, alt: "유러피안 우드 소파", brand: "집다움", category: "소파", midCategory: "3인소파", subCategory: "라탄 월넛" },
  { id: 7, no: "No.7", name: "린넨 빨래 바구니", sub: "민트 그레이 컬러블록", price: "32,000", label: "ECO",
    desc: "민트, 블루, 아이보리가 컬러블록으로 나뉜 패브릭 빨래 바구니입니다. 가벼운 무광 소재에 메탈 손잡이를 달아 옷방과 욕실을 오가며 들고 다니기 편합니다.",
    spec: "SIZE : W36 D36 H40 · MATERIAL : coated fabric, metal handle",
    // 예전엔 여기 interiorImage로 라탄 소재 바구니 사진이 잘못 물려 있었다 — 이
    // 상품은 패브릭인데 완전히 다른 소재 사진이 떠서 삭제함(대체할 정확한
    // 인테리어 컷은 아직 없음 — 촬영본 생기면 다시 연결할 것).
    image: linenLaundryBasket, alt: "린넨 빨래 바구니", brand: "집다움", category: "수납", midCategory: "수납바구니", subCategory: "패브릭 메탈핸들" },
  { id: 8, no: "No.8", name: "북유럽 문양 빨래 바구니", sub: "내추럴 라탄", price: "45,000", label: "NEW",
    desc: "가는 라탄 가닥을 별무늬로 엮어 짠 바스켓으로, 가죽 손잡이가 포인트를 더합니다. 세탁물 정리는 물론 담요나 잡지꽂이로도 어울리는 다용도 소품입니다.",
    spec: "SIZE : W34 D34 H36 · MATERIAL : rattan, leather handle",
    image: patternLaundryBasket, interiorImage: patternLaundryBasketInterior, alt: "북유럽 문양 빨래 바구니", brand: "집다움", category: "수납", midCategory: "수납바구니", subCategory: "라탄 레더핸들" },
  { id: 9, no: "No.9", name: "북유럽풍 러그 A형", sub: "아이보리 지오메트릭", price: "128,000", label: "NEW",
    desc: "삼각·다이아몬드 패턴을 세이지, 블루그레이 톤으로 촘촘히 터프팅한 러그입니다. 기하학적인 패턴이 공간에 리듬감을 더해 소파 앞이나 침대 곁 포인트 러그로 잘 어울립니다.",
    spec: "SIZE : W140 D200 · MATERIAL : wool, cotton backing",
    // 실제로는 소품이 아니라 러그다 — 대분류 오태그를 이번 정리에서 함께 바로잡음.
    image: rugA, interiorImage: rugAInterior, alt: "북유럽풍 러그 A형", brand: "집다움", category: "러그", midCategory: "패턴러그", subCategory: "울 지오메트릭" },
  { id: 10, no: "No.10", name: "친환경 우드 빨래 바구니", sub: "내추럴 라탄 & 가죽", price: "39,000", label: "ECO",
    desc: "천연 라탄을 촘촘히 엮고 가죽 손잡이를 덧댄 친환경 소재 바구니입니다. 옷방, 욕실, 아이 방 등 어디에 두어도 자연스럽게 스며드는 내추럴한 분위기를 냅니다.",
    spec: "SIZE : W38 D38 H40 · MATERIAL : rattan, leather handle",
    image: ecoWoodLaundryBasket, interiorImage: ecoWoodLaundryBasketInterior, alt: "친환경 우드 빨래 바구니", brand: "집다움", category: "수납", midCategory: "수납바구니", subCategory: "친환경 라탄" },
  // id 11~14는 원래 이 자리였으나 한국관(korean_hall) 상품이 전역 PK 11~17을 이미 쓰고
  // 있어 charset 충돌(IntegrityError)이 나서 31~34로 옮겼다 — Product.id가 컬렉션 무관하게
  // 전역 유니크해야 하기 때문. reset_main_products.py도 반드시 같이 맞출 것.
  { id: 31, no: "No.31", name: "우드 의자", sub: "내추럴 라탄 케인", price: "219,000", label: "NEW",
    desc: "둥근 라탄 케인 등받이와 오크 프레임이 만나는 자그마한 암체어입니다. 넉넉한 리넨 쿠션을 더해 식탁 의자로도, 침실 코너 체어로도 편안하게 쓸 수 있습니다.",
    spec: "SIZE : W64 D58 H74 · MATERIAL : oak, rattan cane, linen",
    image: woodChair, interiorImage: woodChairInterior, alt: "우드 의자", brand: "집다움", category: "의자", midCategory: "암체어", subCategory: "오크 라탄" },
  { id: 32, no: "No.32", name: "유럽풍 피서지 의자", sub: "코냑 브라운 레더 스트랩", price: "268,000", originalPrice: "298,000", label: "BESTSELLER",
    desc: "티크 원목 프레임에 가죽 스트랩을 교차로 엮어 만든 로우 라운지 체어입니다. 낮은 좌면과 여유로운 각도가 휴양지에 온 듯한 편안함을 주어, 테라스나 창가 자리에 잘 어울립니다.",
    spec: "SIZE : W68 D75 H68 · MATERIAL : teak wood, leather strap",
    image: resortChair, interiorImage: resortChairInterior, alt: "유럽풍 피서지 의자", brand: "집다움", category: "의자", midCategory: "라운지체어", subCategory: "티크 레더" },
  { id: 33, no: "No.33", name: "북유럽 침대", sub: "내추럴 오크", price: "890,000", originalPrice: "1,250,000", label: "BESTSELLER",
    desc: "원목의 결과 라이브 엣지를 살린 헤드보드가 인상적인 플랫폼 침대 프레임입니다. 군더더기 없는 낮은 구조로 침실을 한층 넓고 차분하게 만들어 줍니다.",
    spec: "SIZE : W160 D200 H85 (Q) · MATERIAL : solid oak",
    image: nordicBed, interiorImage: nordicBedInterior, alt: "북유럽 침대", brand: "집다움", category: "침대", midCategory: "프레임침대", subCategory: "솔리드 오크" },
  { id: 34, no: "No.34", name: "북유럽풍 파스텔 문양 침대", sub: "멀티 파스텔 아브스트랙트", price: "950,000", label: "NEW",
    desc: "블루, 세이지, 로즈 톤의 추상 패턴 패브릭으로 감싼 업홀스터리 침대입니다. 높은 헤드보드가 침실의 포인트가 되어 주고, 부드러운 패딩감이 등을 편안하게 받쳐줍니다.",
    spec: "SIZE : W165 D210 H130 (Q) · MATERIAL : polyester fabric, wood frame",
    image: pastelPatternBed, interiorImage: pastelPatternBedInterior, alt: "북유럽풍 파스텔 문양 침대", brand: "집다움", category: "침대", midCategory: "업홀스터리침대", subCategory: "패브릭 우드프레임" },
  { id: 18, no: "No.18", name: "스프라이트 발매트 A타입", sub: "아이보리 브라운 스트라이프", price: "32,000", label: "NEW",
    desc: "아이보리 바탕에 브라운 톤 스트라이프를 촘촘히 짜 넣은 극세사 발매트입니다. 미끄럼 방지 네이비 바인딩으로 마감해 욕실 입구나 세면대 앞에 깔아도 안정감 있게 자리를 지킵니다.",
    spec: "SIZE : W60 D180 · MATERIAL : microfiber, non-slip backing",
    image: spriteMatA, alt: "스프라이트 발매트 A타입", brand: "집다움", category: "발매트", midCategory: "발매트", subCategory: "브라운 스트라이프" },
  { id: 19, no: "No.19", name: "스프라이트 발매트 B타입", sub: "아이보리 네이비 스트라이프", price: "32,000", label: "NEW",
    desc: "아이보리 바탕에 네이비 스트라이프를 더한 극세사 발매트입니다. 짙은 컬러가 화이트·그레이 톤 욕실과 산뜻하게 어우러지고, 두툼한 파일감이 물기를 빠르게 흡수합니다.",
    spec: "SIZE : W60 D180 · MATERIAL : microfiber, non-slip backing",
    image: spriteMatB, alt: "스프라이트 발매트 B타입", brand: "집다움", category: "발매트", midCategory: "발매트", subCategory: "네이비 스트라이프" },
  { id: 20, no: "No.20", name: "두께감 세면 수건 A타입", sub: "레드 블루 헤링본", price: "14,000", label: "NEW",
    desc: "레드와 블루가 교차하는 헤링본 스트라이프 세면 수건입니다. 두께감 있는 순면 파일이 물기를 넉넉히 흡수하면서도 가볍게 말라 매일 쓰기 좋습니다.",
    spec: "SIZE : W34 D75 · MATERIAL : cotton 100%",
    image: thickTowelA, alt: "두께감 세면 수건 A타입", brand: "집다움", category: "수건", midCategory: "세면타월", subCategory: "헤링본 레드 블루" },
  { id: 21, no: "No.21", name: "두께감 세면 수건 B타입", sub: "틸 머스터드 헤링본", price: "14,000", label: "NEW",
    desc: "틸과 머스터드가 어우러진 헤링본 스트라이프 세면 수건입니다. 색을 맞춰 욕실 소품을 꾸미기 좋고, 도톰한 파일감이 산뜻한 사용감을 줍니다.",
    spec: "SIZE : W34 D75 · MATERIAL : cotton 100%",
    image: thickTowelB, alt: "두께감 세면 수건 B타입", brand: "집다움", category: "수건", midCategory: "세면타월", subCategory: "헤링본 틸 머스터드" },
  { id: 22, no: "No.22", name: "와플 문양 수건", sub: "내추럴 베이지 와플", price: "16,000", label: "ECO",
    desc: "베이지 톤 와플 문양으로 짠 순면 수건입니다. 도톰하게 짜인 조직이 통기성이 좋아 잘 마르고, 은은한 컬러로 어떤 욕실에도 무난히 어울립니다.",
    spec: "SIZE : W40 D80 · MATERIAL : cotton waffle weave",
    image: waffleTowel, alt: "와플 문양 수건", brand: "집다움", category: "수건", midCategory: "세면타월", subCategory: "와플 베이지" },
  // 4개 색상(그레이/그린/브라운/네이비)을 한 상품으로 묶고 colors[]로 옵션 처리한다
  // (id는 기존 그레이 상품의 23을 그대로 씀 — 그린/브라운/네이비였던 24~26은 폐기).
  // colors[].value는 DB(JIPDAUM_PRODUCT_OPTION.option_value)의 색상 옵션 값과 반드시 일치해야
  // 상세페이지가 고른 색상을 실제 주문 가능한 옵션 id로 매칭할 수 있다.
  { id: 23, no: "No.23", name: "부드러운 털 실내화", sub: "차콜 그레이 스트라이프", price: "16,000", label: "BESTSELLER",
    desc: "부드러운 극세사로 안팎을 감싼 슬리퍼형 실내화입니다. 두툼한 안창이 발끝을 포근하게 받쳐주고, 컬러별로 각기 다른 무드를 더해줍니다.",
    spec: "SIZE : 250-270mm (Free) · MATERIAL : fleece, EVA sole",
    image: furrySlipperGray, alt: "부드러운 털 실내화", brand: "집다움", category: "실내화", midCategory: "극세사 실내화", subCategory: "그레이 스트라이프",
    colors: [
      { value: "그레이", label: "차콜 그레이 스트라이프", image: furrySlipperGray, alt: "부드러운 털 실내화 그레이" },
      { value: "그린", label: "세이지 그린", image: furrySlipperGreen, alt: "부드러운 털 실내화 그린" },
      { value: "브라운", label: "웜 브라운", image: furrySlipperBrown, alt: "부드러운 털 실내화 브라운" },
      { value: "네이비", label: "딥 네이비", image: furrySlipperNavy, alt: "부드러운 털 실내화 네이비" },
    ] },
  // 4개 색상(레드/블랙/블루/화이트)을 한 상품으로 묶고 colors[]로 옵션 처리한다
  // (id는 기존 레드 상품의 27을 그대로 씀 — 블랙/블루/화이트였던 28~30은 폐기).
  { id: 27, no: "No.27", name: "물이 잘 빠지는 욕실화", sub: "레드", price: "10,000", label: "NEW",
    desc: "배수 슬릿을 낸 쿠션 소재 욕실화입니다. 도톰한 EVA 밑창이 푹신하게 발을 받쳐주고, 미끄럼을 줄여주는 표면 처리로 젖은 바닥에서도 안심하고 신을 수 있습니다. 컬러별로 각기 다른 무드를 더해줍니다.",
    spec: "SIZE : 250-270mm (Free) · MATERIAL : EVA",
    image: drainSandalRed, alt: "물이 잘 빠지는 욕실화", brand: "집다움", category: "욕실화", midCategory: "쿠션 욕실화", subCategory: "레드",
    colors: [
      { value: "레드", label: "레드", image: drainSandalRed, alt: "물이 잘 빠지는 욕실화 레드" },
      { value: "블랙", label: "블랙", image: drainSandalBlack, alt: "물이 잘 빠지는 욕실화 블랙" },
      { value: "블루", label: "블루", image: drainSandalBlue, alt: "물이 잘 빠지는 욕실화 블루" },
      { value: "화이트", label: "화이트", image: drainSandalWhite, alt: "물이 잘 빠지는 욕실화 화이트" },
    ] },
  { id: 35, no: "No.35", name: "다크 브라운 고급 소파", sub: "차콜 브라운 니트", price: "890,000", label: "NEW",
    desc: "굵은 니트 원단으로 감싼 모듈형 2인 소파입니다. 낮고 넉넉한 좌면과 두툼한 팔걸이가 안정감 있게 몸을 받쳐주고, 짙은 차콜 브라운 톤이 공간에 차분한 무게감을 더합니다.",
    spec: "SIZE : W165 D95 H75 · MATERIAL : knit fabric, wood frame",
    image: darkBrownSofa, interiorImage: darkBrownSofaInterior, alt: "다크 브라운 고급 소파", brand: "집다움", category: "소파", midCategory: "2인소파", subCategory: "차콜 니트" },
  // 3색(그린/네이비/오렌지) 컬러 옵션 상품 — 부드러운 털 실내화(id 23)와 같은 패턴.
  { id: 36, no: "No.36", name: "버섯 무드등", sub: "세이지 그린", price: "39,000", label: "NEW",
    desc: "동그란 버섯 모양 갓 아래로 은은한 불빛이 퍼지는 미니 무드등입니다. 협탁이나 콘솔 위에 올려두기 좋은 크기로, 컬러별로 각기 다른 무드를 더해줍니다.",
    spec: "SIZE : W12 D12 H15 · MATERIAL : ceramic base, acrylic shade",
    image: mushroomLampGreen, interiorImage: mushroomLampInterior, alt: "버섯 무드등", brand: "집다움", category: "조명", midCategory: "테이블조명", subCategory: "세이지 그린",
    colors: [
      { value: "그린", label: "세이지 그린", image: mushroomLampGreen, alt: "버섯 무드등 그린" },
      { value: "네이비", label: "딥 네이비", image: mushroomLampNavy, alt: "버섯 무드등 네이비" },
      { value: "오렌지", label: "선셋 오렌지", image: mushroomLampOrange, alt: "버섯 무드등 오렌지" },
    ] },
  // 2색(레드/블루) 컬러 옵션 — 드레인 슬릿 없이 폭 넓은 밴드형 욕실화(기존 27~30번
  // "물이 잘 빠지는 욕실화"와는 다른 디자인 라인).
  { id: 37, no: "No.37", name: "와이드 리베로 욕실화", sub: "레드", price: "15,000", label: "NEW",
    desc: "발등을 넉넉히 감싸는 폭 넓은 밴드형 욕실화입니다. 배수 슬릿을 낸 EVA 밑창이 물기를 빠르게 흘려보내고, 두 가지 컬러가 만나는 배색이 포인트를 더합니다.",
    spec: "SIZE : 250-270mm (Free) · MATERIAL : EVA",
    image: wideLiberoSandalRed, interiorImage: wideLiberoSandalInterior, alt: "와이드 리베로 욕실화", brand: "집다움", category: "욕실화", midCategory: "쿠션 욕실화", subCategory: "레드",
    colors: [
      { value: "레드", label: "레드", image: wideLiberoSandalRed, alt: "와이드 리베로 욕실화 레드" },
      { value: "블루", label: "블루", image: wideLiberoSandalBlue, alt: "와이드 리베로 욕실화 블루" },
    ] },
  // 2색(블랙/화이트) — 통통한 필로우 형태의 쿠션 욕실화, 위 와이드 리베로와는
  // 또 다른 실루엣(밴드 없이 발 전체를 감싸는 슬라이드형)의 별도 상품.
  { id: 38, no: "No.38", name: "필로우 쿠션 욕실화", sub: "블랙", price: "18,000", label: "NEW",
    desc: "구름 위를 걷는 듯한 도톰한 쿠셔닝의 슬라이드형 욕실화입니다. 미끄럼을 줄여주는 밑창 처리로 젖은 바닥에서도 안심하고 신을 수 있습니다.",
    spec: "SIZE : 250-270mm (Free) · MATERIAL : EVA",
    image: cloudSandalBlack, interiorImage: cloudSandalInterior, alt: "필로우 쿠션 욕실화", brand: "집다움", category: "욕실화", midCategory: "쿠션 욕실화", subCategory: "블랙",
    colors: [
      { value: "블랙", label: "블랙", image: cloudSandalBlack, alt: "필로우 쿠션 욕실화 블랙" },
      { value: "화이트", label: "화이트", image: cloudSandalWhite, alt: "필로우 쿠션 욕실화 화이트" },
    ] },
];

// id로 상품을 찾되, colorValue가 있으면 colors[]에서 그 색상의 image/alt/sub로
// 덮어쓴 사본을 돌려준다 — 여러 색상을 한 상품(colors[])으로 합친 뒤에도
// 룩북(Lookbook.jsx/LookbookPost.jsx/ImageHotspots.jsx)처럼 특정 색상 사진을
// 정확히 보여줘야 하는 곳에서 쓴다.
export const resolveProductVariant = (id, colorValue) => {
  const p = PRODUCTS.find((product) => product.id === id);
  if (!p || !colorValue || !p.colors) return p;
  const color = p.colors.find((c) => c.value === colorValue);
  return color ? { ...p, image: color.image, alt: color.alt, sub: color.label } : p;
};

// 대(大)카테고리 아래 중(中)카테고리를 묶어두는 트리 — product.category(중)가
// 어느 대카테고리에 속하는지는 이 트리 하나에서 뽑아 쓴다(따로 매핑 상수를
// 또 만들면 트리를 고칠 때 두 곳을 같이 손봐야 해서 어긋나기 쉽다).
// 소(小)카테고리는 트리가 아니라 product.midCategory 값 자체를 그대로 쓴다
// (기존 "중분류 탭"과 동일한 방식 — 상품마다 이미 붙어있어 별도 정의가 필요 없음).
export const CATEGORY_TREE = [
  {
    label: "가구",
    children: [
      { label: "소파" },
      { label: "의자" },
      { label: "침대" },
    ],
  },
  {
    label: "소품",
    children: [
      { label: "조명" },
      { label: "러그" },
    ],
  },
  {
    label: "생활용품",
    children: [
      { label: "수납" },
      { label: "발매트" },
      { label: "수건" },
      { label: "실내화" },
      { label: "욕실화" },
    ],
  },
];

// product.category(중카테고리) → 그 부모 대카테고리 라벨. CATEGORY_TREE에서 매번
// find로 뒤지지 않도록 모듈 로드 시 한 번만 펼쳐둔다.
const CATEGORY_PARENT = Object.fromEntries(
  CATEGORY_TREE.flatMap((top) => top.children.map((mid) => [mid.label, top.label]))
);

const LOOKBOOK_PHOTOS = [
  "photo-1484101403633-562f891dc89a",
  "photo-1493663284031-b7e3aefcae8e",
  "photo-1512918728675-ed5a9ecdebfd",
  "photo-1519710164239-da123dc03ef4",
  "photo-1522708323590-d24dbb6b0267",
  "photo-1522771739844-6a9f6d5f14af",
  "photo-1524758631624-e2822e304c36",
  "photo-1533090161767-e6ffed986c88",
  "photo-1540932239986-30128078f3c5",
  "photo-1550581190-9c1c48d21d6c",
  "photo-1554995207-c18c203602cb",
  "photo-1556228453-efd6c1ff04f6",
  "photo-1560448204-e02f11c3d0e2",
  "photo-1567016376408-0226e4d0c1ea",
  "photo-1567016432779-094069958ea5",
  "photo-1567538096630-e0c55bd6374c",
  "photo-1583847268964-b28dc8f51f92",
  "photo-1586023492125-27b2c045efd7",
  "photo-1594026112284-02bb6f3352fe",
  "photo-1595526114035-0d45ed16cfbf",
  "photo-1599619351208-3e6c839d6828",
  "photo-1600210492486-724fe5c67fb0",
  "photo-1600585154340-be6161a56a0c",
  "photo-1606760227091-3dd870d97f1d",
  "photo-1616627561950-9f746e330187",
  "photo-1618220179428-22790b461013",
  "photo-1618221195710-dd6b41faaea6",
  "photo-1631679706909-1844bbd07221",
  "photo-1631889993959-41b4e9c6e3c5",
].map((id) => `https://images.unsplash.com/${id}?w=400&h=400&fit=crop&auto=format`);

const LOOKBOOK_PAGE_SIZE = 21;

function Hairline({ className = "" }) {
  return (
    <div
      className={`h-[2px] ${className}`}
      style={{
        background:
          "linear-gradient(90deg, #2a4d8f 0%, #f5f1ea 25%, #a6342a 50%, #1c1a16 75%, #c9a227 100%)",
      }}
    />
  );
}

function Label({ children, className = "" }) {
  return (
    <span className={`text-[10px] tracking-[0.25em] text-muted-foreground uppercase ${className}`} style={MONO}>
      {children}
    </span>
  );
}

// 상품 그리드 카드 — colors[]가 있는 상품(예: 부드러운 털 실내화)은 카드에 커서를
// 올리면 하단에 색상 스와치가 뜨고, 스와치에 커서를 올리면 그 색상 사진으로 바뀐다.
// 스와치 클릭은 상세페이지 이동(카드 전체 onClick)을 막기만 하고 실제 옵션 선택은
// 상세페이지에서 한다 — 목록에서는 "미리보기"만 제공.
function ProductCard({ p, wished, cartCount, onToggleWish, onClick }) {
  const [colorIdx, setColorIdx] = useState(0);
  const priceNum = Number(p.price.replace(/,/g, ""));
  const originalNum = p.originalPrice ? Number(p.originalPrice.replace(/,/g, "")) : 0;
  const hasDiscount = originalNum > priceNum;
  const discountPct = hasDiscount ? Math.round((1 - priceNum / originalNum) * 100) : 0;
  const displayImage = p.colors ? p.colors[colorIdx].image : p.image;
  const displayAlt = p.colors ? p.colors[colorIdx].alt : p.alt;
  const labelBadge = LABEL_BADGE[p.label];

  return (
    <article className="group cursor-pointer" onClick={onClick}>
      <div
        className="relative overflow-hidden bg-muted mb-3 aspect-5/6"
        onMouseLeave={() => setColorIdx(0)}
      >
        {/* 상품 목록은 비교 스캔이 목적이라 카드 크기를 통일한다.
            사진마다 비율이 달라 5:6 박스에 안 맞으면 object-cover로 채운다
            (세로로 긴 사진은 좌우가 살짝 잘릴 수 있음). */}
        <img src={displayImage} alt={displayAlt} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
        {/* 인테리어 컷이 있는 상품만 — 커서를 올리면 스튜디오 사진 위로 방에 놓인
            모습이 서서히 겹쳐지며 "- 인테리어" 버전으로 잠깐 전환된다. */}
        {p.interiorImage && (
          <>
            <img
              src={p.interiorImage}
              alt={`${p.alt} - 인테리어`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <span
              className="absolute bottom-3 left-3 rounded-full bg-foreground/70 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-background opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100"
              style={MONO}
            >
              – 인테리어
            </span>
          </>
        )}
        {p.colors && p.colors.length > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            {p.colors.map((c, i) => (
              <button
                key={c.value}
                type="button"
                onMouseEnter={() => setColorIdx(i)}
                onClick={(e) => e.stopPropagation()}
                title={c.label}
                aria-label={`${c.value} 색상 미리보기`}
                className={`w-4 h-4 rounded-full border bg-cover bg-center transition-transform ${i === colorIdx ? "border-background scale-125 shadow-sm" : "border-white/70"}`}
                style={{ backgroundImage: `url(${c.image})` }}
              />
            ))}
          </div>
        )}
        <button onClick={(e) => { e.stopPropagation(); onToggleWish(p.id); }}
          className="absolute top-3 right-3 w-7 h-7 bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Heart size={12} className={wished ? "fill-foreground text-foreground" : "text-foreground"} />
        </button>
        {cartCount > 0 && (
          <span
            className="cartCountBadge absolute top-3 left-3 min-w-[20px] h-[20px] px-1.5 rounded-full bg-foreground text-background text-[10px] font-semibold flex items-center gap-1 justify-center"
            style={MONO}
            data-tooltip={`현재 장바구니에 ${cartCount}개의 상품이 담겨 있습니다.`}
          >
            <ShoppingBag size={9} />
            {cartCount}
          </span>
        )}
      </div>
      {/* 상세페이지(HomeProductDetail.jsx)와 같은 뱃지 — 라벨(색상은 LABEL_BADGE)과
          무료배송을 알약 모양 태그로. p.no는 이 태그 줄 아래 상품명 위 자리를
          잃은 대신 별 의미 없는 진열 번호라 그냥 뺐다. */}
      <div className="flex items-center gap-1.5 mb-1.5">
        {p.label && (
          <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 border ${labelBadge?.className || "text-foreground border-border"}`} style={MONO}>
            {labelKo(p.label)}
          </span>
        )}
        <span className="text-[11px] font-medium text-muted-foreground rounded-full px-2 py-0.5 border border-border" style={MONO}>
          무료배송
        </span>
      </div>
      <h4 className="text-base font-semibold text-foreground mb-0.5" style={SANS}>{p.name}</h4>
      <div className="mt-1 flex flex-col items-end gap-1">
        <div className={`flex items-center gap-1.5 ${hasDiscount ? "" : "invisible"}`}>
          <span className="text-xs font-bold text-white bg-[#c0392b] rounded px-1.5 py-0.5 tracking-wide" style={MONO}>
            {discountPct}% OFF
          </span>
          <span className="text-sm text-muted-foreground line-through" style={MONO}>₩{p.originalPrice || p.price}</span>
        </div>
        <span className="text-right text-2xl font-bold text-foreground" style={MONO}>₩{p.price}</span>
      </div>
    </article>
  );
}

function Home() {
  const { wishlist: wishItems, toggleWish } = useWishlist();
  const wishlist = wishItems.map((item) => item.id);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [selectedTop, setSelectedTop] = useState("전체");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedMid, setSelectedMid] = useState("전체");
  const [lookbookPage, setLookbookPage] = useState(0);
  const [lookbookViewerIndex, setLookbookViewerIndex] = useState(null);
  const [cartCounts, setCartCounts] = useState({});

  // 상품 이름/가격/설명은 더 이상 프론트에만 하드코딩돼 있지 않고, 백엔드
  // JIPDAUM_PRODUCT(collection='main')에서 받아와 덮어쓴다. id로 매칭하고,
  // 이미지/인테리어 컷/뱃지(label)/할인 전 가격/서브컬러/스펙처럼 DB 스키마에
  // 아직 없는 필드는 계속 로컬 PRODUCTS 값을 쓴다 — Korean Hall의
  // ProductDetail.jsx가 apiProduct를 localProduct 위에 덮어쓰는 것과 같은 패턴.
  // API 호출이 실패하거나(오프라인, 백엔드 미기동) 아직 안 끝났을 때는 그냥
  // 기존 하드코딩 값이 그대로 보이므로 화면이 비어 보이는 일은 없다.
  const [apiProductsById, setApiProductsById] = useState({});
  useEffect(() => {
    getProductsByCollection("main")
      .then((res) => {
        if (!Array.isArray(res.data)) return;
        const byId = {};
        res.data.forEach((p) => { byId[p.id] = p; });
        setApiProductsById(byId);
      })
      .catch(() => {});
  }, []);

  const mergedProducts = PRODUCTS.map((p) => {
    const api = apiProductsById[p.id];
    if (!api) return p;
    return {
      ...p,
      name: api.name || p.name,
      desc: api.description || p.desc,
      price: typeof api.base_price === "number" ? api.base_price.toLocaleString() : p.price,
    };
  });

  // localStorage에 박제된 image URL은 빌드할 때마다 해시가 바뀌어 깨지기 쉽다(상품
  // 사진을 교체/재압축할 때마다 예전에 저장해둔 경로가 404남) — 그래서 저장된 스냅샷을
  // 그대로 쓰지 않고, 상품이 아직 PRODUCTS에 있으면 항상 최신 image/name/price로 덮어쓴다.
  // (상품이 삭제된 경우에만 마지막으로 저장된 스냅샷을 그대로 보여준다.)
  const withFreshProductData = (list) =>
    list.map((item) => {
      const live = PRODUCTS.find((p) => p.id === item.id);
      return live
        ? { ...item, image: live.image, name: live.name, price: Number(live.price.replace(/,/g, "")) }
        : item;
    });

  const [recentlyViewed, setRecentlyViewed] = useState(() => withFreshProductData(getRecentlyViewed()));
  const navigate = useNavigate();

  // "신상품 스타일링 팁" 자리를 대신하는 상품 리뷰 모음 — 사진 첨부된 리뷰만
  // 최신순으로 모아서 보여주는 공개 API(로그인 불필요, 룩북 갤러리 패널용으로
  // 이미 만들어져 있었지만 프론트에서 아직 안 쓰고 있던 엔드포인트).
  const [photoReviews, setPhotoReviews] = useState([]);
  useEffect(() => {
    getPhotoReviews()
      .then((res) => setPhotoReviews(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPhotoReviews([]));
  }, []);

  // 룩북 최신 게시물 미리보기 — 날짜 내림차순(POSTS 배열 자체의 삽입 순서에
  // 기대지 않고 직접 정렬). "YYYY.MM.DD" 형식이라 문자열 비교로 충분하다.
  const latestLookbookPosts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));

  // 카테고리 위 유틸 링크(로그인/회원가입 · 마이페이지/로그아웃)용 — Sidebar의 독과
  // 같은 기준(access_token)으로 로그인 상태를 판단하고, 같은 authchange 이벤트로 동기화한다.
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access_token"));
  const { openLogin, openRegister } = useAuthModal();
  const { openMyPage } = useMyPageModal();
  useEffect(() => {
    const sync = () => setIsLoggedIn(!!localStorage.getItem("access_token"));
    window.addEventListener("authchange", sync);
    return () => window.removeEventListener("authchange", sync);
  }, []);
  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh_token");
    try {
      if (refresh) await logoutUser({ refresh });
    } catch (err) {
      console.error("logout API failed:", err);
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("nickname");
    window.location.replace("/");
  };

  // 다른 탭/페이지에서 "최근 본 상품"이 바뀌면(상품 상세 진입, 삭제 등) 동기화한다.
  // 상품 그리드 패널까지 스크롤해야만 뜨게 해두면 인트로 영상 구간이 많아 체감상
  // 너무 늦게 보이므로, 홈 페이지 안에서는 위치 상관없이 바로 보이게 한다.
  useEffect(() => {
    const sync = () => setRecentlyViewed(withFreshProductData(getRecentlyViewed()));
    window.addEventListener("recentlyviewedchange", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("recentlyviewedchange", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Header.jsx(스크롤 시 나타나는 배너)의 검색창은 이 페이지 상태를 직접 들고
  // 있지 않다 — 대신 이 파일이 이미 쓰는 커스텀 이벤트 패턴(recentlyviewedchange/
  // cartchange/authchange와 동일)으로 신호만 보내면 여기서 받아 기존 검색
  // 필터 상태에 그대로 반영하고 상품 그리드로 스크롤한다.
  useEffect(() => {
    const onHeaderSearch = (e) => {
      setProductSearchQuery(e.detail?.query ?? "");
      scrollToProductGrid();
    };
    window.addEventListener("headerProductSearch", onHeaderSearch);
    return () => {
      window.removeEventListener("headerProductSearch", onHeaderSearch);
    };
  }, []);

  // 상품 카드 배지는 로그인 계정의 실제 백엔드 장바구니만 기준으로 한다.
  // (localStorage 기반 카운터는 계정과 무관하게 남아 실제로 담지 않아도 표시되는 버그가 있어 제거)
  const fetchCartCounts = () => {
    if (!localStorage.getItem("access_token")) {
      setCartCounts({});
      return;
    }
    getCartItems()
      .then((res) =>
        setCartCounts(
          res.data.reduce((acc, item) => {
            acc[item.product_id] = (acc[item.product_id] || 0) + (item.quantity || 1);
            return acc;
          }, {})
        )
      )
      .catch(() => setCartCounts({}));
  };

  useEffect(() => {
    fetchCartCounts();
    window.addEventListener("cartchange", fetchCartCounts);
    window.addEventListener("authchange", fetchCartCounts);
    return () => {
      window.removeEventListener("cartchange", fetchCartCounts);
      window.removeEventListener("authchange", fetchCartCounts);
    };
  }, []);
  // #home-products는 App.jsx의 가로 Lenis를 안 타는 패널이라(data-lenis-prevent)
  // 기본값이 네이티브 스크롤이다 — 나머지 사이트와 같은 부드러운 관성 스크롤을
  // 주기 위해 이 패널 하나에만 스코프된 두 번째 Lenis를 붙인다.
  const productGridRef = useRef(null);
  useNestedLenis(productGridRef);

  const scrollToProductGrid = () => {
    const target = document.querySelectorAll("[data-hsnap]")[0];
    if (!target) return;
    if (window.lenis) {
      window.lenis.resize();
      window.lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 3) });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 대카테고리를 고르면 그 안의 중카테고리만 보여준다 — "전체"면 전 카테고리를 합쳐서 보여준다.
  const categoryOptions =
    selectedTop === "전체"
      ? CATEGORY_TREE.flatMap((top) => top.children)
      : CATEGORY_TREE.find((top) => top.label === selectedTop)?.children ?? [];

  // 중카테고리를 고를 때만 그 안의 소카테고리 목록이 의미가 있다 — 전체 보기에선 탭 자체를 숨긴다.
  const midOptions =
    selectedCategory === "전체"
      ? []
      : [...new Set(PRODUCTS.filter((p) => p.category === selectedCategory).map((p) => p.midCategory))];

  // 실시간 인기 검색어는 이미 실제 상품명(또는 부제/라벨/브랜드) 속 문구로만 골라둔
  // 것들이라, 검색창에 채워 필터링만 하지 않고 그 상품 상세로 바로 넘어가게 한다.
  // 겹치는 상품이 여럿이면(예: "빨래 바구니") 첫 번째로 매칭되는 상품으로 이동.
  const handlePopularKeywordSelect = (keyword) => {
    const q = keyword.trim().toLowerCase();
    const match = mergedProducts.find(
      (p) => p.name.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q) || p.label.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );
    if (match) {
      navigate(`/item/${match.id}`);
    } else {
      setProductSearchQuery(keyword);
    }
  };

  const filteredProducts = (() => {
    const q = productSearchQuery.trim().toLowerCase();
    return mergedProducts.filter((p) => {
      const matchesTop = selectedTop === "전체" || CATEGORY_PARENT[p.category] === selectedTop;
      const matchesCategory = selectedCategory === "전체" || p.category === selectedCategory;
      const matchesMid = selectedMid === "전체" || p.midCategory === selectedMid;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sub.toLowerCase().includes(q) ||
        p.label.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      return matchesTop && matchesCategory && matchesMid && matchesQuery;
    });
  })();

  const lookbookPageCount = Math.ceil(LOOKBOOK_PHOTOS.length / LOOKBOOK_PAGE_SIZE);
  const lookbookPhotos = LOOKBOOK_PHOTOS.slice(
    lookbookPage * LOOKBOOK_PAGE_SIZE,
    lookbookPage * LOOKBOOK_PAGE_SIZE + LOOKBOOK_PAGE_SIZE
  );


  // 도어인트로를 지나 홈에 들어오면 상품 그리드(0번 패널)가 첫 화면이다. 예전엔
  // 앞에 에세이(인트로 영상) 패널이 있어 "목록으로" 복귀 시 그 패널을 건너뛰고
  // 상품 그리드로 바로 이동시키는 SKIP_HOME_DEFAULT_PANEL 플래그가 필요했지만,
  // 에세이 패널을 없애 상품 그리드 자체가 기본(0번) 패널이 된 지금은 항상 0번으로
  // 스크롤하면 그대로 원하는 위치라 그 플래그 자체가 불필요해졌다.
  useEffect(() => {
    const timer = setTimeout(() => {
      const target = document.querySelectorAll("[data-hsnap]")[0];
      if (!target) return;
      if (window.lenis) {
        window.lenis.resize();
        window.lenis.scrollTo(target, { immediate: true });
      } else {
        target.scrollIntoView();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home relative bg-background text-foreground flex flex-row" style={SANS}>

      {/* PRODUCT GRID */}
      <section
        id="home-products"
        ref={productGridRef}
        data-hsnap
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        className="metallicSilver w-screen h-screen shrink-0 overflow-y-auto overscroll-contain flex flex-col justify-start py-20 px-8"
      >
        {/* z-40 — 아래 상품 그리드 래퍼도 z-10이라, 같은 값이면 DOM 순서상 나중에 오는
            그리드가 인기 검색어 드롭다운을 덮어버린다(같은 값끼리는 각자 안의 z-index가
            아니라 그냥 뒤에 오는 요소가 이긴다). 확실히 더 높여서 덮이지 않게 함.
            Header.jsx의 헤더 트리거와 완전히 같은 패턴 — 그 자리에서 커지는 대신,
            "openHeaderSearchOverlay" 이벤트로 Header.jsx의 풀스크린 검색 모달
            (SearchOverlay)을 그대로 연다. 검색 UI를 두 벌 따로 만들지 않고 하나만
            공유한다(예전엔 여기만 인라인 확대+스크림 방식이 남아있어서, 누르면 화면
            전체가 어둡게 딤만 되고 정작 모달은 안 뜨는 것처럼 보였다). */}
        <div className="relative z-40 max-w-7xl mx-auto w-full mb-10 flex items-end justify-end gap-4 flex-wrap">
          <div className="relative w-full sm:w-70">
            <div className="flex items-center gap-2 border-b border-foreground pb-2">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event("openHeaderSearchOverlay"))}
                className="flex flex-1 min-w-0 items-center gap-2 text-left"
                aria-label="전체 상품 검색"
              >
                <Search size={15} className="text-muted-foreground shrink-0" />
                <span className="flex-1 min-w-0 truncate text-sm text-muted-foreground" style={SANS}>
                  {productSearchQuery || "상품명, 브랜드, 라벨 검색"}
                </span>
              </button>
              {productSearchQuery && (
                <button
                  type="button"
                  onClick={() => setProductSearchQuery("")}
                  aria-label="검색어 지우기"
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* 검색창 바로 아래 항상 붙어있는 인기 검색어 미니바(자동 롤링) */}
            <PopularKeywordsSidebar onSelect={handlePopularKeywordSelect} />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full mb-2">
          {/* 29CM류 유틸 링크 — 왼쪽 사이드 독(아이콘 전용)에 이미 있는 필수 기능을
              누구나 바로 알아볼 수 있게 텍스트로도 노출한다. 카테고리 라벨 바로 위.
              id="home-inline-nav-end" — Header.jsx가 이 요소(검색창+유틸 링크 묶음의
              마지막 줄)가 화면 밖으로 완전히 스크롤되는 시점을 기준으로 자기 배너의
              검색·유틸 링크를 띄운다. 고정 배너 쪽 threshold(예: "50px")를 여기 실제
              레이아웃 높이와 별개로 하드코딩하면, 이 안쪽 내용이 늘어나거나 줄어들
              때마다 둘 사이에 겹치는 구간(둘 다 동시에 보이는 것처럼 보이는 버그)이
              생긴다 — 이 요소를 직접 관측해 근본적으로 맞춘다. */}
          <div id="home-inline-nav-end" className="mb-3 flex items-center justify-end gap-3 text-xs text-muted-foreground" style={SANS}>
            {isLoggedIn ? (
              <>
                <button type="button" onClick={openMyPage} className="hover:text-foreground transition-colors">
                  마이페이지
                </button>
                <span aria-hidden="true" className="text-border">|</span>
                <button type="button" onClick={handleLogout} className="hover:text-foreground transition-colors">
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={openLogin} className="hover:text-foreground transition-colors">
                  로그인
                </button>
                <span aria-hidden="true" className="text-border">|</span>
                <button type="button" onClick={openRegister} className="hover:text-foreground transition-colors">
                  회원가입
                </button>
              </>
            )}
            <span aria-hidden="true" className="text-border">|</span>
            <button type="button" onClick={() => navigate("/cart")} className="hover:text-foreground transition-colors">
              장바구니{Object.values(cartCounts).reduce((sum, n) => sum + n, 0) > 0 &&
                ` (${Object.values(cartCounts).reduce((sum, n) => sum + n, 0)})`}
            </button>
            <span aria-hidden="true" className="text-border">|</span>
            <button type="button" onClick={() => navigate("/lookbook")} className="hover:text-foreground transition-colors">
              룩북
            </button>
            <span aria-hidden="true" className="text-border">|</span>
            <button type="button" onClick={() => navigate("/notice")} className="hover:text-foreground transition-colors">
              공지사항
            </button>
            <span aria-hidden="true" className="text-border">|</span>
            <button type="button" onClick={() => navigate("/customer-center")} className="hover:text-foreground transition-colors">
              고객센터
            </button>
          </div>

          <HomeHeroBanner />

          <HomeFeatureBanner products={PRODUCTS} />

          <div className="flex items-center gap-7 overflow-x-auto pb-1 border-b border-border">
            {[{ label: "전체" }, ...CATEGORY_TREE].map((top) => {
              const selected = selectedTop === top.label;
              return (
                <button
                  key={top.label}
                  type="button"
                  onClick={() => {
                    setSelectedTop(top.label);
                    setSelectedCategory("전체");
                    setSelectedMid("전체");
                  }}
                  className={`shrink-0 pb-3 text-base font-semibold tracking-tight border-b-2 -mb-px transition-colors duration-200 ${
                    selected
                      ? "text-foreground border-foreground"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                  style={SANS}
                >
                  {top.label}
                </button>
              );
            })}
          </div>

          {/* 중카테고리 탭 — 고른 대카테고리 안의 항목만(전체면 전 항목을 합쳐서) 보여준다 */}
          <div className="mt-4 flex items-center gap-1.5 flex-wrap">
            {[{ label: "전체" }, ...categoryOptions].map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.label);
                  setSelectedMid("전체");
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedCategory === cat.label
                    ? "bg-muted-foreground/20 text-foreground border-muted-foreground/40"
                    : "bg-transparent text-muted-foreground/70 border-border/60 hover:text-foreground"
                }`}
                style={SANS}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 소카테고리 탭 — 중카테고리를 하나 고르고, 그 안에 세부 유형이 둘 이상일 때만 뜬다 */}
        {midOptions.length > 1 && (
          <div className="relative z-10 max-w-7xl mx-auto w-full mb-8 flex items-center gap-1.5 flex-wrap">
            {["전체", ...midOptions].map((mid) => (
              <button
                key={mid}
                type="button"
                onClick={() => setSelectedMid(mid)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedMid === mid
                    ? "bg-muted-foreground/20 text-foreground border-muted-foreground/40"
                    : "bg-transparent text-muted-foreground/70 border-border/60 hover:text-foreground"
                }`}
                style={SANS}
              >
                {mid}
              </button>
            ))}
          </div>
        )}
        {midOptions.length <= 1 && <div className="mb-8" />}

        {filteredProducts.length === 0 ? (
          <p className="relative z-10 max-w-7xl mx-auto w-full text-center text-sm text-muted-foreground py-16" style={SANS}>
            {productSearchQuery
              ? `"${productSearchQuery}"에 대한 검색 결과가 없습니다.`
              : `${selectedCategory} 카테고리에 상품이 없습니다.`}
          </p>
        ) : (
        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-3 gap-8">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              p={p}
              wished={wishlist.includes(p.id)}
              cartCount={cartCounts[p.id] || 0}
              onToggleWish={toggleWish}
              onClick={() => navigate(`/item/${p.id}`)}
            />
          ))}
        </div>
        )}

        {/* 상품 리뷰 모음 — 사진 첨부 리뷰만 최신순으로, 좌우로 넘겨보는 가로 카드열.
            예전 "신상품 스타일링 팁" 자리를 대신한다(오늘의집 "추천 집들이" 레퍼런스). */}
        {photoReviews.length > 0 && (
          <div className="relative z-10 max-w-7xl mx-auto w-full mt-20">
            <span className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase" style={MONO}>REVIEW</span>
            <h2 className="text-2xl md:text-3xl font-light mt-2 mb-3" style={SERIF}>고객님들의 솔직한 후기</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md">
              실제로 담아보신 분들이 사진과 함께 남겨주신 이야기예요.
            </p>
            <Hairline className="mb-10" />
            <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2">
              {photoReviews.map((r) => {
                const product = PRODUCTS.find((p) => p.id === r.product);
                return (
                  <div
                    key={r.id}
                    className="shrink-0 w-56 snap-start cursor-pointer group"
                    onClick={() => product && navigate(`/item/${product.id}`)}
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-muted aspect-square mb-3">
                      <img src={r.review_image_url} alt="" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                    </div>
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={11} className={i < r.rating ? "fill-foreground text-foreground" : "text-border"} />
                      ))}
                    </div>
                    <p className="text-sm text-foreground/85 leading-snug line-clamp-2 mb-1">{r.comment}</p>
                    {product && <p className="text-xs text-muted-foreground truncate">{product.name}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 룩북 최신 게시물 미리보기 — 좌우로 넘겨보는 가로 카드열, 전체는 /lookbook에서. */}
        {latestLookbookPosts.length > 0 && (
          <div className="relative z-10 max-w-7xl mx-auto w-full mt-20">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase" style={MONO}>LOOKBOOK</span>
                <h2 className="text-2xl md:text-3xl font-light mt-2" style={SERIF}>새로 올라온 룩북</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate("/lookbook")}
                className="flex items-center gap-1 text-xs font-medium text-foreground hover:opacity-70 transition-opacity shrink-0"
                style={SANS}
              >
                더보기 <ChevronRight size={13} />
              </button>
            </div>
            <Hairline className="mb-10" />
            <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2">
              {latestLookbookPosts.map((post) => {
                const cover = resolveProductVariant(post.coverId, post.coverColor);
                return (
                  <div
                    key={post.id}
                    className="shrink-0 w-64 snap-start cursor-pointer group"
                    onClick={() => navigate(`/lookbook/${post.id}`)}
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-muted aspect-[4/3] mb-3">
                      <img
                        src={cover?.interiorImage || cover?.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground" style={MONO}>{post.date}</span>
                    <h3 className="text-sm font-medium text-foreground mt-1 leading-snug line-clamp-2 group-hover:opacity-70 transition-opacity" style={SERIF}>
                      {post.title}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <SiteFooter />
      </section>

      {/* LOOKBOOK */}
      {/* justify-center + overflow-y-auto 조합은 콘텐츠가 뷰포트보다 길어지면 위쪽이
          스크롤로 안 닿는 흔한 플렉스박스 버그가 있다(#home-products처럼 justify-start로
          맞춰야 포토리뷰 섹션이 추가된 지금 길이에서도 끝까지 스크롤된다).
          data-lenis-prevent + onWheel stopPropagation도 #home-products와 동일하게 —
          이게 없으면 Lenis가 휠 입력을 가로채 좌우 패널 전환으로 먼저 처리해버려서
          이 패널 안에서 위아래로 스크롤하려 해도 옆 패널로 슬라이드되곤 했다. */}
      <section
        data-hsnap
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        className="metallicSilver w-screen h-screen shrink-0 overflow-y-auto overscroll-contain flex flex-col justify-start"
      >
        <div className="max-w-7xl mx-auto px-8 py-20 w-full">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
            <div>
              <span className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase" style={MONO}>LOOKBOOK</span>
              <h2 className="text-2xl font-light mt-1" style={SERIF}>리빙 갤러리</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/lookbook")}
              className="flex items-center gap-1 text-xs font-medium text-foreground hover:opacity-70 transition-opacity"
              style={SANS}
            >
              상품으로 보는 룩북 <ChevronRight size={13} />
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
            {lookbookPhotos.map((src, i) => (
              <div
                key={src}
                className="group overflow-hidden bg-muted aspect-square cursor-pointer relative"
                onClick={() => setLookbookViewerIndex(lookbookPage * LOOKBOOK_PAGE_SIZE + i)}
              >
                <img src={src} alt={`리빙 갤러리 ${lookbookPage * LOOKBOOK_PAGE_SIZE + i + 1}`} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-600" />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/15 transition-colors duration-300" />
                <Camera className="absolute top-2 right-2 text-white drop-shadow" size={14} />
              </div>
            ))}
          </div>

          {lookbookPageCount > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                type="button"
                aria-label="이전 페이지"
                onClick={() => setLookbookPage((p) => Math.max(0, p - 1))}
                disabled={lookbookPage === 0}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: lookbookPageCount }, (_, i) => (
                <button 
                  key={i}
                  type="button"
                  aria-label={`${i + 1}페이지`}
                  onClick={() => setLookbookPage(i)}
                  className={`w-8 h-8 text-sm flex items-center justify-center transition-colors ${
                    i === lookbookPage
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={MONO}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                aria-label="다음 페이지"
                onClick={() => setLookbookPage((p) => Math.min(lookbookPageCount - 1, p + 1))}
                disabled={lookbookPage === lookbookPageCount - 1}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          <SiteFooter />
        </div>
      </section>

      {lookbookViewerIndex !== null && (
        <LookbookViewer
          photos={LOOKBOOK_PHOTOS}
          index={lookbookViewerIndex}
          onClose={() => setLookbookViewerIndex(null)}
          onNavigate={setLookbookViewerIndex}
        />
      )}

      {/* 상품이 없어도(첫 방문 등) 맨 아래에 옮겨 붙은 십자패드(맨 위로/맨 아래로/
          이전/다음 페이지)는 계속 떠야 하므로, 더는 items.length로 렌더 자체를
          막지 않는다 — 뭘 보여줄지는 RecentlyViewedSidebar 내부에서 판단한다. */}
      <RecentlyViewedSidebar
        items={recentlyViewed}
        onChange={() => setRecentlyViewed(getRecentlyViewed())}
      />

      <ChatBot />
    </div>
  );
}

export default Home;
