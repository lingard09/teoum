import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../common/Badge.jsx";
import { fetchRelatedSpots } from "../../api/villageApi.js";
import "./LocationPopup.css";

/**
 * 코스 검색에 쓸 지역어를 뽑는다. "안동 하회마을" 같은 이름에서 앞 단어만 쓰면
 * TourAPI 여행코스 제목과 더 잘 맞는다(코스 제목은 "안동 1박2일…" 형태가 많다).
 */
function searchTermFor(name) {
  return (name ?? "").split(/[\s·&]/)[0] || name;
}

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

      {/* 이 마을 이름으로 여행코스를 검색한 결과로 이동한다. */}
      <Link to={`/plan?q=${encodeURIComponent(searchTermFor(name))}`} className="location-popup__cta">
        <span aria-hidden="true">✦</span> 여정 생성
      </Link>
    </div>
  );
}

export default LocationPopup;
