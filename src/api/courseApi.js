/**
 * 여행코스 데이터 계층 (TourAPI 여행코스, contentTypeId=25).
 *
 * 실호출로 확인: 전국 1069건. 코스 하나에 detailIntro2로 총거리/소요시간/테마가,
 * detailInfo2로 경유지 목록(이름·사진·설명)이 온다.
 *
 * 이 계층에는 목업이 없다. 키가 없거나 실패하면 빈 목록을 돌려주고, 화면은
 * "데이터를 불러오지 못했다"는 상태를 그대로 보여준다.
 */
import { callKorService, hasTourApiKey } from "./tourApiClient.js";

const COURSE_CONTENT_TYPE = "25";
export const COURSE_LIST_LIMIT = 12;

// 여행코스에는 "체험관광지" 같은 주제 분류가 없다(C0112~C0117은 가족/나홀로/힐링
// 처럼 동행자 유형이다). 그래서 한옥·전통 쪽 코스만 모으려면 제목 키워드로
// 걸러야 한다. 실호출로 확인한 건수: 전통 12, 문화유산 10, 민속 6, 선비 3,
// 한옥 2, 고택 2 — 중복 제거하면 30여 건이다.
const THEME_KEYWORDS = ["한옥", "고택", "전통", "민속", "선비", "문화유산"];

function stripHtml(text) {
  return (text ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** theme/schedule은 "----지자체-----"처럼 장식용 하이픈이 붙어 오는 경우가 있다. */
function cleanLabel(text) {
  const clean = stripHtml(text).replace(/^[-\s]+|[-\s]+$/g, "");
  return clean || null;
}

function mapCourse(item) {
  return {
    id: item.contentid,
    title: item.title,
    location: [item.addr1, item.addr2].filter(Boolean).join(" ") || null,
    image: item.firstimage || item.firstimage2 || null,
    areaCode: item.areacode ?? null,
  };
}

/**
 * 여행코스 목록. 지역코드로 좁힐 수 있고, 없으면 전국에서 가져온다.
 * @returns {Promise<{source: 'tourapi'|'unavailable', courses: Array, totalCount: number}>}
 */
export async function fetchCourses({ keyword: only, limit = COURSE_LIST_LIMIT } = {}) {
  if (!hasTourApiKey()) return { source: "unavailable", courses: [], totalCount: 0 };

  try {
    const keywords = only ? [only] : THEME_KEYWORDS;
    const results = await Promise.all(
      keywords.map((keyword) =>
        callKorService("searchKeyword2", {
          keyword,
          contentTypeId: COURSE_CONTENT_TYPE,
          numOfRows: "30",
        }).catch(() => ({ items: [] })),
      ),
    );

    // 여행코스는 대표이미지가 거의 없다(한옥·전통 주제는 전부 없음). 실호출로
    // 확인: searchKeyword2는 firstimage를 아예 안 주고, areaBasedList2도 해당
    // 코스들은 비어 있다. 그래서 이미지로 거르지 않고, 카드에서 경유지 첫 사진을
    // 썸네일로 가져다 쓴다(fetchCourseThumbnail).
    const byId = new Map();
    for (const { items } of results) {
      for (const item of items) {
        if (!byId.has(item.contentid)) byId.set(item.contentid, mapCourse(item));
      }
    }

    // 키워드 결과가 겹쳐서 API 총건수를 더하면 중복이 섞인다.
    // 중복 제거 후 실제로 모인 코스 수를 그대로 쓴다.
    const collected = [...byId.values()];
    return { source: "tourapi", courses: collected.slice(0, limit), totalCount: collected.length };
  } catch (err) {
    console.warn("[courseApi] 여행코스 목록 조회 실패", err);
    return { source: "unavailable", courses: [], totalCount: 0 };
  }
}

const detailCache = new Map();

/**
 * 코스 한 건의 개요(총거리/소요시간/테마)와 경유지 목록.
 *
 * detailInfo2 응답은 같은 경유지가 subnum 0,0,1,1… 로 중복돼 오는 경우가 있어
 * (실호출로 확인) 이름 기준으로 중복을 제거한다.
 */
export async function fetchCourseDetail(contentId) {
  if (detailCache.has(contentId)) return detailCache.get(contentId);

  try {
    const [introRes, infoRes, commonRes] = await Promise.all([
      callKorService("detailIntro2", { contentId, contentTypeId: COURSE_CONTENT_TYPE }),
      callKorService("detailInfo2", {
        contentId,
        contentTypeId: COURSE_CONTENT_TYPE,
        numOfRows: "30",
      }),
      callKorService("detailCommon2", { contentId }).catch(() => ({ items: [] })),
    ]);

    const intro = introRes.items[0] ?? {};
    const common = commonRes.items[0] ?? {};

    const seen = new Set();
    const waypoints = [];
    for (const item of infoRes.items) {
      const name = stripHtml(item.subname);
      if (!name || seen.has(name)) continue;
      seen.add(name);
      waypoints.push({
        name,
        image: item.subdetailimg || null,
        description: stripHtml(item.subdetailoverview) || null,
      });
    }

    const detail = {
      contentId,
      title: common.title ?? null,
      overview: stripHtml(common.overview) || null,
      distance: stripHtml(intro.distance) || null,
      takeTime: stripHtml(intro.taketime) || null,
      theme: cleanLabel(intro.theme),
      schedule: cleanLabel(intro.schedule),
      waypoints,
    };
    detailCache.set(contentId, detail);
    return detail;
  } catch (err) {
    console.warn(`[courseApi] 코스 상세(${contentId}) 조회 실패`, err);
    return null;
  }
}


const thumbnailCache = new Map();

/**
 * 목록 카드용 썸네일. 코스 자체에는 대표이미지가 없어서 첫 경유지 사진을 쓴다.
 * 목록에서 카드마다 부르므로 detailInfo2 한 번만 호출한다(상세 화면의
 * fetchCourseDetail은 intro/info/common 3번을 부르므로 목록에서는 쓰지 않는다).
 */
export async function fetchCourseThumbnail(contentId) {
  if (thumbnailCache.has(contentId)) return thumbnailCache.get(contentId);

  try {
    const { items } = await callKorService("detailInfo2", {
      contentId,
      contentTypeId: COURSE_CONTENT_TYPE,
      numOfRows: "5",
    });
    const image = items.find((item) => item.subdetailimg)?.subdetailimg ?? null;
    thumbnailCache.set(contentId, image);
    return image;
  } catch {
    return null;
  }
}

/**
 * 주제 필터. 여행코스에는 지역 정보가 없어서(areacode/addr1이 비어 있고
 * areaCode 파라미터로 거르면 0건) 지역 대신 주제 키워드로 나눈다.
 */
export const THEME_OPTIONS = [
  { keyword: "", label: "전체" },
  ...THEME_KEYWORDS.map((keyword) => ({ keyword, label: keyword })),
];
