import {
  callKorService,
  callRelatedService,
  callDataLabService,
} from "./tourApiClient.js";

// 관광지(contentTypeId=12) — TourAPI 서비스 분류 코드
export const CONTENT_TYPE_ATTRACTION = "12";

function mapAttractionItem(item) {
  return {
    contentId: item.contentid,
    contentTypeId: item.contenttypeid,
    name: item.title,
    address: [item.addr1, item.addr2].filter(Boolean).join(" "),
    image: item.firstimage || item.firstimage2 || null,
    lng: item.mapx ? Number(item.mapx) : null,
    lat: item.mapy ? Number(item.mapy) : null,
    tel: item.tel || null,
    distanceMeters: item.dist ? Number(item.dist) : null,
    raw: item,
  };
}

/**
 * 키워드로 관광지 검색 (국문 관광정보 서비스 - searchKeyword2).
 * 예: searchAttractionsByKeyword("전주 한옥마을")
 */
export async function searchAttractionsByKeyword(
  keyword,
  { contentTypeId = CONTENT_TYPE_ATTRACTION, numOfRows = 10 } = {}
) {
  const { items } = await callKorService("searchKeyword2", {
    keyword,
    contentTypeId,
    numOfRows: String(numOfRows),
    arrange: "O", // 제목순 정렬
  });
  return items.map(mapAttractionItem);
}

/**
 * 좌표 주변 관광지 목록 (국문 관광정보 서비스 - locationBasedList2).
 * 지도 페이지의 "주변 관광지"류 기능, 상세 페이지 확장 시 사용.
 */
export async function fetchNearbyAttractions({
  lng,
  lat,
  radius = 3000,
  contentTypeId = CONTENT_TYPE_ATTRACTION,
  numOfRows = 10,
}) {
  const { items } = await callKorService("locationBasedList2", {
    mapX: String(lng),
    mapY: String(lat),
    radius: String(radius),
    contentTypeId,
    numOfRows: String(numOfRows),
    arrange: "E", // 거리순 정렬
  });
  return items.map(mapAttractionItem);
}

/**
 * 관광지 상세 공통정보 (국문 관광정보 서비스 - detailCommon2).
 * overview(소개글), 대표이미지, 주소, 좌표 등을 포함.
 */
export async function fetchAttractionDetail(contentId) {
  // ...YN 부가 옵션을 함께 보내면 INVALID_REQUEST_PARAMETER_ERROR(defaultYN)가 난다
  // (실호출로 확인). contentId만 보내도 overview·homepage를 포함한 전체 필드가 온다.
  const { items } = await callKorService("detailCommon2", { contentId });
  const item = items[0];
  if (!item) return null;
  return {
    ...mapAttractionItem(item),
    overview: item.overview ?? null,
    homepage: item.homepage ?? null,
  };
}

/**
 * 광역지자체 레거시 지역코드 (KorService2 areaCode2로 실키 호출해서 확인한 값).
 * areaBasedList2/areaCode2가 쓰는 코드이며, TarRlteTarService1의 areaCd와도
 * 동일하게 동작하는 것을 실제 요청으로 확인했다.
 */
export const AREA_CODE = {
  서울: "1",
  인천: "2",
  대전: "3",
  대구: "4",
  광주: "5",
  부산: "6",
  울산: "7",
  세종: "8",
  경기: "31",
  강원: "32",
  충북: "33",
  충남: "34",
  경북: "35",
  경남: "36",
  전북: "37",
  전남: "38",
  제주: "39",
};

/**
 * 관광지별 연관 관광지 정보 (TarRlteTarService1 - searchKeyword1).
 * data.go.kr/data/15128560 — Tmap 내비게이션 이동 패턴 기반 연관 관광지.
 *
 * 실키로 직접 호출해서 필수 파라미터가 keyword 하나가 아니라
 * areaCd(광역코드) + signguCd(시군구코드) + baseYm(기준년월, YYYYMM)까지
 * 4개 모두 필수인 것을 확인했다. signguCd는 KorService2 상세조회 응답의
 * lDongSignguCd(법정동 시군구코드) 값과 같은 체계로 보이나, 정확한 코드는
 * 활용신청 상세의 Swagger 문서로 한 번 더 확인 후 areaCd별 표를 채워 쓰는 걸 권장.
 */
export async function fetchRelatedAttractionsByKeyword(
  keyword,
  { areaCd, signguCd, baseYm, numOfRows = 10 }
) {
  const { items } = await callRelatedService("searchKeyword1", {
    keyword,
    areaCd,
    signguCd,
    baseYm,
    numOfRows: String(numOfRows),
  });
  return items.map((item) => ({
    contentId: item.rlteCid ?? item.contentid,
    name: item.rlteTatsNm ?? item.title,
    contentTypeId: item.rlteCtgryLclsNm ?? item.contenttypeid,
    raw: item,
  }));
}

function formatYmd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * 광역지자체 일별 방문자수 (DataLabService - metcoRegnVisitrDDList).
 * data.go.kr/data/15101972 — 관광 빅데이터(KT/SKT 통신데이터) 기반 방문자수.
 * 실키로 startYmd/endYmd(YYYYMMDD) 파라미터로 실제 데이터 수신까지 확인했다.
 *
 * 주의: areaCode를 요청 파라미터로 넣으면 INVALID_REQUEST_PARAMETER_ERROR가
 * 난다(실제 호출로 확인). 이 오퍼레이션은 지역 필터링을 지원하지 않고 기간 내
 * 전체 지역(17개 광역) x 3개 방문자 유형(현지인/외지인/외국인) 행을 다 돌려주므로,
 * 필요한 지역은 응답의 areaNm(예: "서울특별시")으로 클라이언트에서 걸러야 한다.
 */
export async function fetchRegionalVisitorTrend({ startYmd, endYmd }) {
  const { items } = await callDataLabService("metcoRegnVisitrDDList", {
    startYmd,
    endYmd,
    numOfRows: "500",
  });
  return items;
}

/**
 * DataLabService 응답의 areaNm과 매칭시킬 지역명. villages.js의 region
 * 필드(예: "전북 전주")에서 앞 2글자를 뽑아 이 표로 찾는다.
 */
export const DATALAB_AREA_NAME = {
  서울: "서울특별시",
  인천: "인천광역시",
  경기: "경기도",
  부산: "부산광역시",
  대구: "대구광역시",
  광주: "광주광역시",
  대전: "대전광역시",
  울산: "울산광역시",
  세종: "세종특별자치시",
  경북: "경상북도",
  경남: "경상남도",
  전북: "전북특별자치도",
  전남: "전라남도",
  충북: "충청북도",
  충남: "충청남도",
  강원: "강원특별자치도",
  제주: "제주특별자치도",
};

/**
 * 최근 N일 구간에서 특정 지역(areaNm 부분일치)의 가장 최신 날짜 방문자수
 * 합계(현지인+외지인+외국인)를 반환한다. 정부 통계 특성상 며칠~몇 주 지연되어
 * 집계되므로, 넉넉한 구간을 조회한 뒤 실제로 값이 들어있는 가장 최근 날짜를
 * 골라 쓴다. 데이터가 전혀 없으면 null.
 */
export async function fetchLatestAreaVisitorCount(areaNamePrefix, { lookbackDays = 60 } = {}) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - lookbackDays);

  const allItems = await fetchRegionalVisitorTrend({
    startYmd: formatYmd(start),
    endYmd: formatYmd(end),
  });
  const items = allItems.filter((item) => item.areaNm?.includes(areaNamePrefix));
  if (items.length === 0) return null;

  const latestYmd = items.reduce(
    (max, item) => (item.baseYmd > max ? item.baseYmd : max),
    items[0].baseYmd
  );
  const total = items
    .filter((item) => item.baseYmd === latestYmd)
    .reduce((sum, item) => sum + Number(item.touNum ?? 0), 0);

  return { baseYmd: latestYmd, visitorCount: total };
}

/**
 * 17개 광역지자체 전체의 최신일자 방문자수를 "짧은 지역명"(서울, 경북 …)
 * 기준 Map으로 한 번에 반환한다. 지역별로 fetchLatestAreaVisitorCount를
 * 반복 호출하면 매번 같은 500행짜리 기간 데이터를 다시 받아오게 되므로,
 * 여러 마을의 혼잡도를 한꺼번에 계산할 때는 이 함수를 한 번만 부르는 게 낫다.
 */
export async function fetchLatestVisitorCountsByRegion({ lookbackDays = 60 } = {}) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - lookbackDays);

  const allItems = await fetchRegionalVisitorTrend({
    startYmd: formatYmd(start),
    endYmd: formatYmd(end),
  });

  const result = new Map();
  for (const [shortName, fullName] of Object.entries(DATALAB_AREA_NAME)) {
    const items = allItems.filter((item) => item.areaNm === fullName);
    if (items.length === 0) continue;
    const latestYmd = items.reduce(
      (max, item) => (item.baseYmd > max ? item.baseYmd : max),
      items[0].baseYmd
    );
    const total = items
      .filter((item) => item.baseYmd === latestYmd)
      .reduce((sum, item) => sum + Number(item.touNum ?? 0), 0);
    result.set(shortName, { baseYmd: latestYmd, visitorCount: total });
  }
  return result;
}
