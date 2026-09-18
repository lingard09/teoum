import "./Button.css";

function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  as: Component = "button",
  className = "",
  ...rest
}) {
  const classes = ["btn", `btn--${variant}`, `btn--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...rest}>
      {icon && <span className="btn__icon">{icon}</span>}
      {children}
    </Component>
  );
}

export default Button;
