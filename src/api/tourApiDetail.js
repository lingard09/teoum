// 한국관광공사 TourAPI(국문 관광정보 서비스, KorService2) 연동 유틸.
//
// 서비스키는 브라우저에 두지 않는다. /api/tour 프록시(Cloudflare Function)가 키를 붙이고
// 응답을 엣지에 하루 캐시한다 — 자세한 사정은 functions/api/tour 참고.
import { withCache } from './apiCache.js'

// 서비스키는 /api/tour 프록시(Cloudflare Function)가 붙인다. 브라우저에 두지 않는다.

// 같은 오리진이라 CORS 문제가 없다.
const BASE_URL = '/api/tour/B551011/KorService2'

const REQUEST_TIMEOUT_MS = 8000

function buildUrl(operation, params) {
  const query = new URLSearchParams({
    MobileOS: 'ETC',
    MobileApp: 'teoum',
    _type: 'json',
    ...params,
  })
  return `${BASE_URL}/${operation}?${query.toString()}`
}

// data.go.kr은 Referer 헤더에 쿼리스트링이 붙어 있으면 그 값까지 요청 파라미터로
// 해석해서 INVALID_REQUEST_PARAMETER_ERROR(400)를 돌려준다(실호출로 확인:
// Referer 없음/Origin만/쿼리 없는 Referer는 200, "?contentId=..."가 붙으면 400).
// 예약 페이지처럼 URL에 쿼리가 있는 화면에서 API가 통째로 실패하므로 Referer를 보내지 않는다.
async function callTourApi(operation, params) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  const url = buildUrl(operation, params)

  // tourApiClient와 같은 이유로 하루치 캐시를 태운다(일일 요청 한도 대응).
  let data
  try {
    data = await withCache(url, async () => {
      const res = await fetch(url, {
        signal: controller.signal,
        referrerPolicy: 'no-referrer',
      })
      if (!res.ok) throw new Error(`TourAPI 요청 실패 (HTTP ${res.status})`)
      return res.json()
    })
  } finally {
    clearTimeout(timeout)
  }
  // 정상 응답은 { response: { header: {...} } } 형태지만, 파라미터 오류 등은
  // { resultCode, resultMsg }를 최상위에 바로 내려주는 경우가 있어 둘 다 확인한다.
  const header = data?.response?.header ?? data
  if (header?.resultCode && header.resultCode !== '0000') {
    throw new Error(`TourAPI 오류 [${header.resultCode}] ${header.resultMsg ?? ''}`)
  }

  const items = data?.response?.body?.items
  if (!items || items === '') return []
  return Array.isArray(items.item) ? items.item : [items.item]
}

// 키워드로 관광정보를 검색한다 (searchKeyword2).
export async function searchTourKeyword(keyword, { contentTypeId, areaCode, numOfRows = 5 } = {}) {
  return callTourApi('searchKeyword2', {
    keyword,
    ...(contentTypeId && { contentTypeId }),
    ...(areaCode && { areaCode }),
    numOfRows,
    pageNo: 1,
    arrange: 'A',
  })
}

// 콘텐츠 ID로 공통 상세정보(개요 포함)를 조회한다 (detailCommon2).
// contentTypeId나 ...YN 부가 옵션을 같이 보내면 INVALID_REQUEST_PARAMETER_ERROR가 나는
// 경우가 있어(실 호출로 확인) contentId만 보낸다 — 그래도 overview 등 전체 필드가 돌아온다.
export async function fetchDetailCommon(contentId) {
  const [item] = await callTourApi('detailCommon2', { contentId })
  return item ?? null
}

// 키워드로 검색한 첫 결과의 상세정보(개요 포함)까지 합쳐서 반환한다.
// 매칭되는 결과가 없으면 null을 반환한다(호출부에서 mock으로 대체).
export async function fetchExperienceDetail(keyword) {
  const results = await searchTourKeyword(keyword, { numOfRows: 1 })
  const first = results[0]
  if (!first) return null

  const detail = await fetchDetailCommon(first.contentid)
  return { ...first, ...detail }
}

// TourAPI 이미지 URL은 http로 내려오는 경우가 있는데, 배포본은 https라 그대로 쓰면
// 브라우저가 혼합 콘텐츠로 차단한다. 같은 호스트가 https도 지원하는 걸 확인했으므로 강제 치환한다.
export function toHttpsUrl(url) {
  if (!url) return url
  return url.replace(/^http:\/\//i, 'https://')
}

// TourAPI overview 필드는 HTML 태그/개행이 섞여 오는 경우가 많아 순수 텍스트로 정리한다.
export function stripOverviewHtml(overview) {
  if (!overview) return ''
  return overview
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

// 콘텐츠 타입별 표시 라벨. detailCommon2가 돌려주는 contenttypeid 기준.
const CONTENT_TYPE_LABEL = {
  '12': '전통체험',
  '14': '문화시설',
  '25': '여행코스',
  '32': '한옥 스테이',
  '39': '음식점',
}

export function contentTypeLabel(contentTypeId) {
  return CONTENT_TYPE_LABEL[String(contentTypeId)] ?? 'TourAPI 등록 장소'
}

/**
 * 예약 요약 카드에 넣을 실제 정보. 숙소(32)와 체험(12/14)이 서로 다른 필드를
 * 쓰기 때문에 contentTypeId에 따라 detailIntro2에서 뽑는 값이 달라진다.
 *
 * TourAPI에 없는 값(요금·정원·환불규정)은 여기서 만들지 않는다.
 */
export async function fetchBookingInfo(contentId, contentTypeId) {
  const type = String(contentTypeId)
  try {
    const [intro] = await callTourApi('detailIntro2', { contentId, contentTypeId: type })
    if (!intro) return []

    const clean = (v) => stripOverviewHtml(String(v ?? '')).split(/\s-\s|\n/)[0].trim()

    if (type === '32') {
      return [
        intro.checkintime && `체크인 ${clean(intro.checkintime)}`,
        intro.checkouttime && `퇴실 ${clean(intro.checkouttime)}`,
        intro.roomcount && `객실 ${clean(intro.roomcount)}`,
        intro.parkinglodging && `주차 ${clean(intro.parkinglodging)}`,
      ].filter(Boolean)
    }

    return [
      intro.usetime && `이용 ${clean(intro.usetime)}`,
      intro.restdate && `휴무 ${clean(intro.restdate)}`,
      intro.expguide && clean(intro.expguide.split('/')[0]),
      intro.parking && `주차 ${clean(intro.parking)}`,
    ].filter(Boolean)
  } catch (err) {
    console.warn('[tourApiDetail] 예약 요약 정보 조회 실패, 생략합니다.', err)
    return []
  }
}
