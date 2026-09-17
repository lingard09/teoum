/**
 * 네이버 지도 API v3 로더.
 *
 * 발급: 네이버클라우드플랫폼(NCP) 콘솔 > Service > Application Service > Maps
 * 에서 애플리케이션을 등록하면 Client ID를 받는다. 이때 "Web 서비스 URL"에
 * 개발 중인 주소(예: http://localhost:5173)와 배포 주소를 등록해둬야
 * "인증 실패" 에러 없이 지도가 뜬다.
 *
 * 스크립트 URL 파라미터명이 과거 ncpClientId에서 ncpKeyId로 바뀌었으니
 * 최신 문서(https://navermaps.github.io/maps.js.ncp/) 기준을 따른다.
 */

const NAVER_MAP_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID ?? "";

export function hasNaverMapKey() {
  return NAVER_MAP_CLIENT_ID.length > 0;
}

let loadPromise = null;

/**
 * @returns {Promise<typeof window.naver>} window.naver 최상위 객체
 * (naver.maps.Map, naver.maps.LatLng 등은 반환값.maps.XXX로 접근).
 */
export function loadNaverMaps() {
  if (!hasNaverMapKey()) {
    return Promise.reject(new Error("VITE_NAVER_MAP_CLIENT_ID가 설정되지 않았습니다."));
  }
  if (window.naver?.maps) {
    return Promise.resolve(window.naver);
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_CLIENT_ID}`;
    script.async = true;
    script.onload = () => resolve(window.naver);
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("네이버 지도 스크립트 로드 실패"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
