import Badge from "../common/Badge.jsx";
import "./LocationPopup.css";

const CONGESTION_BADGE_VARIANT = { low: "success", medium: "warning", high: "danger" };

function LocationPopup({ village, point, onClose }) {
  const { name, address, travel, highlight, event, congestion, description, isApiOnly } = village;

  return (
    <div
      className="location-popup"
      style={{ left: `${point.x}px`, top: `${point.y}px` }}
    >
      <button type="button" className="location-popup__close" onClick={onClose} aria-label="닫기">
        ×
      </button>
      {congestion && (
        <Badge variant={CONGESTION_BADGE_VARIANT[congestion.level]}>
          실시간 혼잡 {congestion.label}
        </Badge>
      )}
      <h3 className="location-popup__title">{name}</h3>
      <p className="location-popup__address">{address}</p>

      {isApiOnly && description && <p className="location-popup__desc">{description}</p>}

      {(travel || highlight || event) && (
        <ul className="location-popup__info">
          {travel && (
            <>
              <li>
                <span aria-hidden="true">🚌</span> {travel.from}
              </li>
              <li>
                <span aria-hidden="true">🕐</span> {travel.duration}
              </li>
            </>
          )}
          {highlight && (
            <li>
              <span aria-hidden="true">⛩️</span> {highlight}
            </li>
          )}
          {event && (
            <li>
              <span aria-hidden="true">📅</span> {event}
            </li>
          )}
        </ul>
      )}

      <button type="button" className="location-popup__cta">
        <span aria-hidden="true">✦</span> 여정 생성
      </button>
    </div>
  );
}

export default LocationPopup;
