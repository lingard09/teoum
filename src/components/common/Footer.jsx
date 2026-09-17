import Logo from "./Logo.jsx";
import "./Footer.css";

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <Logo boxed={false} showCaption={false} />

        <p className="site-footer__desc">
          한국 고유의 정취가 깃든 전국 한옥마을의 전통 가옥, 골목길 문화 자원, 장인 체험을
          AI 기반으로 섬세하게 엮어 품격 있는 쉼과 여행을 선사합니다.
        </p>

        <span className="site-footer__badge">
          <CheckIcon />
          한국관광공사 TourAPI 공공데이터 연계 공식 서비스
        </span>

        <div className="site-footer__bottom">
          <span>© 2026 다시, 터움 (TEOUM). All rights reserved.</span>
          <span>본 서비스의 관광정보는 한국관광공사 TourAPI 데이터를 기반으로 합니다.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
