import { useEffect, useState } from "react";
import "./TrackingModal.css";
import { getOrderTracking } from "../../api";

function formatTime(isoStr) {
  if (!isoStr) return "";
  return new Date(isoStr).toLocaleString("ko-KR", {
    month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

function TrackingModal({ order, onClose }) {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!order) return;
    setLoading(true);
    setError("");
    getOrderTracking(order.id)
      .then((res) => {
        const data = res.data;
        if (data && typeof data === "object" && Array.isArray(data.steps)) {
          setTracking(data);
        } else {
          setError("배송 조회에 실패했습니다.");
        }
      })
      .catch((err) => setError(err.response?.data?.message || "배송 조회에 실패했습니다."))
      .finally(() => setLoading(false));
  }, [order]);

  if (!order) return null;

  return (
    <div className="trackingOverlay" onClick={onClose}>
      <div className="trackingModal" onClick={(e) => e.stopPropagation()}>
        <div className="trackingHeader">
          <p className="trackingSub">배송 조회</p>
          <h1 className="trackingOrderNo">주문번호 #{order.id}</h1>
        </div>

        {loading && <p className="trackingState">불러오는 중...</p>}
        {!loading && error && <p className="trackingState trackingError">{error}</p>}

        {!loading && !error && tracking && (
          <>
            <div className="trackingCarrierRow">
              <span>{tracking.carrier}</span>
              <span className="trackingNumber">{tracking.tracking_number}</span>
            </div>

            <div className="trackingSteps">
              {tracking.steps.map((step, i) => (
                <div className={"trackingStep" + (step.done ? " done" : "")} key={step.code}>
                  <div className="trackingStepDot">
                    {step.done && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="5 13 10 18 19 7" />
                      </svg>
                    )}
                  </div>
                  {i < tracking.steps.length - 1 && <div className={"trackingStepLine" + (tracking.steps[i + 1].done ? " done" : "")} />}
                  <div className="trackingStepBody">
                    <span className="trackingStepLabel">{step.label}</span>
                    {step.time && <span className="trackingStepTime">{formatTime(step.time)}</span>}
                  </div>
                </div>
              ))}
            </div>

            {tracking.is_mock && (
              <p className="trackingMockNotice">* 실제 택배사 연동 전 임시 배송 정보입니다.</p>
            )}
          </>
        )}

        <button className="trackingCloseBtn" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

export default TrackingModal;
