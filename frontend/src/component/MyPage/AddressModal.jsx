import "./AddressModal.css";
import { useEffect, useState } from "react";

const EMPTY_FORM = { label: "집", recipient: "", phone: "", address: "", detail: "", isDefault: false };

function AddressModal({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    setForm(initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.recipient.trim() || !form.phone.trim() || !form.address.trim()) {
      alert("받는 분, 연락처, 주소는 필수로 입력해주세요.");
      return;
    }
    onSave(form);
  };

  return (
    <div className="addressModalOverlay" onClick={onClose}>
      <div className="addressModalInner" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="addressModalClose" onClick={onClose} aria-label="닫기">×</button>

        <h1>{initialData ? "배송지 수정" : "새 배송지 추가"}</h1>
        <span className="addressModalHairline" />

        <div className="addressFormRow">
          <label>배송지 별칭</label>
          <select name="label" value={form.label} onChange={handleChange}>
            <option value="집">집</option>
            <option value="회사">회사</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div className="addressFormRow">
          <label>받는 분</label>
          <input name="recipient" value={form.recipient} onChange={handleChange} placeholder="홍길동" />
        </div>

        <div className="addressFormRow">
          <label>연락처</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="010-1234-5678" />
        </div>

        <div className="addressFormRow">
          <label>주소</label>
          <input name="address" value={form.address} onChange={handleChange} placeholder="서울시 강남구 테헤란로 123" />
        </div>

        <div className="addressFormRow">
          <label>상세 주소</label>
          <input name="detail" value={form.detail} onChange={handleChange} placeholder="101동 202호" />
        </div>

        <label className="addressDefaultCheck">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
          />
          기본 배송지로 설정
        </label>

        <div className="addressModalBtns">
          <button type="button" className="addressCancelBtn" onClick={onClose}>취소</button>
          <button type="button" className="addressSaveBtn" onClick={handleSubmit}>저장</button>
        </div>
      </div>
    </div>
  );
}

export default AddressModal;
