import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 기본값(host: 'localhost')은 이 환경에서 IPv6([::1])에만 바인딩돼서
    // 127.0.0.1(IPv4) 기반 주소(예: hCaptcha 우회용 127.0.0.1.nip.io)로 접속이 안 된다.
    // 모든 인터페이스에 바인딩해 IPv4/IPv6 둘 다 받도록 한다.
    host: true,
    // Vite가 DNS 리바인딩 방지를 위해 Host 헤더를 검증하는데, 기본 허용 목록엔
    // localhost/127.0.0.1/[::1]만 있고 nip.io 도메인은 없어서 403이 난다.
    allowedHosts: ["127.0.0.1.nip.io", "13.209.254.219.nip.io"],
  },
})
