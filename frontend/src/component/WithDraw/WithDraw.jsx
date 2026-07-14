import "./Withdraw.css";

function Withdraw() {
  return (
    <main className="withdrawPage" data-hsnap>
      <section className="withdrawBox">
        <h1>회원 탈퇴</h1>
        <p>
          탈퇴 시 회원 정보와 주문 내역이 삭제되며,
          복구할 수 없습니다.
        </p>

        <div className="noticeBox">
          <strong>탈퇴 전 확인해주세요.</strong>
          <ul>
            <li>보유 쿠폰 및 적립금은 모두 소멸됩니다.</li>
            <li>진행 중인 주문이 있다면 탈퇴가 제한될 수 있습니다.</li>
            <li>탈퇴 후 동일 계정으로 재가입이 어려울 수 있습니다.</li>
          </ul>
        </div>

        <div className="withdrawField">
         <h2 className="withdrawTitle">
          집다움을 떠나시는 이유를 알려주세요.
         </h2>

         <p className="withdrawDesc">
          (더 나은 경험을 만들기 위한 소중한 의견으로 활용하겠습니다.)
          </p>

  <select className="reasonSelect">
    <option value="">탈퇴 사유를 선택해주세요.</option>
    <option value="product">원하는 상품이나 콘텐츠가 부족해요</option>
    <option value="benefit">가격이나 혜택이 아쉬워요</option>
    <option value="service">사이트 이용이 불편해요</option>
    <option value="otherService">다른 서비스를 주로 이용해요</option>
    <option value="privacy">개인정보 및 보안이 걱정돼요</option>
    <option value="etc">기타</option>
  </select>
</div>
<label className="checkArea">
          <input type="checkbox" />
          위 안내사항을 모두 확인했으며 회원탈퇴에 동의합니다.
        </label>


        <div className="withdrawBtns">
          <button className="cancelBtn">취소</button>
          <button className="deleteBtn">탈퇴하기</button>
        </div>
      </section>
    </main>
  );
}

export default Withdraw;