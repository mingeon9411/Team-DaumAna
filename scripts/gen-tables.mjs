import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('assets/tables');
mkdirSync(OUT_DIR, { recursive: true });

const THEMES = {
  light: {
    headerBg: '#f3e5d0',
    headerText: '#6b4423',
    headerBorder: '#d9c39e',
    rowA: '#fdfaf5',
    rowB: '#faf1e0',
    divider: '#ede1cd',
    border: '#e8dcc8',
    codeBg: '#ecdec4',
    codeText: '#6b4423',
    label: '#5a4530',
    value: '#4a3f33',
    badgeBg: 'rgba(255,255,255,0.55)',
  },
  dark: {
    headerBg: '#2b2116',
    headerText: '#f0cb8e',
    headerBorder: '#4a3a26',
    rowA: '#1c1712',
    rowB: '#221b14',
    divider: '#3a2f22',
    border: '#3a2f22',
    codeBg: '#33281c',
    codeText: '#f0cb8e',
    label: '#e2c9a0',
    value: '#cfc6ba',
    badgeBg: 'rgba(255,255,255,0.08)',
  },
};

function css(p) {
  return `
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: transparent; }
  .card {
    width: 860px;
    font-family: 'Segoe UI', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
    border: 1px solid ${p.border};
    border-radius: 10px;
    overflow: hidden;
    background: ${p.rowA};
  }
  .header {
    display: flex;
    align-items: center;
    gap: 10px;
    background: ${p.headerBg};
    color: ${p.headerText};
    padding: 14px 20px;
    font-size: 17px;
    font-weight: 700;
    border-bottom: 2px solid ${p.headerBorder};
  }
  .row {
    display: flex;
    align-items: center;
    padding: 13px 20px;
    border-bottom: 1px solid ${p.divider};
    font-size: 14.5px;
  }
  .row:last-child { border-bottom: none; }
  .row:nth-child(odd) { background: ${p.rowA}; }
  .row:nth-child(even) { background: ${p.rowB}; }
  .label {
    width: 190px;
    flex: 0 0 190px;
    font-weight: 700;
    color: ${p.label};
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .value {
    flex: 1;
    color: ${p.value};
    line-height: 1.55;
  }
  code {
    font-family: 'Cascadia Code', 'Consolas', monospace;
    background: ${p.codeBg};
    color: ${p.codeText};
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
  }
  .badge {
    font-family: 'Cascadia Code', 'Consolas', monospace;
    background: ${p.badgeBg};
    color: ${p.headerText};
    padding: 3px 9px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: 600;
  }
  i.tag { font-style: italic; opacity: 0.8; }
  .devcard {
    width: 460px;
    text-align: center;
    padding: 30px 24px;
  }
  .devcard-icon { font-size: 40px; line-height: 1; }
  .devcard-name {
    margin-top: 10px;
    font-size: 23px;
    font-weight: 800;
    color: ${p.headerText};
  }
  .devcard-role {
    display: inline-block;
    margin-top: 10px;
    font-family: 'Cascadia Code', 'Consolas', monospace;
    font-size: 13px;
    font-weight: 600;
    padding: 4px 14px;
    border-radius: 999px;
    background: ${p.headerBg};
    color: ${p.headerText};
    border: 1px solid ${p.headerBorder};
  }
  `;
}

function renderDeveloperCard({ icon, name, role }, palette) {
  return `<!doctype html><html><head><meta charset="utf-8"/><style>${css(palette)}</style></head>
  <body>
    <div class="card devcard">
      <div class="devcard-icon">${icon}</div>
      <div class="devcard-name">${name}</div>
      <div class="devcard-role">${role}</div>
    </div>
  </body></html>`;
}

function renderTable({ icon, title, badge, rows }, palette) {
  const rowsHtml = rows
    .map(
      (r) => `
      <div class="row">
        <div class="label">${r.icon}&nbsp;${r.label}</div>
        <div class="value">${r.value}</div>
      </div>`
    )
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"/><style>${css(palette)}</style></head>
  <body>
    <div class="card">
      <div class="header"><span>${icon}</span><span>${title}</span>${badge ? `<span class="badge">${badge}</span>` : ''}</div>
      ${rowsHtml}
    </div>
  </body></html>`;
}

const tables = [
  {
    file: 'react',
    icon: '⚛️',
    title: 'React',
    badge: 'Port 5173',
    rows: [
      { icon: '📄', label: '페이지 구성', value: '쇼룸 · 상품 목록/상세 · 장바구니 · 결제(Checkout) · 주문완료' },
      { icon: '🖼', label: '반응형 헤더', value: '홈 상단 흰색 로고(투명 배경) → 스크롤 후 영문 로고(불투명 배경) 자동 전환' },
      { icon: '🔄', label: '라우팅 · 통신', value: '<code>react-router-dom</code> SPA 라우팅, <code>axios</code> 인터셉터로 JWT 자동 첨부 및 만료 처리' },
      { icon: '🔐', label: '소셜 로그인 흐름', value: 'OAuth 콜백 → <code>sessionStorage</code> 임시 보관 → OTP 인증 완료 시 <code>localStorage</code> 이동' },
      { icon: '⚡', label: '상태 동기화', value: '<code>authchange</code> 커스텀 이벤트로 로그인 상태 즉시 Header 반영' },
    ],
  },
  {
    file: 'vite',
    icon: '⚡',
    title: 'Vite',
    badge: '빌드 · 개발 환경',
    rows: [
      { icon: '🔧', label: '빌드 도구', value: 'ESM 기반 번들링 · HMR(Hot Module Replacement)로 빠른 개발 환경' },
      { icon: '🛡', label: '환경 분기', value: '<code>import.meta.env.DEV</code> 로 hCaptcha 개발 환경 자동 비활성화' },
    ],
  },
  {
    file: 'django',
    icon: '🐍',
    title: 'Django REST Framework',
    badge: 'Port 8000',
    rows: [
      { icon: '🔑', label: 'JWT 인증', value: '액세스 2시간 / 리프레시 7일, 로테이션 + 블랙리스트 자동 처리' },
      { icon: '🌐', label: '소셜 로그인', value: '<code>django-allauth</code> v65 (카카오 · 네이버 · 구글) + 최초 로그인 시 이메일 OTP 2차 인증' },
      { icon: '🔌', label: '어댑터', value: '<code>CustomSocialAccountAdapter</code> : Oracle NULL 방어 (nickname · username · email 자동 생성) · <code>CustomAccountAdapter</code> : JWT를 URL 파라미터로 프론트 전달' },
      { icon: '📦', label: '데이터 API', value: '상품 · 카테고리 · 리뷰 · 장바구니 · 주문 <i class="tag">(Spring Boot와 병행 운영)</i>' },
      { icon: '🗄', label: '데이터베이스', value: 'Oracle DB (<code>oracledb</code> Thin Mode) · <code>test</code> 실행 시 SQLite 인메모리 자동 전환' },
      { icon: '📧', label: '이메일', value: '개발: 콘솔 출력 / 운영: Naver SMTP (<code>DEBUG</code> 플래그 기반 자동 분기)' },
    ],
  },
  {
    file: 'springboot',
    icon: '🌿',
    title: 'Spring Boot API',
    badge: 'Port 8081',
    rows: [
      { icon: '🛍', label: '상품', value: '검색 · 카테고리 필터 · 상품 상세 · 리뷰 조회·작성' },
      { icon: '🛒', label: '장바구니', value: '조회 · 추가 · 수정 · 삭제' },
      { icon: '📦', label: '주문 · 결제', value: '주문 생성 · 포트원(PortOne) V2 결제 준비/검증 · 결제 완료 · 취소 · 주문 내역' },
      { icon: '🎫', label: '쿠폰', value: '내 쿠폰 조회 · 쿠폰 검증' },
      { icon: '👤', label: '회원', value: '유저 목록 · 삭제 · 내 정보(<code>/me</code>)' },
      { icon: '🔗', label: '인증 연동', value: 'Django Cross-service JWT 공유 · JWT 리프레시 재발급 · 프론트 단일 토큰으로 양쪽 서버 동시 호출' },
    ],
  },
  {
    file: 'database',
    icon: '🗄',
    title: 'Database Migration',
    badge: '예정',
    rows: [
      { icon: '🐬', label: 'Django ↔ MySQL', value: '기존 Oracle DB에서 <code>MySQL</code>로 전환하여 Django 운영 DB로 연결 예정' },
      { icon: '🐘', label: 'Spring Boot ↔ PostgreSQL', value: 'Spring Boot API 운영 DB로 <code>PostgreSQL</code> 사용' },
      { icon: '🔀', label: '병행 운용', value: '서비스별 독립 DB 인스턴스로 <code>MySQL</code> · <code>PostgreSQL</code> 병행 사용' },
    ],
  },
];

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });

for (const t of tables) {
  for (const [themeName, palette] of Object.entries(THEMES)) {
    const html = renderTable(t, palette);
    await page.setContent(html, { waitUntil: 'networkidle' });
    const card = page.locator('.card');
    const box = await card.boundingBox();
    await page.setViewportSize({ width: Math.ceil(box.width), height: Math.ceil(box.height) });
    const filename = `${t.file}-${themeName}.png`;
    await card.screenshot({ path: path.join(OUT_DIR, filename) });
    console.log('wrote', filename, box.width, box.height);
  }
}

const developer = { icon: '🧑🏻‍💻', name: '강민건', role: 'Full-Stack Developer' };
for (const [themeName, palette] of Object.entries(THEMES)) {
  const html = renderDeveloperCard(developer, palette);
  await page.setContent(html, { waitUntil: 'networkidle' });
  const card = page.locator('.card');
  const box = await card.boundingBox();
  await page.setViewportSize({ width: Math.ceil(box.width), height: Math.ceil(box.height) });
  const filename = `developer-${themeName}.png`;
  await card.screenshot({ path: path.join(OUT_DIR, filename) });
  console.log('wrote', filename, box.width, box.height);
}

await browser.close();
