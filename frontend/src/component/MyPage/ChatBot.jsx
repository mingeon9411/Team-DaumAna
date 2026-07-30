import { useState, useRef, useEffect } from "react";
import "./ChatBot.css";
import { sendChatMessage } from "../../api";
import JDLogo from "../../assets/J.D 로고.svg";

const GREETING = {
  id: 0,
  role: "bot",
  text: "안녕하세요! 집다움 AI 어시스턴트입니다 😊\n궁금한 점을 편하게 물어보세요.",
  time: Date.now(),
};

const QUICK_REPLIES = ["배송 조회", "반품·교환 안내", "회원 등급 혜택", "매장 위치 안내"];

const formatTime = (ms) =>
  new Date(ms).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState(null);
  const [dragging, setDragging] = useState(false);
  const messagesRef = useRef(null);
  const dragData = useRef({ startX: 0, startY: 0, origX: 0, origY: 0, hasMoved: false });
  const dragSource = useRef("fab");

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
      if (dragSource.current === "fab" && !dragData.current.hasMoved) setOpen((v) => !v);
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

  const beginDrag = (e, source) => {
    e.preventDefault();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    dragSource.current = source;
    dragData.current = {
      startX: cx, startY: cy,
      origX: pos?.x ?? window.innerWidth - 100,
      origY: pos?.y ?? window.innerHeight * 0.48 - 32,
      hasMoved: false,
    };
    setDragging(true);
  };

  const handleFabDown = (e) => beginDrag(e, "fab");

  const handleHeaderDown = (e) => {
    if (e.target.closest(".chatBotClose")) return;
    beginDrag(e, "header");
  };

  const sendText = async (text) => {
    if (!text || loading) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text, time: Date.now() }]);
    setInput("");
    setLoading(true);
    try {
      const res = await sendChatMessage(text);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: res.data.reply, time: Date.now() }]);
    } catch {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "bot", text: "일시적인 오류가 발생했습니다.", time: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const send = () => sendText(input.trim());

  // 버튼이 화면 왼쪽/오른쪽 중 어느 쪽인지 → 패널 방향 결정
  const onRightHalf = !pos || pos.x > window.innerWidth / 2;

  const rootStyle = pos
    ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto", transform: "none" }
    : {};

  return (
    <div
      className={"chatBotRoot" + (onRightHalf ? "" : " chatBotRootLeft")}
      style={rootStyle}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* 채팅 패널 */}
      <div className={"chatBotPanel" + (open ? " chatBotPanelOpen" : "")}>
        <div className="chatBotHeader" onMouseDown={handleHeaderDown} onTouchStart={handleHeaderDown}>
          <div className="chatBotAvatar">
            <img src={JDLogo} alt="J.D" className="chatBotAvatarImg" />
          </div>
          <div style={{ flex: 1 }}>
            <p className="chatBotName">집다움 챗봇</p>
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
              <div className="chatMsgCol">
                <div className="chatBubble">
                  {msg.text.split("\n").map((line, i) => (
                    <span key={i}>{line}{i < msg.text.split("\n").length - 1 && <br />}</span>
                  ))}
                </div>
                {msg.time && <span className="chatMsgTime">{formatTime(msg.time)}</span>}
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
          {messages.length === 1 && !loading && (
            <div className="chatQuickReplies">
              {QUICK_REPLIES.map((q) => (
                <button key={q} className="chatQuickChip" onClick={() => sendText(q)}>{q}</button>
              ))}
            </div>
          )}
        </div>

        <div className="chatBotInput">
          <div className="chatBotInputBar">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="메시지를 입력하세요"
              disabled={loading}
            />
            <button className="chatBotSend" onClick={send} disabled={loading || !input.trim()} aria-label="전송">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="6 11 12 5 18 11" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 플로팅 버튼 */}
      <div className={"chatBotFabWrap" + (open ? " chatBotFabWrapHidden" : "")}>
        <button
          className={"chatBotFab" + (dragging ? " chatBotFabDragging" : "")}
          onMouseDown={handleFabDown}
          onTouchStart={handleFabDown}
          aria-label="AI 채팅 열기"
        >
          <svg className="chatBotFabIcon" viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id="chatBotFabGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#eef0f2" />
                <stop offset="1" stopColor="#8b9098" />
              </linearGradient>
            </defs>
            <path d="M4 5.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-4.4 3.3A.6.6 0 0 1 4.7 19.3V16.5H6a2 2 0 0 1-2-2z" fill="url(#chatBotFabGrad)" />
            <path d="M9 9.5h6M9 12.5h4" stroke="#2e2f31" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M18.5 3.2l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z" fill="#f4f5f6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ChatBot;
