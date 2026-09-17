import { villages, featuredVillages } from "../data/villages.js";
import { regionGroupOf, shortRegionLabelFromAddress } from "../utils/region.js";
import { hasTourApiKey } from "./tourApiClient.js";
import {
  searchAttractionsByKeyword,
  fetchAttractionDetail,
  fetchLatestVisitorCountsByRegion,
} from "./tourApi.js";

// 이미 villages.js에 큐레이션되어 있는 곳(전주 한옥마을, 북촌한옥마을)은
// "한옥마을" 키워드 검색 결과에도 잡히므로 중복 추가되지 않게 제외한다.
const CURATED_TOUR_API_CONTENT_IDS = new Set(["264284", "126537"]);

/**
 * 한옥마을 데이터 API 계층.
 *
 * VITE_TOUR_API_KEY가 설정되어 있으면 한국관광공사 TourAPI(searchKeyword2)로
 * 실제 주소/좌표/연락처/콘텐츠ID를 가져와 큐레이션 데이터에 덧씌운다. 카드
 * 이미지와 소개 문구는 Figma 디자인에 맞춰 큐레이션한 값을 그대로 유지한다.
 * 키가 없거나 API 호출이 실패하면 조용히 mock 데이터(villages.js에 미리
 * 넣어둔 실좌표 포함)로 폴백해서 화면이 깨지지 않는다.
 */

const MOCK_DELAY = 250;

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY));
}

// 마을 하나당 실제 API 조회는 여러 번 반복 호출할 필요 없으니 세션 내에서 캐시한다.
const enrichmentCache = new Map();

async function enrichVillage(village) {
  if (enrichmentCache.has(village.id)) {
    return { ...village, ...enrichmentCache.get(village.id) };
  }
  try {
    const keyword = village.searchKeyword || village.name;
    const [match] = await searchAttractionsByKeyword(keyword, { numOfRows: 1 });
    if (!match) return village;

    const patch = {
      address: match.address || village.address,
      lat: match.lat ?? village.lat,
      lng: match.lng ?? village.lng,
      tourApiContentId: match.contentId,
      tourApiTel: match.tel,
    };
    enrichmentCache.set(village.id, patch);
    return { ...village, ...patch };
  } catch (err) {
    console.warn(`[villageApi] "${village.name}" TourAPI 조회 실패, 큐레이션 데이터로 대체합니다.`, err);
    return village;
  }
}

async function enrichAll(list) {
  return Promise.all(list.map(enrichVillage));
}

function stripHtml(html) {
  return html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/**
 * 이름/ID 문자열을 시드로 4.50~4.94 사이 평점과 그럴듯한 리뷰수를 만든다.
 * TourAPI는 평점·리뷰 데이터를 전혀 제공하지 않아서(관광지 정보 API일 뿐
 * 리뷰 플랫폼이 아님), 카드 디자인을 큐레이션 항목과 통일하기 위해 만든
 * 표시용 임의값이다 — 실데이터가 아니라는 점을 코드 차원에서 명확히 남겨둔다.
 */
function pseudoRatingFor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const rating = Math.round((4.5 + (hash % 45) / 100) * 100) / 100;
  const count = 300 + (hash % 4700);
  const reviewCount = count >= 1000 ? `${(count / 1000).toFixed(1)}천` : `${count}`;
  return { rating, reviewCount };
}

const CONGESTION_LABEL = { low: "낮음", medium: "보통", high: "혼잡" };

/**
 * 같은 그룹 안에서의 상대적 방문자수 순위(0~1)를 혼잡도 등급/점수로 바꾼다.
 * 방문자수 자체는 한국관광공사 관광빅데이터(DataLabService) 실데이터.
 */
function congestionFromVisitorRank(ratio) {
  const level = ratio < 0.34 ? "low" : ratio < 0.67 ? "medium" : "high";
  const score = Math.round((2.2 + ratio * 2.6) * 10) / 10;
  return { level, label: CONGESTION_LABEL[level], score };
}

/**
 * villages.js에 큐레이션되지 않은, TourAPI 검색 결과로만 존재하는 항목을
 * 우리 Village 모양으로 매핑한다. 소개문구는 TourAPI 개요(overview)를 쓰고,
 * 평점은 표시용 임의값(pseudoRatingFor), 혼잡도는 지역별 방문자 빅데이터
 * 실데이터를 상대 순위로 환산한 값이다. 체험 태그처럼 TourAPI에 아예 없는
 * 필드는 넣지 않는다 — TourismListItem/LocationPopup이 없으면 알아서 숨긴다.
 */
function mapApiOnlyVillage(result, overview) {
  const desc = stripHtml(overview);
  const { rating, reviewCount } = pseudoRatingFor(String(result.contentId));
  return {
    id: `api-${result.contentId}`,
    name: result.name,
    region: shortRegionLabelFromAddress(result.address),
    shortDesc: desc ? truncate(desc, 70) : "한국관광공사 TourAPI에서 제공하는 관광지 정보입니다.",
    description: desc,
    linkLabel: "관광지 정보 보기",
    image: result.image,
    mapImage: result.image,
    address: result.address,
    lat: result.lat,
    lng: result.lng,
    rating,
    reviewCount,
    tourApiContentId: result.contentId,
    tourApiTel: result.tel,
    isApiOnly: true,
    featured: false,
  };
}

/** 방문자 빅데이터로 extra 목록에 혼잡도를 채운다. 실패해도 조용히 넘어간다. */
async function attachCongestion(extraList) {
  try {
    const visitorByRegion = await fetchLatestVisitorCountsByRegion();
    const regionPrefixes = [...new Set(extraList.map((v) => v.region.split(" ")[0]))];
    const ranked = regionPrefixes
      .map((prefix) => ({ prefix, count: visitorByRegion.get(prefix)?.visitorCount ?? 0 }))
      .sort((a, b) => a.count - b.count);

    const ratioByPrefix = new Map(
      ranked.map(({ prefix }, i) => [
        prefix,
        ranked.length > 1 ? i / (ranked.length - 1) : 0.5,
      ])
    );

    return extraList.map((v) => {
      const ratio = ratioByPrefix.get(v.region.split(" ")[0]);
      return ratio == null ? v : { ...v, congestion: congestionFromVisitorRank(ratio) };
    });
  } catch (err) {
    console.warn("[villageApi] 방문자 빅데이터 조회 실패, 혼잡도 없이 표시합니다.", err);
    return extraList;
  }
}

let extraVillagesCache = null;

/** "한옥마을" 전국 키워드 검색 결과 중 큐레이션되지 않은 나머지를 가져온다. */
async function fetchExtraApiVillages() {
  if (!hasTourApiKey()) return [];
  if (extraVillagesCache) return extraVillagesCache;

  try {
    const results = await searchAttractionsByKeyword("한옥마을", { numOfRows: 30 });
    const fresh = results.filter(
      (r) => !CURATED_TOUR_API_CONTENT_IDS.has(String(r.contentId))
    );

    const mapped = await Promise.all(
      fresh.map(async (r) => {
        let overview = "";
        try {
          const detail = await fetchAttractionDetail(r.contentId);
          overview = detail?.overview ?? "";
        } catch {
          // 개요 조회 실패는 무시하고 기본 문구로 대체한다.
        }
        return mapApiOnlyVillage(r, overview);
      })
    );

    extraVillagesCache = await attachCongestion(mapped);
    return extraVillagesCache;
  } catch (err) {
    console.warn("[villageApi] 추가 한옥마을 검색 실패", err);
    return [];
  }
}

export async function fetchFeaturedVillages() {
  if (hasTourApiKey()) {
    return enrichAll(featuredVillages);
  }
  return delay(featuredVillages);
}

function filterVillages(list, { region, keyword }) {
  let result = list;
  if (keyword) {
    result = result.filter(
      (v) => v.name.includes(keyword) || v.region.includes(keyword)
    );
  }
  if (region) {
    result = result.filter((v) => regionGroupOf(v.region) === region);
  }
  return result;
}

export async function fetchAllVillages({ region, keyword } = {}) {
  const curated = filterVillages(villages, { region, keyword });

  if (!hasTourApiKey()) {
    return delay(curated);
  }

  const [enrichedCurated, extra] = await Promise.all([
    enrichAll(curated),
    fetchExtraApiVillages(),
  ]);
  return [...enrichedCurated, ...filterVillages(extra, { region, keyword })];
}

export async function fetchVillageById(id) {
  const base = villages.find((v) => v.id === id) ?? null;
  if (!base) return delay(null);
  if (!hasTourApiKey()) return delay(base);

  const enriched = await enrichVillage(base);
  if (!enriched.tourApiContentId) return enriched;

  try {
    const detail = await fetchAttractionDetail(enriched.tourApiContentId);
    return detail?.overview ? { ...enriched, tourApiOverview: detail.overview } : enriched;
  } catch (err) {
    console.warn(`[villageApi] "${base.name}" 상세정보 조회 실패`, err);
    return enriched;
  }
}
