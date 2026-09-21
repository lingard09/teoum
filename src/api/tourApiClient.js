/**
 * 한국관광공사 TourAPI 4.0 (KorService2 / TarRlteTarService1 / DataLabService) 공통 클라이언트.
 *
 * 세 API 모두 "https://apis.data.go.kr/B551011/<서비스명>/<오퍼레이션>" 형태의
 * 동일한 게이트웨이(apis.data.go.kr) 아래 있고, 공통 파라미터(serviceKey, MobileOS,
 * MobileApp, _type)와 공통 에러 응답 포맷을 공유한다. 실제 엔드포인트/오퍼레이션명은
 * apis.data.go.kr에 직접 요청을 보내 응답 코드로 하나씩 확인한 값이다.
 *
 * 참고:
 * - serviceKey는 공공데이터포털에서 받은 "Decoding(일반 인증키)" 값을 그대로 넣는다.
 *   URLSearchParams가 인코딩을 한 번만 수행하므로, 여기에 이미 URL 인코딩된
 *   "Encoding" 키를 넣으면 %2F → %252F 처럼 이중 인코딩되어 인증 오류가 난다.
 * - apis.data.go.kr는 요청 Origin을 그대로 Access-Control-Allow-Origin으로
 *   반사해주므로 브라우저에서 직접 호출이 가능하다(별도 프록시 서버 불필요).
 */

import { withCache } from "./apiCache.js";

const TOUR_API_KEY = import.meta.env.VITE_TOUR_API_KEY ?? "";

export const TOUR_SERVICE = {
  // 한국관광공사_국문 관광정보 서비스_GW (data.go.kr/data/15101578)
  KOR: "https://apis.data.go.kr/B551011/KorService2",
  // 한국관광공사_관광지별 연관 관광지 정보 (data.go.kr/data/15128560)
  RELATED: "https://apis.data.go.kr/B551011/TarRlteTarService1",
  // 한국관광공사_관광빅데이터 정보서비스_GW - 지역별 방문자수 (data.go.kr/data/15101972)
  DATALAB: "https://apis.data.go.kr/B551011/DataLabService",
  // 한국관광공사_무장애 여행 정보 (data.go.kr/data/15101897)
  WITH: "https://apis.data.go.kr/B551011/KorWithService2",
  // 한국관광공사_관광사진 정보 (data.go.kr/data/15101933)
  PHOTO: "https://apis.data.go.kr/B551011/PhotoGalleryService1",
  // 한국관광공사_관광지 집중률 방문자 추이 예측 (data.go.kr/data/15128555)
  CONGESTION: "https://apis.data.go.kr/B551011/TatsCnctrRateService",
  // 한국관광공사_관광지 오디오 가이드(오디) (data.go.kr/data/15101971)
  ODII: "https://apis.data.go.kr/B551011/Odii",
};

export class TourApiError extends Error {
  constructor(message, { code, source } = {}) {
    super(message);
    this.name = "TourApiError";
    this.code = code;
    this.source = source;
  }
}

export function hasTourApiKey() {
  return TOUR_API_KEY.length > 0;
}

/**
 * items.item은 TourAPI 특유의 함정이 있다: 결과가 0건이면 "" (빈 문자열),
 * 1건이면 배열이 아닌 단일 객체, 2건 이상이면 배열로 내려온다. 항상 배열로 맞춘다.
 */
function normalizeItems(items) {
  if (!items) return [];
  const item = items.item;
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

// data.go.kr은 Referer 헤더에 쿼리스트링이 붙어 있으면 그 값까지 요청 파라미터로
// 해석해서 INVALID_REQUEST_PARAMETER_ERROR(400)를 돌려준다(실호출로 확인:
// Referer 없음/Origin만/쿼리 없는 Referer는 200, "?contentId=..."가 붙으면 400).
// 예약 페이지처럼 URL에 쿼리가 있는 화면에서 API가 통째로 실패하므로 Referer를 보내지 않는다.
async function requestTourApi(baseUrl, operation, params = {}) {
  if (!hasTourApiKey()) {
    throw new TourApiError("VITE_TOUR_API_KEY가 설정되지 않았습니다.", {
      code: "NO_API_KEY",
      source: operation,
    });
  }

  const query = new URLSearchParams({
    serviceKey: TOUR_API_KEY,
    MobileOS: "ETC",
    MobileApp: "TeoumWeb",
    _type: "json",
    numOfRows: "20",
    pageNo: "1",
    ...params,
  });

  const url = `${baseUrl}/${operation}?${query.toString()}`;

  // 하루 동안 응답을 캐시한다. 일일 요청 한도를 넘기지 않기 위함이고,
  // 이미 한도를 넘겼다면 만료된 캐시라도 돌려준다(apiCache 참고).
  const data = await withCache(url, async () => {
    const res = await fetch(url, { referrerPolicy: "no-referrer" });
    if (!res.ok) {
      throw new TourApiError(`TourAPI 요청 실패 (HTTP ${res.status})`, {
        code: String(res.status),
        source: operation,
      });
    }
    return res.json();
  });

  // 게이트웨이 레벨 에러 (인증키 미등록, 트래픽 초과, 존재하지 않는 오퍼레이션 등)
  const gatewayError = data?.OpenAPI_ServiceResponse?.cmmMsgHeader;
  if (gatewayError) {
    throw new TourApiError(gatewayError.returnAuthMsg ?? gatewayError.errMsg, {
      code: gatewayError.returnReasonCode,
      source: operation,
    });
  }

  // 애플리케이션 레벨 에러 (잘못된 파라미터 값 등)
  const header = data?.response?.header;
  if (header && header.resultCode !== "0000") {
    throw new TourApiError(header.resultMsg ?? "TourAPI 응답 오류", {
      code: header.resultCode,
      source: operation,
    });
  }

  const body = data?.response?.body;
  return {
    items: normalizeItems(body?.items),
    totalCount: body?.totalCount ?? 0,
  };
}

export function callKorService(operation, params) {
  return requestTourApi(TOUR_SERVICE.KOR, operation, params);
}

export function callRelatedService(operation, params) {
  return requestTourApi(TOUR_SERVICE.RELATED, operation, params);
}

export function callDataLabService(operation, params) {
  return requestTourApi(TOUR_SERVICE.DATALAB, operation, params);
}

export function callWithService(operation, params) {
  return requestTourApi(TOUR_SERVICE.WITH, operation, params);
}

export function callPhotoService(operation, params) {
  return requestTourApi(TOUR_SERVICE.PHOTO, operation, params);
}

export function callCongestionService(operation, params) {
  return requestTourApi(TOUR_SERVICE.CONGESTION, operation, params);
}

export function callOdiiService(operation, params) {
  return requestTourApi(TOUR_SERVICE.ODII, operation, params);
}
