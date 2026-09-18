import "./MapPin.css";

function MapPin({ village, point, isActive, onSelect }) {
  return (
    <button
      type="button"
      className={isActive ? "map-pin is-active" : "map-pin"}
      style={{ left: `${point.x}px`, top: `${point.y}px` }}
      onClick={onSelect}
      aria-label={`${village.name} 위치 보기`}
      aria-pressed={isActive}
    >
      <span className="map-pin__dot">
        <svg width="20" height="24" viewBox="0 0 20 24" fill="none" aria-hidden="true">
          <path
            d="M10 0C4.48 0 0 4.48 0 10c0 7.5 10 14 10 14s10-6.5 10-14c0-5.52-4.48-10-10-10Z"
            fill="currentColor"
          />
          <circle cx="10" cy="10" r="4" fill="var(--color-bg-cream-soft)" />
        </svg>
      </span>
      <span className="map-pin__label">{village.name.replace(/ 한옥마을| & .+/g, "")}</span>
    </button>
  );
}

export default MapPin;
