import "./Badge.css";

function Badge({ children, variant = "dark", className = "" }) {
  return (
    <span className={["badge", `badge--${variant}`, className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}

export default Badge;
