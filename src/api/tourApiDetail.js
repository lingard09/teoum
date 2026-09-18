// 한국관광공사 TourAPI(국문 관광정보 서비스, KorService2) 연동 유틸.
//
// 서비스키는 .env.local의 VITE_TOURAPI_SERVICE_KEY로만 관리한다. .env.local은
// .gitignore에 등록돼 있어 커밋되지 않는다 — 새 환경에서는 .env.example을 복사해
// 키를 채워 넣을 것. 단, 이 프로젝트는 순수 정적 프런트엔드(Vite SPA)라 빌드된 JS에
// 키 값이 그대로 포함된다. 즉 배포 후에는 누구나 네트워크 탭/번들에서 키를 볼 수 있다.
// 완전히 감추려면 백엔드(서버리스 함수 등) 뒤로 프록시해야 하며, 이 저장소에는
// 아직 그런 백엔드가 없다.
const SERVICE_KEY = import.meta.env.VITE_TOURAPI_SERVICE_KEY ?? ''

// data.go.kr에서 발급하는 "Encoding" 형태의 키는 이미 URL 인코딩되어 있다(%2B 등).
// URLSearchParams나 encodeURIComponent로 한 번 더 인코딩하면 %가 %25로 이중 인코딩되어
// 인증에 실패한다(흔한 SERVICE_KEY 오류 원인) — 그래서 serviceKey만 문자열에 직접 붙이고,
// 나머지 파라미터만 URLSearchParams로 인코딩한다.
//
// apis.data.go.kr은 Access-Control-Allow-Origin을 내려줘서(실제 호출로 확인) 배포본에서도
// 브라우저 직접 호출이 CORS에 막히지 않는다. 개발 서버에서 프록시를 쓰는 건 CORS 우회가
// 아니라 순수 편의(vite dev 화면과 같은 오리진으로 보여서 네트워크 탭 확인이 편함) 목적이다.
const BASE_URL = import.meta.env.DEV
  ? '/tourapi-proxy/B551011/KorService2'
  : 'https://apis.data.go.kr/B551011/KorService2'

const REQUEST_TIMEOUT_MS = 8000

function buildUrl(operation, params) {
  const query = new URLSearchParams({
    MobileOS: 'ETC',
    MobileApp: 'teoum',
    _type: 'json',
    ...params,
  })
  return `${BASE_URL}/${operation}?serviceKey=${SERVICE_KEY}&${query.toString()}`
}

async function callTourApi(operation, params) {
  if (!SERVICE_KEY) {
    throw new Error('TourAPI 서비스키가 설정되지 않았습니다. .env.local의 VITE_TOURAPI_SERVICE_KEY를 확인하세요.')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let res
  try {
    res = await fetch(buildUrl(operation, params), { signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }

  if (!res.ok) {
    throw new Error(`TourAPI 요청 실패 (HTTP ${res.status})`)
  }

  const data = await res.json()
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
