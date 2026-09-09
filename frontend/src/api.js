import axios from 'axios';

const SPRING_URL = import.meta.env.VITE_SPRING_API_URL || 'http://localhost:8081';  // 메인 백엔드 (Spring Boot)
const DJANGO_URL = 'http://localhost:8000';  // 결제 전담 (Django) — 이번엔 미배포, 로컬 고정

// 장바구니/상품 등 shop API → Spring Boot
const API = axios.create({
  baseURL: `${SPRING_URL}/api/shop`,
  headers: { 'Content-Type': 'application/json' },
});

// 인증 API → Spring Boot
const AUTH_API = axios.create({
  baseURL: `${SPRING_URL}/api/users`,
  headers: { 'Content-Type': 'application/json' },
});

// 결제 API → Django
const PAYMENT_API = axios.create({
  baseURL: `${DJANGO_URL}/api/shop`,
  headers: { 'Content-Type': 'application/json' },
});

// JWT 토큰 자동 첨부 인터셉터 (인증 완료 전은 sessionStorage의 임시 토큰 사용)
const attachToken = (config) => {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('pending_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

API.interceptors.request.use(attachToken);
AUTH_API.interceptors.request.use(attachToken);
PAYMENT_API.interceptors.request.use(attachToken);

// 401 응답 시 refresh token으로 자동 갱신, 실패하면 로그인 페이지로 이동
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

const handle401 = async (error) => {
  const originalRequest = error.config;
  if (error.response?.status !== 401 || originalRequest._retry) {
    return Promise.reject(error);
  }
  originalRequest._retry = true;

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return axios(originalRequest);
    });
  }

  isRefreshing = true;
  const refreshToken = localStorage.getItem('refresh_token');

  if (!refreshToken) {
    isRefreshing = false;
    localStorage.removeItem('access_token');
    // 로그인이 독립 페이지(/login)로 바뀌기 전엔 "/"로 보낸 뒤 sessionStorage
    // 플래그로 모달을 다시 띄웠다 — 이제 /login이 실제 라우트라 곧장 보내면 된다.
    window.location.href = '/login';
    return Promise.reject(error);
  }

  try {
    const res = await axios.post(`${SPRING_URL}/api/auth/refresh`, { refresh: refreshToken });
    const newAccess = res.data.access;
    const newRefresh = res.data.refresh;
    localStorage.setItem('access_token', newAccess);
    if (newRefresh) localStorage.setItem('refresh_token', newRefresh);
    processQueue(null, newAccess);
    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
    return axios(originalRequest);
  } catch {
    processQueue(error, null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('nickname');
    window.location.href = '/login';
    return Promise.reject(error);
  } finally {
    isRefreshing = false;
  }
};

API.interceptors.response.use((res) => res, handle401);
PAYMENT_API.interceptors.response.use((res) => res, handle401);

// [장바구니 API]
export const fetchWishlist = () => API.get('/wishlist');
export const addWishlistItem = (id) => API.put(`/wishlist/${id}`);
export const deleteWishlistItem = (id) => API.delete(`/wishlist/${id}`);

export const getCartItems = () => API.get('/cart');
export const addToCart = (data) => API.post('/cart', data);
export const updateCartItem = (data) => API.put('/cart', data);
export const deleteCartItem = (itemId) => API.delete('/cart', { data: { item_id: itemId } });

// [상품 API]
export const searchProducts = (query) => API.get(`/products?search=${encodeURIComponent(query)}`);
export const getProductDetail = (id) => API.get(`/products/${id}`);
// collection: "main"(메인 페이지 PRODUCTS). 이름/가격/설명/썸네일을 DB에서 받아와
// 프론트 로컬 데이터(이미지 import, 인테리어 컷, 뱃지 등)에 덮어씌우는 용도.
export const getProductsByCollection = (collection) => API.get(`/products?collection=${encodeURIComponent(collection)}`);

export const getRecentlyViewedProducts = () => API.get('/recently-viewed');
export const addRecentlyViewedProduct = (productId) => API.put(`/recently-viewed/${productId}`);
export const mergeRecentlyViewedProducts = (productIds) => API.put('/recently-viewed', { product_ids: productIds });
export const deleteRecentlyViewedProduct = (productId) => API.delete(`/recently-viewed/${productId}`);
export const clearRecentlyViewedProducts = () => API.delete('/recently-viewed');

// [리뷰 API]
export const getReviews = (productId) => API.get(`/products/${productId}/reviews`);
export const createReview = (productId, data) => API.post(`/products/${productId}/reviews`, data);

// 룩북 아래 리뷰 모음용 — 모든 상품의 리뷰를 최신순으로 조회한다.
export const getRecentReviews = () => API.get('/products/reviews/recent');

// 리뷰 사진 업로드 — 응답으로 받은 url을 createReview의 review_image_url에 담아 넘긴다.
export const uploadReviewImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/uploads/review-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// [주문 API]
export const createOrder = (data) => API.post('/orders/create', data);
export const cancelOrder = (orderId) => API.post(`/orders/${orderId}/cancel`);
export const getOrderHistory = () => API.get('/orders/history');
export const getOrderTracking = (orderId) => API.get(`/orders/${orderId}/tracking`);

// [결제 API] → Spring Boot (8081) - Django JWT 인증 이슈 우회
export const readyPayment = (data) => API.post('/orders/payment-ready', data);
export const verifyPayment = (data) => API.post('/orders/payment-verify', data);

// [쿠폰 API]
export const getMyCoupons = () => API.get('/coupons/my');
export const validateCoupon = (code, order_amount) =>
  API.post('/coupons/validate', { code, order_amount });

// [1:1 문의 API]
export const getMyInquiries = () => API.get('/inquiries');
export const createInquiry = (title, content) =>
  API.post('/inquiries', { title, content });

// [챗봇 API] history는 멀티턴 문맥 유지를 위해 함께 보낸다 (캡차 게이트는 없음 — ChatController 참고).
export const sendChatMessage = (message, history) =>
  API.post('/chat', { message, history });

// [소셜 로그인 code 교환 → Spring Boot /api/auth]
export const socialExchange = (code) =>
  axios.post(`${SPRING_URL}/api/auth/social-exchange`, { code });

// [소셜 로그인 hCaptcha 게이트] 캡차 토큰을 검증받고 1회용 ticket을 발급받는다.
// 이 ticket을 /oauth2/authorization/{provider}?ticket=... 에 붙여야 SocialLoginCaptchaFilter를 통과한다.
export const requestSocialCaptchaTicket = (recaptchaToken) =>
  axios.post(`${SPRING_URL}/api/auth/social-captcha`, { recaptcha_token: recaptchaToken });

// [인증 API]
export const loginUser = (data) => AUTH_API.post('/login', data);
export const logoutUser = (data) => AUTH_API.post('/logout', data);
export const withdrawUser = (data) => AUTH_API.post('/withdraw', data);
export const registerUser = (data) => AUTH_API.post('/register', data);
export const checkNicknameAPI = (nickname) =>
  AUTH_API.get(`/nickname-check?nickname=${encodeURIComponent(nickname)}`);
export const getMe = () => AUTH_API.get('/me');
export const sendEmailOTP = (email) => AUTH_API.post('/email-verify/send', { email });
export const verifyEmailOTP = (email, code) => AUTH_API.post('/email-verify/confirm', { email, code });

// [아이디/비밀번호 찾기]
export const getSecurityQuestion = (email) =>
  AUTH_API.get(`/security-question?email=${encodeURIComponent(email)}`);
export const sendFindIdCode = (email) => AUTH_API.post('/find-id/send-code', { email });
export const verifyFindId = (email, code, securityAnswer) =>
  AUTH_API.post('/find-id/verify', { email, code, security_answer: securityAnswer });
export const verifyFindPasswordIdentity = (nickname, email, securityAnswer) =>
  AUTH_API.post('/find-password/verify', { nickname, email, security_answer: securityAnswer });
export const verifyIdentityVerification = (identityVerificationId) =>
  AUTH_API.post('/identity-verification/verify', {
    identity_verification_id: identityVerificationId,
  });
export const resetPassword = (resetToken, newPassword) =>
  AUTH_API.post('/find-password/reset', { reset_token: resetToken, new_password: newPassword });
export const updateSecurityQa = (securityQuestion, securityAnswer) =>
  AUTH_API.patch('/security-qa', { security_question: securityQuestion, security_answer: securityAnswer });
