/**
 * 전통문화 체험 데이터 계층 (TourAPI 관광지 contentTypeId=12).
 *
 * 키워드 검색이 아니라 TourAPI의 분류체계를 쓴다. categoryCode2로 확인한 결과
 * A02(인문) > A0203(체험관광지) 아래에 소분류가 나뉘어 있고, 이 화면이 원하는
 * 것은 그중 두 가지다.
 *
 *   A02030200 전통체험  26건 — 고택문화체험관, 전주목판서화체험관, 한복남 등
 *   A02030300 산사체험   2건
 *
 * 나머지 소분류(농산어촌 체험 500건, 이색체험 338건, 이색거리 152건)에는
 * 케이블카·찐빵골목처럼 전통문화와 무관한 시설이 섞여 있어 쓰지 않는다.
 * 예전에 "체험"/"한옥" 같은 키워드로 검색했을 때 한옥마을이나 메타버스
 * 체험관이 올라오던 문제가 이 분류 필터로 해결된다.
 *
 * 상세(detailIntro2)에서 체험 프로그램 안내(expguide), 이용시간, 휴무일,
 * 문의처, 국가유산 지정 여부를 가져온다. 요금·소요시간·평점은 TourAPI가
 * 주지 않으므로 만들지 않는다.
 */
import { callKorService, hasTourApiKey } from "./tourApiClient.js";

// 카드마다 상세를 부르기 때문에 목록이 길수록 호출 수가 늘어난다.
export const API_ITEM_LIMIT = 12;

// 숙박 콘텐츠 타입. detailIntro2의 필드 구성이 이 값에 따라 달라진다.
export const STAY_CONTENT_TYPE_ID = "32";

// contentTypeId=12(관광지) 기준 분류코드.
const CATEGORIES = [
  { cat1: "A02", cat2: "A0203", cat3: "A02030200" }, // 전통체험
  { cat1: "A02", cat2: "A0203", cat3: "A02030300" }, // 산사체험
];

function stripHtml(text) {
  return (text ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * 여러 줄/여러 항목으로 오는 값에서 첫 항목만 잘라 카드 한 줄에 맞춘다.
 *
 * cutParen은 휴무일에만 쓴다 — "매주 월요일(단, 공휴일이면 익일)"처럼 괄호 안
 * 단서가 길어 잘린 채 끝나기 때문이다. 이용시간은 "하절기(4월~11월) 09:00~18:00"
 * 처럼 괄호가 본문의 일부라서 끊으면 시간이 통째로 사라진다.
 */
function firstLine(text, maxLength, { cutParen = false } = {}) {
  const clean = stripHtml(text).replace(/^[-\s]+/, "");
  if (!clean) return null;
  const separators = cutParen ? /(?:\s-\s|\/|,|\()/ : /(?:\s-\s|\/|,)/;
  const head = clean.split(separators)[0].trim();
  return head.length > maxLength ? `${head.slice(0, maxLength)}…` : head;
}

/**
 * 슬래시를 살려서 길이만 줄인다.
 * 객실 종류("보급형 / 일반형 / 누마루형…")나 부대시설처럼 슬래시가 구분자가 아니라
 * 목록 그 자체인 값에 쓴다 — firstLine을 쓰면 첫 항목만 남아 "보급형"이 되어버린다.
 */
function clampText(text, maxLength) {
  const clean = stripHtml(text).replace(/\s*\/\s*/g, " / ").trim();
  if (!clean) return null;
  return clean.length > maxLength ? `${clean.slice(0, maxLength)}…` : clean;
}

/**
 * infocenter에는 "전통가옥 운영사무실 02-6358-5533 문화관광해설 02-2133-6269"처럼
 * 설명과 번호가 여러 쌍 들어있다. 첫 번째 전화번호만 뽑는다.
 */
function firstPhone(text) {
  const clean = stripHtml(text);
  const match = clean.match(/0\d{1,3}-\d{3,4}-\d{4}/);
  return match ? match[0] : firstLine(clean, 24);
}

function mapExperience(item) {
  return {
    id: `api-${item.contentid}`,
    contentId: item.contentid,
    name: item.title,
    location: [item.addr1, item.addr2].filter(Boolean).join(" "),
    image: item.firstimage || item.firstimage2 || null,
    tel: item.tel || null,
    isApiOnly: true,
  };
}

/**
 * 체험 목록. 키워드별 결과를 합치고 contentId로 중복을 제거한다.
 * @returns {Promise<{source: 'tourapi'|'fallback', experiences: Array}>}
 */
export async function fetchExperiences({ limit = API_ITEM_LIMIT } = {}) {
  if (!hasTourApiKey()) return { source: "unavailable", experiences: [], totalCount: 0 };

  try {
    const results = await Promise.all(
      CATEGORIES.map((category) =>
        callKorService("areaBasedList2", {
          contentTypeId: "12",
          ...category,
          numOfRows: "40",
          arrange: "O", // 대표이미지 있는 항목 우선
        }).catch(() => ({ items: [], totalCount: 0 })),
      ),
    );

    const byId = new Map();
    for (const { items } of results) {
      for (const item of items) {
        // 사진이 없으면 카드가 비어 보여서 제외한다(26건 중 22건에 사진이 있다).
        if (!item.firstimage && !item.firstimage2) continue;
        if (!byId.has(item.contentid)) byId.set(item.contentid, mapExperience(item));
      }
    }

    const collected = [...byId.values()];
    const totalCount = results.reduce((sum, r) => sum + (r.totalCount ?? 0), 0);
    return { source: "tourapi", experiences: collected.slice(0, limit), totalCount };
  } catch (err) {
    console.warn("[experienceApi] 체험 목록 조회 실패", err);
    return { source: "unavailable", experiences: [], totalCount: 0 };
  }
}

const detailCache = new Map();

/**
 * 체험 한 곳의 상세. 프로그램 안내(expguide)가 이 화면의 핵심 값이다.
 * 소개문구(overview)는 detailCommon2에 있지만 호출 수를 아끼려고 여기서는
 * 부르지 않는다 — 카드는 프로그램 안내만으로 충분히 채워진다.
 */
export async function fetchExperienceDetail(contentId, contentTypeId = "12") {
  if (detailCache.has(contentId)) return detailCache.get(contentId);

  try {
    const { items } = await callKorService("detailIntro2", { contentId, contentTypeId });
    const intro = items[0];
    if (!intro) return null;

    const programs = stripHtml(intro.expguide)
      .split(/[/\n]/)
      .map((p) => p.split("※")[0].trim())
      .filter(Boolean)
      .slice(0, 3);

    const detail = {
      programs,
      // usetime/restdate는 "- 하절기(4월~11월) 09:00~18:00 - 동절기…"처럼 길게 오고
      // infocenter에는 <br>로 여러 연락처가 들어있다. 카드 한 줄에 맞게 다듬는다.
      useTime: firstLine(intro.usetime, 28),
      restDate: firstLine(intro.restdate, 30, { cutParen: true }),
      tel: firstPhone(intro.infocenter),
      parking: stripHtml(intro.parking) || null,
      // heritage1~3은 국가지정/시도지정 유산 여부(0/1) 플래그다.
      isHeritage: ["heritage1", "heritage2", "heritage3"].some(
        (k) => String(intro[k] ?? "0") === "1",
      ),
    };
    detailCache.set(contentId, detail);
    return detail;
  } catch (err) {
    console.warn(`[experienceApi] 체험 상세(${contentId}) 조회 실패, 생략합니다.`, err);
    return null;
  }
}

/**
 * 숙박(contentTypeId 32) 상세. detailIntro2는 타입마다 필드 이름이 전혀 달라서
 * 체험용 매핑(usetime/restdate/parking)으로는 한 칸도 채워지지 않는다.
 * 실제 응답 기준으로 숙소에 있는 값만 고른다.
 */
export async function fetchStayDetail(contentId) {
  const cacheKey = `stay-${contentId}`;
  if (detailCache.has(cacheKey)) return detailCache.get(cacheKey);

  try {
    const { items } = await callKorService("detailIntro2", {
      contentId,
      contentTypeId: STAY_CONTENT_TYPE_ID,
    });
    const intro = items[0];
    if (!intro) return null;

    const detail = {
      checkIn: stripHtml(intro.checkintime) || null,
      checkOut: stripHtml(intro.checkouttime) || null,
      roomCount: stripHtml(intro.roomcount) || null,
      roomType: clampText(intro.roomtype, 60),
      cooking: stripHtml(intro.chkcooking) || null,
      pickup: stripHtml(intro.pickup) || null,
      subFacility: clampText(intro.subfacility, 70),
      parking: stripHtml(intro.parkinglodging) || null,
      tel: firstPhone(intro.infocenterlodging),
    };
    detailCache.set(cacheKey, detail);
    return detail;
  } catch (err) {
    console.warn(`[experienceApi] 숙소 상세(${contentId}) 조회 실패, 생략합니다.`, err);
    return null;
  }
}

const overviewCache = new Map();

/**
 * 소개문구. expguide가 비어 있는 곳(마을·고택처럼 프로그램이 따로 등록되지
 * 않은 경우)에만 불러서 카드가 안내문구만 남지 않게 한다.
 */
export async function fetchExperienceOverview(contentId) {
  if (overviewCache.has(contentId)) return overviewCache.get(contentId);

  try {
    const { items } = await callKorService("detailCommon2", { contentId });
    const overview = stripHtml(items[0]?.overview) || null;
    overviewCache.set(contentId, overview);
    return overview;
  } catch {
    return null;
  }
}

/** homepage 필드는 <a href="...">제목</a> 형태로 와서 URL만 뽑는다. */
function firstLink(html) {
  const match = String(html ?? "").match(/href=["']([^"']+)["']/);
  return match ? match[1] : null;
}

/** TourAPI 이미지가 http로 오면 https 배포본에서 혼합 콘텐츠로 차단된다. */
function toHttps(url) {
  return url ? url.replace(/^http:\/\//, "https://") : null;
}

/**
 * 체험 상세페이지에 필요한 값을 한 번에 모은다.
 * detailCommon2(기본·개요·홈페이지·좌표) + detailIntro2(프로그램·시간·휴무)
 * + detailImage2(추가 사진).
 *
 * @returns {Promise<object|null>}
 */
export async function fetchExperiencePage(contentId) {
  try {
    // 종류를 먼저 알아야 detailIntro2를 제대로 부를 수 있다. 예전에는 셋을 한꺼번에
    // 불러서 타입을 12로 고정했고, 그래서 숙소 상세는 체크인·객실이 통째로 비었다.
    const commonRes = await callKorService("detailCommon2", { contentId });
    const common = commonRes.items[0];
    if (!common) return null;

    const contentTypeId = String(common.contenttypeid ?? "");
    const isStay = contentTypeId === STAY_CONTENT_TYPE_ID;

    const [intro, stay, imageRes] = await Promise.all([
      isStay ? Promise.resolve(null) : fetchExperienceDetail(contentId, contentTypeId || "12"),
      isStay ? fetchStayDetail(contentId) : Promise.resolve(null),
      callKorService("detailImage2", { contentId, numOfRows: "10" }).catch(() => ({ items: [] })),
    ]);

    const gallery = imageRes.items
      .map((item) => toHttps(item.originimgurl))
      .filter(Boolean)
      .slice(0, 6);

    return {
      contentId,
      contentTypeId: common.contenttypeid ?? null,
      title: common.title,
      overview: stripHtml(common.overview) || null,
      address: [common.addr1, common.addr2].filter(Boolean).join(" ") || null,
      image: toHttps(common.firstimage || common.firstimage2),
      gallery,
      homepage: firstLink(common.homepage),
      lat: common.mapy ? Number(common.mapy) : null,
      lng: common.mapx ? Number(common.mapx) : null,
      isStay,
      programs: intro?.programs ?? [],
      useTime: intro?.useTime ?? null,
      restDate: intro?.restDate ?? null,
      tel: intro?.tel ?? stay?.tel ?? common.tel ?? null,
      parking: intro?.parking ?? stay?.parking ?? null,
      isHeritage: intro?.isHeritage ?? false,
      stay,
    };
  } catch (err) {
    console.warn(`[experienceApi] 체험 상세페이지(${contentId}) 조회 실패`, err);
    return null;
  }
}
