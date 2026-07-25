import "./NewsTicker.css";

function NewsTicker() {
  const newsList = [
    "프로젝트 2차",
    "집다움 여름맞이 컬렉션 오픈",
    "우드 오브제 기획전 진행 중",
    "회원가입 시 첫 구매 15% 쿠폰 증정",
  ];

  return (
    <section className="newsTicker">
      <div className="newsLabel">NEWS</div>

      <div className="newsWindow">
        <div className="newsSlide">
          {newsList.map((news, index) => (
            <p key={index}>{news}</p>
          ))}
        </div>
      </div>

      <button className="newsMore">더보기</button>
    </section>
  );
}

export default NewsTicker; 