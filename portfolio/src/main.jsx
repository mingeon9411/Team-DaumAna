import { Buffer } from 'buffer'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// gray-matter(케이스 스터디 frontmatter 파싱)가 내부적으로 Node 전용 Buffer를 참조한다.
// 브라우저엔 없는 전역이라 폴리필을 가장 먼저 등록해준다.
window.Buffer = Buffer

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
