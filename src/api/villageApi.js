import { villages, featuredVillages } from "../data/villages.js";
import { regionGroupOf, shortRegionLabelFromAddress } from "../utils/region.js";
import { hasTourApiKey } from "./tourApiClient.js";
import {
  fetchRelatedAttractionsByKeyword,
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
 * 우리 Village 모양으로 매핑한다. 소개문구는 TourAPI 개요(overview),
 * 혼잡도는 지역별 방문자 빅데이터를 상대 순위로 환산한 값이다.
 *
 * 평점/리뷰수는 넣지 않는다. TourAPI는 관광정보 API일 뿐 리뷰 플랫폼이 아니라
 * 평점 데이터를 제공하지 않으므로, 있는 척하는 값을 만들어 붙이지 않는다.
 * 체험 태그처럼 TourAPI에 없는 필드도 마찬가지 — TourismListItem/LocationPopup이
 * 값이 없으면 알아서 숨긴다.
 */
function mapApiOnlyVillage(result, overview) {
  const desc = stripHtml(overview);
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

export async function fetchFeaturedVillages({ limit = 4 } = {}) {
  if (!hasTourApiKey()) return delay([]);

  // 큐레이션 목록이 비어 있으면(더미 없는 구성) TourAPI 검색 결과 앞쪽을 쓴다.
  if (featuredVillages.length === 0) {
    const extra = await fetchExtraApiVillages();
    return extra.slice(0, limit);
  }
  return enrichAll(featuredVillages);
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

// ------------------------------------------------- 연관 관광지 (함께 가는 곳)

/** YYYYMM 문자열을 n개월 전으로 옮긴다. */
function shiftYm(date, monthsBack) {
  const d = new Date(date.getFullYear(), date.getMonth() - monthsBack, 1);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// 연관 관광지는 마을이 바뀌지 않는 한 같은 응답이므로 세션 내에서 캐시한다.
const relatedCache = new Map();

/**
 * 마을 하나의 "함께 가는 곳" 목록. Tmap 이동 패턴 기반 연관 관광지(TarRlteTarService1).
 *
 * baseYm(기준년월)은 집계가 끝난 달까지만 데이터가 있어서, 전월부터 최대 6개월까지
 * 거슬러 올라가며 결과가 있는 달을 찾는다. 키가 없거나 조회에 실패하면 빈 배열을
 * 돌려줘서 팝업에서 해당 영역만 빠지게 한다(화면은 깨지지 않음).
 *
 * @returns {Promise<Array<{name: string, category: string}>>}
 */
export async function fetchRelatedSpots(village, { limit = 4 } = {}) {
  if (!village?.related || !hasTourApiKey()) return [];
  if (relatedCache.has(village.id)) return relatedCache.get(village.id);

  const { areaCd, signguCd, keyword } = village.related;
  const now = new Date();

  for (let back = 1; back <= 6; back += 1) {
    try {
      const items = await fetchRelatedAttractionsByKeyword(keyword, {
        areaCd,
        signguCd,
        baseYm: shiftYm(now, back),
        numOfRows: 20,
      });
      if (items.length === 0) continue;

      // 앵커(경기전 등)와 마을 자신은 제외한다. 앵커가 마을 안의 랜드마크라서
      // 마을 이름이 연관 항목으로 같이 올라오는데, 팝업 제목과 중복돼 보인다.
      // 숙박은 별도의 "머무르기" 화면이 담당하므로 여기서는 뺀다.
      const selfNames = new Set([keyword, village.name, village.name.replace(/\s/g, "")]);
      const spots = items
        .filter((item) => item.name && !selfNames.has(item.name.replace(/\s/g, "")))
        .filter((item) => item.raw?.rlteCtgryMclsNm !== "숙박")
        .slice(0, limit)
        .map((item) => ({ name: item.name, category: item.raw?.rlteCtgryMclsNm ?? "" }));
      relatedCache.set(village.id, spots);
      return spots;
    } catch (err) {
      console.warn(`[villageApi] "${village.name}" 연관 관광지 조회 실패, 생략합니다.`, err);
      return [];
    }
  }
  return [];
}
