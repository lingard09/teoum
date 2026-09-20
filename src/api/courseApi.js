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
export async function fetchCourses({ areaCode, limit = COURSE_LIST_LIMIT } = {}) {
  if (!hasTourApiKey()) return { source: "unavailable", courses: [], totalCount: 0 };

  try {
    const params = {
      contentTypeId: COURSE_CONTENT_TYPE,
      numOfRows: String(limit * 2), // 사진 없는 항목을 걸러내고도 limit을 채우도록 넉넉히
      arrange: "O", // 대표이미지 있는 항목 우선
    };
    if (areaCode) params.areaCode = areaCode;

    const { items, totalCount } = await callKorService("areaBasedList2", params);
    const courses = items
      .filter((item) => item.firstimage || item.firstimage2)
      .slice(0, limit)
      .map(mapCourse);

    return { source: "tourapi", courses, totalCount };
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

/** 지역 필터용. TourAPI areaCode 체계(관광정보 서비스 기준). */
export const AREA_OPTIONS = [
  { code: "", label: "전국" },
  { code: "1", label: "서울" },
  { code: "6", label: "부산" },
  { code: "31", label: "경기" },
  { code: "32", label: "강원" },
  { code: "33", label: "충북" },
  { code: "34", label: "충남" },
  { code: "35", label: "경북" },
  { code: "36", label: "경남" },
  { code: "37", label: "전북" },
  { code: "38", label: "전남" },
  { code: "39", label: "제주" },
];
