import CongestionBar from "./CongestionBar.jsx";
import "./TourismListItem.css";

const TAG_ICONS = {
  walk: "🚶",
  home: "🏠",
  food: "🍽️",
  camera: "📷",
};

function TourismListItem({ village, isActive, onSelect }) {
  const { name, mapImage, rating, reviewCount, tag, tagIcon, congestion, address } = village;

  return (
    <li className={isActive ? "list-item is-active" : "list-item"}>
      <button
        type="button"
        className="list-item__main"
        onClick={onSelect}
        aria-pressed={isActive}
      >
        <div className="list-item__media">
          <img src={mapImage} alt={`${name} 이미지`} loading="lazy" />
        </div>
        <div className="list-item__body">
          <div className="list-item__head">
            <h4 className="list-item__title">{name}</h4>
            {rating != null && (
              <span className="list-item__rating">
                ★ {rating.toFixed(2)} {reviewCount && `(${reviewCount})`}
              </span>
            )}
          </div>
          <p className="list-item__address">{address}</p>
          {tag && (
            <span className="list-item__tag">
              {TAG_ICONS[tagIcon]} {tag}
            </span>
          )}
          {congestion && <CongestionBar congestion={congestion} />}
        </div>
      </button>
      <div className="list-item__actions">
        <button type="button" className="list-item__action-btn list-item__action-btn--outline">
          문의하기
        </button>
        <button type="button" className="list-item__action-btn list-item__action-btn--solid" onClick={onSelect}>
          길찾기
        </button>
      </div>
    </li>
  );
}

export default TourismListItem;
