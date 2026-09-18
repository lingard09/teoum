/**
 * 한옥스테이 데이터 계층 (TourAPI 숙박, contentTypeId=32).
 *
 * "한옥"/"고택" 키워드로 검색해서 실제 등록된 숙소를 가져오고, 상세조회
 * (detailIntro2)로 객실 타입·체크인/아웃·편의시설을 채운다. 실호출로 확인한
 * 건수는 한옥 143건, 고택 38건.
 *
 * 평점/리뷰수는 만들지 않는다 — TourAPI는 관광정보 API일 뿐 리뷰 플랫폼이
 * 아니라 평점을 제공하지 않는다. 대신 API가 실제로 주는 값(객실 타입, 체크인
 * 시각, 주차, 문의 전화)을 카드에 노출한다.
 *
 * 키가 없거나 실패하면 stays.js의 큐레이션 목업으로 폴백한다.
 */
import { callKorService, hasTourApiKey } from "./tourApiClient.js";

const STAY_CONTENT_TYPE = "32";
const KEYWORDS = ["한옥", "고택"];

// 카드마다 상세를 부르기 때문에 목록이 길수록 호출 수가 배로 늘어난다.
// 공공데이터포털 일일 트래픽을 감안해 노출 개수를 제한한다.
const API_ITEM_LIMIT = 12;

function stripHtml(text) {
  return (text ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/** detailIntro2의 편의시설 플래그(문자열 "0"/"1")를 사람이 읽는 라벨로 바꾼다. */
const AMENITY_LABELS = {
  barbecue: "바비큐",
  campfire: "캠프파이어",
  publicbath: "공용 목욕장",
  sauna: "사우나",
  beverage: "음료 서비스",
  bicycle: "자전거 대여",
  fitness: "피트니스",
  seminar: "세미나실",
  sports: "스포츠 시설",
};

function amenitiesFrom(intro) {
  const list = Object.entries(AMENITY_LABELS)
    .filter(([key]) => String(intro?.[key] ?? "0") === "1")
    .map(([, label]) => label);
  if (intro?.parkinglodging && /가능|무료|있음/.test(intro.parkinglodging)) {
    list.unshift("주차 가능");
  }
  return list;
}

function mapStay(item) {
  return {
    id: `api-${item.contentid}`,
    contentId: item.contentid,
    name: item.title,
    location: [item.addr1, item.addr2].filter(Boolean).join(" "),
    image: item.firstimage || item.firstimage2 || null,
    tel: item.tel || null,
    lat: item.mapy ? Number(item.mapy) : null,
    lng: item.mapx ? Number(item.mapx) : null,
    isApiOnly: true,
  };
}

/**
 * 한옥/고택 숙소 목록. 키워드 두 개의 결과를 합치고 contentId로 중복을 제거한다.
 * @returns {Promise<{source: 'tourapi'|'fallback', stays: Array}>}
 */
export async function fetchStays({ numOfRows = 24 } = {}) {
  if (!hasTourApiKey()) return { source: "fallback", stays: [] };

  try {
    const results = await Promise.all(
      KEYWORDS.map((keyword) =>
        callKorService("searchKeyword2", {
          keyword,
          contentTypeId: STAY_CONTENT_TYPE,
          numOfRows: String(numOfRows),
          arrange: "O", // 대표이미지가 있는 항목 우선
        }),
      ),
    );

    const byId = new Map();
    for (const { items } of results) {
      for (const item of items) {
        // 사진이 없는 숙소는 카드가 비어 보여서 제외한다.
        if (!item.firstimage && !item.firstimage2) continue;
        if (!byId.has(item.contentid)) byId.set(item.contentid, mapStay(item));
      }
    }

    return { source: "tourapi", stays: [...byId.values()].slice(0, API_ITEM_LIMIT) };
  } catch (err) {
    console.warn("[stayApi] 숙박 목록 조회 실패, 큐레이션 목업으로 대체합니다.", err);
    return { source: "fallback", stays: [] };
  }
}

/**
 * 숙소 한 곳의 상세(객실 타입, 체크인/아웃, 편의시설, 문의 전화).
 * 목록 카드에 바로 필요한 값이라 카드가 보일 때 하나씩 채운다.
 */
const detailCache = new Map();

export async function fetchStayDetail(contentId) {
  if (detailCache.has(contentId)) return detailCache.get(contentId);

  try {
    const { items } = await callKorService("detailIntro2", {
      contentId,
      contentTypeId: STAY_CONTENT_TYPE,
    });
    const intro = items[0];
    if (!intro) return null;

    // roomcount는 "2실"로 올 때도, 그냥 "5"로 올 때도 있어 표기를 통일한다.
    const rawCount = (intro.roomcount || "").trim();
    // roomtype은 "별채 매실 / 고택(안방) / 뜰안채 효실 등"처럼 길게 오기도 해서
    // 배지에 넣을 수 있게 첫 항목만 쓴다.
    const rawType = (intro.roomtype || "").trim();

    const detail = {
      roomCount: rawCount ? (/^\d+$/.test(rawCount) ? `${rawCount}실` : rawCount) : null,
      roomType: rawType ? rawType.split("/")[0].trim() : null,
      checkIn: intro.checkintime || null,
      checkOut: intro.checkouttime || null,
      parking: intro.parkinglodging || null,
      tel: stripHtml(intro.infocenterlodging) || null,
      amenities: amenitiesFrom(intro),
    };
    detailCache.set(contentId, detail);
    return detail;
  } catch (err) {
    console.warn(`[stayApi] 숙소 상세(${contentId}) 조회 실패, 생략합니다.`, err);
    return null;
  }
}

/** 소개문구. 목록 응답에는 없어서 필요할 때만 따로 가져온다. */
export async function fetchStayOverview(contentId) {
  try {
    const { items } = await callKorService("detailCommon2", { contentId });
    return stripHtml(items[0]?.overview) || null;
  } catch {
    return null;
  }
}
