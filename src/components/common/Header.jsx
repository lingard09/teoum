import { Link, NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";
import mascotImage from "../../assets/images/brand/mascot-gwangsuk.png";
import "./Header.css";

const NAV_ITEMS = [
  { label: "모아보기", to: "/" },
  { label: "체험하기", to: null },
  { label: "계획하기", to: null },
  { label: "머무르기", to: null },
  { label: "둘러보기", to: "/map" },
];

function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__logo" aria-label="다시, 터움 홈으로 이동">
          <Logo />
        </Link>

        <nav className="site-header__nav" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) =>
            item.to ? (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  isActive ? "site-header__nav-link is-active" : "site-header__nav-link"
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <span key={item.label} className="site-header__nav-link is-disabled" aria-disabled="true">
                {item.label}
              </span>
            )
          )}
        </nav>

        <div className="site-header__actions">
          <button type="button" className="site-header__pill">
            <span className="site-header__pill-icon" aria-hidden="true">
              文A
            </span>
            KR (한국어)
          </button>
          <Link to="/mypage" className="site-header__pill">
            <span className="site-header__pill-icon site-header__pill-icon--avatar">
              <img src={mascotImage} alt="" />
            </span>
            광숙이
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
