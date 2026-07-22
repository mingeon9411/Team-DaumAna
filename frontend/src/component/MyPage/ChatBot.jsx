import { useState, useRef, useEffect } from "react";
import "./ChatBot.css";
import { sendChatMessage } from "../../api";
import JDLogo from "../../assets/J.D 로고.svg";

const GREETING = {
  id: 0,
  role: "bot",
  text: "안녕하세요! 집다움 AI 어시스턴트입니다 😊\n궁금한 점을 편하게 물어보세요.",
};

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState(null);
  const [dragging, setDragging] = useState(false);
  const messagesRef = useRef(null);
  const dragData = useRef({ startX: 0, startY: 0, origX: 0, origY: 0, hasMoved: false });

  // 초기 위치: 오른쪽 6%, 수직 중앙
  useEffect(() => {
    setPos({
      x: window.innerWidth - Math.floor(window.innerWidth * 0.06) - 64,
      y: Math.floor(window.innerHeight * 0.48) - 32,
    });
  }, []);

  // 스크롤 자동
  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  // 드래그 이벤트
  useEffect(() => {
    if (!dragging) return;

    const onMove = (e) => {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = cx - dragData.current.startX;
      const dy = cy - dragData.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragData.current.hasMoved = true;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 68, dragData.current.origX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 68, dragData.current.origY + dy)),
      });
    };

    const onUp = () => {
      if (!dragData.current.hasMoved) setOpen((v) => !v);
      setDragging(false);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    };
  }, [dragging]);

  const handleFabDown = (e) => {
    e.preventDefault();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    dragData.current = {
      startX: cx, startY: cy,
      origX: pos?.x ?? window.innerWidth - 100,
      origY: pos?.y ?? window.innerHeight * 0.48 - 32,
      hasMoved: false,
    };
    setDragging(true);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await sendChatMessage(text);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: res.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: "일시적인 오류가 발생했습니다." }]);
    } finally {
      setLoading(false);
    }
  };

  // 버튼이 화면 왼쪽/오른쪽 중 어느 쪽인지 → 패널 방향 결정
  const onRightHalf = !pos || pos.x > window.innerWidth / 2;

  const rootStyle = pos
    ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto", transform: "none" }
    : {};

  return (
    <div
      className={"chatBotRoot" + (onRightHalf ? "" : " chatBotRootLeft")}
      style={rootStyle}
    >
      {/* 채팅 패널 */}
      <div className={"chatBotPanel" + (open ? " chatBotPanelOpen" : "")}>
        <div className="chatBotHeader">
          <div className="chatBotAvatar">
            <img src={JDLogo} alt="J.D" className="chatBotAvatarImg" />
          </div>
          <div style={{ flex: 1 }}>
            <p className="chatBotName">집다움 도우미</p>
            <p className="chatBotStatus">온라인</p>
          </div>
          <button className="chatBotClose" onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="chatBotMessages" ref={messagesRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={"chatMsg " + msg.role}>
              {msg.role === "bot" && (
                <span className="chatMsgAvatar">
                  <img src={JDLogo} alt="J.D" className="chatMsgAvatarImg" />
                </span>
              )}
              <div className="chatBubble">
                {msg.text.split("\n").map((line, i) => (
                  <span key={i}>{line}{i < msg.text.split("\n").length - 1 && <br />}</span>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chatMsg bot">
              <span className="chatMsgAvatar">
                <img src={JDLogo} alt="J.D" className="chatMsgAvatarImg" />
              </span>
              <div className="chatBubble chatTyping"><span /><span /><span /></div>
            </div>
          )}
        </div>

        <div className="chatBotInput">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="메시지를 입력하세요"
            disabled={loading}
          />
          <button onClick={send} disabled={loading || !input.trim()}>전송</button>
        </div>
      </div>

      {/* 플로팅 버튼 */}
      <button
        className={"chatBotFab" + (open ? " chatBotFabOpen" : "") + (dragging ? " chatBotFabDragging" : "")}
        onMouseDown={handleFabDown}
        onTouchStart={handleFabDown}
        aria-label="AI 채팅"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
            <line x1="24" y1="5" x2="24" y2="11" stroke="#f5ede0" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="24" cy="4" r="2.5" fill="#c47a3a"/>
            <rect x="9" y="11" width="30" height="26" rx="6" fill="#f5ede0" opacity="0.95"/>
            <rect x="5" y="18" width="4" height="8" rx="2" fill="#f5ede0" opacity="0.8"/>
            <rect x="39" y="18" width="4" height="8" rx="2" fill="#f5ede0" opacity="0.8"/>
            <circle cx="18" cy="22" r="4" fill="#2e1f10"/>
            <circle cx="18" cy="22" r="2.2" fill="#913a22"/>
            <circle cx="19.2" cy="20.8" r="0.9" fill="#fff"/>
            <circle cx="30" cy="22" r="4" fill="#2e1f10"/>
            <circle cx="30" cy="22" r="2.2" fill="#913a22"/>
            <circle cx="31.2" cy="20.8" r="0.9" fill="#fff"/>
            <rect x="15" y="30" width="18" height="4" rx="2" fill="#2e1f10" opacity="0.2"/>
            <rect x="15" y="30" width="3.5" height="4" rx="1.5" fill="#2e1f10" opacity="0.5"/>
            <rect x="20.25" y="30" width="3.5" height="4" rx="1.5" fill="#2e1f10" opacity="0.5"/>
            <rect x="25.5" y="30" width="3.5" height="4" rx="1.5" fill="#2e1f10" opacity="0.5"/>
            <rect x="29.5" y="30" width="3.5" height="4" rx="1.5" fill="#2e1f10" opacity="0.5"/>
          </svg>
        )}
      </button>
    </div>
  );
}

export default ChatBot;
