import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { kakaoDirectionsUrl } from "../../utils/mapLinks.js";
import Badge from "../common/Badge.jsx";
import { fetchRelatedSpots } from "../../api/villageApi.js";
import "./LocationPopup.css";

const CONGESTION_BADGE_VARIANT = { low: "success", medium: "warning", high: "danger" };

function LocationPopup({ village, point, onClose }) {
  const { name, address, travel, highlight, event, congestion, description, isApiOnly } = village;
  // 관광 빅데이터(Tmap 이동 패턴) 기반 "함께 가는 곳". 실패하면 빈 배열이라 영역만 빠진다.
  // 어느 마을의 결과인지 함께 담아두고 렌더할 때 대조한다 — 마을을 바꾼 직후
  // 이전 마을의 목록이 잠깐 남는 것을 막으면서, 이펙트 안에서 상태를 비우지 않아도 된다.
  const [related, setRelated] = useState({ villageId: null, spots: [] });
  const relatedSpots = related.villageId === village.id ? related.spots : [];

  useEffect(() => {
    let alive = true;
    fetchRelatedSpots(village).then((spots) => {
      if (alive) setRelated({ villageId: village.id, spots });
    });
    return () => {
      alive = false;
    };
  }, [village]);

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

      {relatedSpots.length > 0 && (
        <div className="location-popup__related">
          <p className="location-popup__related-title">함께 가는 곳</p>
          <ul className="location-popup__related-list">
            {relatedSpots.map((spot) => (
              <li key={spot.name}>
                <span className="location-popup__related-name">{spot.name}</span>
                {spot.category && (
                  <span className="location-popup__related-category">{spot.category}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="location-popup__actions">
        {/* contentId가 있어야 상세를 열 수 있다(큐레이션 없이 API 항목만 남아 항상 있다). */}
        {village.tourApiContentId && (
          <Link to={`/experiences/${village.tourApiContentId}`} className="location-popup__cta">
            상세정보 보기
          </Link>
        )}
        <a
          href={kakaoDirectionsUrl(village)}
          target="_blank"
          rel="noreferrer"
          className="location-popup__cta location-popup__cta--outline"
        >
          길찾기
        </a>
      </div>
    </div>
  );
}

export default LocationPopup;
