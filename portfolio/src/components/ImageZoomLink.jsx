import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { clampZoom, fitZoom } from "../lib/imageZoom.js";

export default function ImageZoomLink({ href, children, ...props }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [size, setSize] = useState(null);
  const [error, setError] = useState(false);
  const dialog = useRef(null);
  const viewport = useRef(null);
  const drag = useRef(null);
  const trigger = useRef(null);
  const changeZoom = (value) => setZoom(clampZoom(value));
  const fit = (dimensions = size) => {
    if (!dimensions || !viewport.current) return;
    const { clientWidth, clientHeight } = viewport.current;
    changeZoom(fitZoom(dimensions, { width: clientWidth, height: clientHeight }));
  };

  useEffect(() => {
    if (!open) return;
    dialog.current.showModal();
    const opener = trigger.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      opener?.focus();
    };
  }, [open]);

  return (
    <>
      <a {...props} ref={trigger} href={href} aria-haspopup="dialog" onClick={(event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        setSize(null);
        setError(false);
        setZoom(100);
        setOpen(true);
      }}>{children}</a>
      {open && createPortal(
        <dialog ref={dialog} className="image-zoom-dialog" aria-label="이미지 확대 보기" onCancel={() => setOpen(false)} onClose={() => setOpen(false)}>
          <div className="image-zoom-toolbar">
            <strong>이미지 확대 보기</strong>
            <button type="button" disabled={!size} onClick={() => changeZoom(zoom - 10)} aria-label="10퍼센트 포인트 축소">−</button>
            <label className="image-zoom-percent">
              <span className="sr-only">확대 배율 퍼센트</span>
              <input type="number" min="1" max="400" value={zoom} disabled={!size} onChange={(event) => changeZoom(Number(event.target.value))} />%
            </label>
            <button type="button" disabled={!size} onClick={() => changeZoom(zoom + 10)} aria-label="10퍼센트 포인트 확대">+</button>
            <input aria-label="확대 배율 슬라이더" type="range" min="1" max="400" value={zoom} disabled={!size} onChange={(event) => changeZoom(Number(event.target.value))} />
            <button type="button" disabled={!size} onClick={() => fit()}>화면 맞춤</button>
            <button type="button" disabled={!size} onClick={() => changeZoom(100)}>원본 100%</button>
            <button type="button" onClick={() => setOpen(false)} autoFocus>닫기</button>
          </div>
          <p className="image-zoom-help">배율 1–400% · 마우스로 드래그하거나 스크롤하여 이동 · 모바일은 손가락으로 이동 · Esc로 닫기</p>
          <div ref={viewport} className="image-zoom-viewport" tabIndex={0} role="region" aria-label="확대 이미지 이동 영역" onPointerDown={(event) => {
            if (event.pointerType !== "mouse" || event.button !== 0) return;
            event.preventDefault();
            event.currentTarget.focus();
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop };
          }} onPointerMove={(event) => {
            if (!drag.current) return;
            event.currentTarget.scrollLeft = drag.current.left - event.clientX + drag.current.x;
            event.currentTarget.scrollTop = drag.current.top - event.clientY + drag.current.y;
          }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
            {error ? <p role="alert">이미지를 불러오지 못했습니다. 닫은 후 다시 열어주세요.</p> : (
              <div className="image-zoom-canvas">
                <img src={href} alt="확대된 다이어그램 또는 작업일지" draggable="false" style={{ width: size ? size.width * zoom / 100 : undefined, visibility: size ? "visible" : "hidden" }} onLoad={(event) => {
                  const dimensions = { width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight };
                  setSize(dimensions);
                  fit(dimensions);
                }} onError={() => setError(true)} />
              </div>
            )}
          </div>
        </dialog>, document.body,
      )}
    </>
  );
}
