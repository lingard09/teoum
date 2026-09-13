function Icon({ src, width, height = width, className }) {
  return (
    <img
      src={src}
      width={width}
      height={height}
      style={{ width, height, flexShrink: 0 }}
      className={className}
      alt=""
      aria-hidden="true"
    />
  )
}

export default Icon
