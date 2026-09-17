import logoImage from "../../assets/images/brand/logo.png";
import "./Logo.css";

function Logo({ boxed = true, showCaption = true, size = "md" }) {
  return (
    <span className={`logo logo--${size}${boxed ? " logo--boxed" : ""}`}>
      <span className="logo__icon">
        <img src={logoImage} alt="다시, 터움 로고" />
      </span>
      <span className="logo__text">
        <strong>다시, 터움</strong>
        {showCaption && <small>TEOUM</small>}
      </span>
    </span>
  );
}

export default Logo;
