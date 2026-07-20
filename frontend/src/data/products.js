import table from "../assets/products/table.jpg";
import table2 from "../assets/products/table2.jpg";
import light from "../assets/products/light.png";
import light2 from "../assets/products/light2.png";
import bottle from "../assets/products/bottle.jpg";
import hover3 from "../assets/products/hover3.png";
import storageCabinet from "../assets/products/storage-cabinet.jpg";
import hanjiPendantLight from "../assets/products/한지 펜던트 조명.png";
import pyeongsangSofa from "../assets/products/평상 소파.png";
import seoanchungShelf from "../assets/products/Korean Traditional Shelf — Seoanchung.png";

export const products = [
  {
    id: 1,
    image: table,
    hoverImage: table2,
    name: "월넛 사이드 테이블",
    desc: "한국적인 곡선미를 담은 원목 테이블",
    price: 128000,
    review: 4.8,
  },
  {
    id: 2,
    image: light,
    hoverImage: light2,
    name: "한지 무드 조명",
    desc: "은은한 빛으로 공간을 채우는 조명",
    price: 89000,
    review: 4.9,
  },
  {
    id: 3,
    image: bottle,
    hoverImage: hover3,
    name: "무자기 꽃잎 화병 Petal vase",
    desc: "피우기 직전의 꽃봉오리를 닮은 화병",
    price: 64000,
    review: 4.7,
  },
  {
    id: 4,
    image: storageCabinet,
    name: "한국 모던 나비 문양 수납장",
    desc: "브라스 나비 손잡이가 포인트인 원목 수납장",
    price: 148000,
    review: 4.8,
  },
  {
    id: 7,
    image: hanjiPendantLight,
    name: "한지 펜던트 조명",
    desc: "한지가 은은하게 빛을 머금는 프레임형 펜던트 조명",
    price: 112000,
    review: 4.9,
  },
  {
    id: 9,
    image: pyeongsangSofa,
    name: "평상 소파",
    desc: "낮은 원목 프레임 위에 리넨 쿠션을 얹은 평상형 3인 소파",
    price: 418000,
    review: 4.8,
  },
  {
    id: 10,
    image: seoanchungShelf,
    name: "서안청 책장",
    desc: "청자 소품과 서책을 올려두기 좋은 원목 서안청 스타일 책장",
    price: 268000,
    review: 4.8,
  },
];

export default products;