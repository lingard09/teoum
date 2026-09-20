/**
 * 전통문화 체험 데이터 계층 (TourAPI 관광지 12 / 문화시설 14).
 *
 * 키워드 검색을 여러 번 돌려 합친다. 실호출로 확인한 건수는 "체험" 299건이
 * 가장 크고 공방/한지/다도/민속마을이 각각 한 자릿수~십여 건이다.
 *
 * 상세(detailIntro2)에서 체험 프로그램 안내(expguide), 이용시간, 쉬는날,
 * 문의 전화, 국가유산 지정 여부를 가져온다. 요금·소요시간·평점은 TourAPI가
 * 주지 않으므로 만들지 않는다.
 */
import { callKorService, hasTourApiKey } from "./tourApiClient.js";

// 목록이 길어질수록 카드마다 상세를 부르느라 호출 수가 늘어난다.
// 공공데이터포털 일일 트래픽을 감안해 노출 개수를 제한한다.
export const API_ITEM_LIMIT = 12;

// "체험" 한 단어로 검색하면 299건이 걸리지만 메타버스 체험관·유황족욕처럼
// 이 화면의 주제(전통문화)와 무관한 시설이 대부분이다. 전통 공예/문화 쪽
// 키워드로 좁혀서 모은다.
const SEARCHES = [
  { keyword: "한옥", contentTypeId: "12" },
  { keyword: "공방", contentTypeId: "12" },
  { keyword: "한지", contentTypeId: "12" },
  { keyword: "도예", contentTypeId: "12" },
  { keyword: "옹기", contentTypeId: "12" },
  { keyword: "한복", contentTypeId: "12" },
  { keyword: "전통문화", contentTypeId: "12" },
  { keyword: "민속", contentTypeId: "12" },
  { keyword: "국악", contentTypeId: "12" },
  { keyword: "천연염색", contentTypeId: "12" },
  { keyword: "다도", contentTypeId: "14" },
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
      SEARCHES.map(({ keyword, contentTypeId }) =>
        callKorService("searchKeyword2", {
          keyword,
          contentTypeId,
          numOfRows: "20",
          arrange: "O", // 대표이미지 있는 항목 우선
        }).catch(() => ({ items: [] })),
      ),
    );

    const byId = new Map();
    for (const { items } of results) {
      for (const item of items) {
        // 사진이 없으면 카드가 비어 보여서 제외한다.
        if (!item.firstimage && !item.firstimage2) continue;
        if (!byId.has(item.contentid)) byId.set(item.contentid, mapExperience(item));
      }
    }

    const collected = [...byId.values()];
    // 키워드 11개 결과가 겹쳐서 API 총건수를 더하면 중복이 섞인다.
    // 중복 제거 후 실제로 모인 후보 수를 그대로 쓴다.
    return { source: "tourapi", experiences: collected.slice(0, limit), totalCount: collected.length };
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
