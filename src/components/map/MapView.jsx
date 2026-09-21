import { useCallback, useEffect, useRef, useState } from "react";
import MapPin from "./MapPin.jsx";
import LocationPopup from "./LocationPopup.jsx";
import { hasNaverMapKey, loadNaverMaps } from "../../api/naverMapLoader.js";
import "./MapView.css";

// 지도에 좌표가 없는 경우를 대비한 기본 중심(대한민국 중앙 부근)
const DEFAULT_CENTER = { lat: 36.3, lng: 127.8 };
const BOUNDS_MARGIN = { top: 60, right: 60, bottom: 60, left: 60 };

function MapView({ villages, activeId, onSelect }) {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const hasFitOnceRef = useRef(false);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(!hasNaverMapKey());
  const [points, setPoints] = useState({});

  const activeVillage = villages.find((v) => v.id === activeId);

  // 네이버 지도 초기화 (최초 1회)
  useEffect(() => {
    if (!hasNaverMapKey()) return;
    let cancelled = false;

    loadNaverMaps()
      .then((naver) => {
        if (cancelled || !mapElRef.current) return;
        const map = new naver.maps.Map(mapElRef.current, {
          center: new naver.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
          zoom: 7,
          zoomControl: false,
          mapDataControl: false,
        });
        mapRef.current = map;
        setMapReady(true);
      })
      .catch((err) => {
        console.warn("[MapView] 네이버 지도 로드 실패, 대체 화면으로 전환합니다.", err);
        if (!cancelled) setMapError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const fitToVillages = useCallback((list) => {
    const naver = window.naver;
    const map = mapRef.current;
    if (!naver || !map) return;
    const coords = list
      .filter((v) => v.lat != null && v.lng != null)
      .map((v) => new naver.maps.LatLng(v.lat, v.lng));
    if (coords.length === 0) return;

    let bounds = new naver.maps.LatLngBounds(coords[0], coords[0]);
    coords.slice(1).forEach((coord) => {
      bounds = bounds.extend(coord);
    });
    map.fitBounds(bounds, BOUNDS_MARGIN);
  }, []);

  // 마을 데이터가 처음 들어왔을 때 딱 한 번 전체 범위에 맞춘다.
  useEffect(() => {
    if (!mapReady || hasFitOnceRef.current || villages.length === 0) return;
    fitToVillages(villages);
    hasFitOnceRef.current = true;
  }, [mapReady, villages, fitToVillages]);

  const recomputePoints = useCallback(() => {
    const naver = window.naver;
    const map = mapRef.current;
    if (!naver || !map) return;
    const projection = map.getProjection();
    const next = {};
    villages.forEach((v) => {
      if (v.lat == null || v.lng == null) return;
      const offset = projection.fromCoordToOffset(new naver.maps.LatLng(v.lat, v.lng));
      next[v.id] = { x: offset.x, y: offset.y };
    });
    setPoints(next);
  }, [villages]);

  // 지도 이동/줌이 끝날 때마다 핀·팝업의 화면 좌표를 다시 계산한다.
  useEffect(() => {
    if (!mapReady) return;
    const naver = window.naver;
    const map = mapRef.current;
    recomputePoints();
    const listeners = ["idle", "zoom_changed"].map((evt) =>
      naver.maps.Event.addListener(map, evt, recomputePoints)
    );
    return () => listeners.forEach((l) => naver.maps.Event.removeListener(l));
  }, [mapReady, recomputePoints]);

  function handleZoom(delta) {
    const map = mapRef.current;
    if (!map) return;
    map.setZoom(map.getZoom() + delta, true);
  }

  function handleLocate() {
    const naver = window.naver;
    const map = mapRef.current;
    const target = activeVillage ?? villages[0];
    if (!naver || !map || target?.lat == null) return;
    map.panTo(new naver.maps.LatLng(target.lat, target.lng));
  }

  function handleFitAll() {
    fitToVillages(villages);
  }

  return (
    <div className="map-view">
      <div className="map-view__top-bar">
        <div className="map-view__weather">
          <span>⛅ 전주 흐림 21.4°C</span>
          <span>😷 미세먼지 나쁨 (33㎍)</span>
        </div>
        <div className="map-view__view-actions">
          <button type="button" onClick={handleLocate}>
            현재 위치
          </button>
          <button type="button" onClick={handleFitAll}>
            지도 전체보기
          </button>
        </div>
      </div>

      <div className="map-view__canvas">
        {/* 네이버 지도 라이브러리가 컨테이너의 position을 relative로 바꿔버려서
            inset:0 사이징이 깨지므로, 사이징은 바깥 래퍼가 담당하고
            안쪽 div는 네이버 지도가 자유롭게 다뤄도 100%/100%로만 채운다. */}
        <div className="map-view__surface-wrap">
          <div ref={mapElRef} className="map-view__surface" />
        </div>

        {mapError && (
          <div className="map-view__fallback">
            <p className="map-view__fallback-title">지도를 표시할 수 없어요</p>
            <p className="map-view__fallback-desc">
              VITE_NAVER_MAP_CLIENT_ID를 설정하면 실제 지도가 표시됩니다.
            </p>
          </div>
        )}

        <div className="map-view__overlay">
          {mapReady &&
            villages.map(
              (village) =>
                points[village.id] && (
                  <MapPin
                    key={village.id}
                    village={village}
                    point={points[village.id]}
                    isActive={village.id === activeId}
                    onSelect={() => onSelect(village.id)}
                  />
                )
            )}

          {mapReady && activeVillage && points[activeVillage.id] && (
            <LocationPopup
              village={activeVillage}
              point={points[activeVillage.id]}
              onClose={() => onSelect(null)}
            />
          )}
        </div>

        <div className="map-view__zoom">
          <button type="button" onClick={() => handleZoom(1)} aria-label="확대">
            +
          </button>
          <button type="button" onClick={() => handleZoom(-1)} aria-label="축소">
            −
          </button>
        </div>
      </div>

      <div className="map-view__status-bar">
        <span>한국관광공사 국문관광정보(TourAPI 4.0) &amp; 공공데이터 연동</span>
        <span>데이터 최종 동기화: 10분 전</span>
        <span>전국 한옥 1,420개 방문지 DB 보유</span>
      </div>
    </div>
  );
}

export default MapView;
