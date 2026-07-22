import axios from 'axios';

const SPRING_URL = 'http://localhost:8081';  // 메인 백엔드 (Spring Boot)
const DJANGO_URL = 'http://localhost:8000';  // 결제 전담 (Django)

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
    sessionStorage.setItem('open_login_modal', '1');
    window.location.href = '/';
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
    sessionStorage.setItem('open_login_modal', '1');
    window.location.href = '/';
    return Promise.reject(error);
  } finally {
    isRefreshing = false;
  }
};

API.interceptors.response.use((res) => res, handle401);
PAYMENT_API.interceptors.response.use((res) => res, handle401);

// [장바구니 API]
export const getCartItems = () => API.get('/cart');
export const addToCart = (data) => API.post('/cart', data);
export const updateCartItem = (data) => API.put('/cart', data);
export const deleteCartItem = (itemId) => API.delete('/cart', { data: { item_id: itemId } });

// [상품 API]
export const searchProducts = (query) => API.get(`/products?search=${encodeURIComponent(query)}`);
export const getProductDetail = (id) => API.get(`/products/${id}`);

// [리뷰 API]
export const getReviews = (productId) => API.get(`/products/${productId}/reviews`);
export const createReview = (productId, data) => API.post(`/products/${productId}/reviews`, data);

// [주문 API]
export const createOrder = (data) => API.post('/orders/create', data);
export const cancelOrder = (orderId) => API.post(`/orders/${orderId}/cancel`);
export const getOrderHistory = () => API.get('/orders/history');

// [결제 API] → Spring Boot (8081) - Django JWT 인증 이슈 우회
export const readyPayment = (data) => API.post('/orders/payment-ready', data);
export const verifyPayment = (data) => API.post('/orders/payment-verify', data);

// [쿠폰 API]
export const getMyCoupons = () => API.get('/coupons/my');
export const validateCoupon = (code, order_amount) =>
  API.post('/coupons/validate', { code, order_amount });

// [챗봇 API]
export const sendChatMessage = (message) => API.post('/chat', { message });

// [소셜 로그인 code 교환 → Spring Boot /api/auth]
export const socialExchange = (code) =>
  axios.post(`${SPRING_URL}/api/auth/social-exchange`, { code });

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
