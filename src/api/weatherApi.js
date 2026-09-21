/**
 * 기상청 예보 (공공데이터포털 기관코드 1360000).
 * - 단기예보 VilageFcstInfoService_2.0: 오늘~모레(약 3일)
 * - 중기예보 MidFcstInfoService: 4~10일 후
 *
 * 둘을 합쳐야 열흘치가 채워진다. 중기예보만 쓰면 오늘·내일이 빈다.
 * 집중률 예측이 30일이라 "언제 갈까"의 앞 열흘을 날씨로 보강하는 역할이다.
 *
 * 인증키는 TourAPI와 같은 공공데이터포털 키를 쓴다(포털 계정당 하나).
 * 다만 파라미터 규약이 관광공사와 달라(_type이 아니라 dataType, MobileOS 없음)
 * tourApiClient를 쓰지 않고 여기서 직접 부른다.
 */

import { withCache } from "./apiCache.js";

const KEY = import.meta.env.VITE_TOUR_API_KEY ?? "";
const BASE = "https://apis.data.go.kr/1360000";

async function callWeather(service, operation, params) {
  if (!KEY) return [];
  const query = new URLSearchParams({
    serviceKey: KEY,
    dataType: "JSON",
    numOfRows: "1000",
    pageNo: "1",
    ...params,
  });
  const url = `${BASE}/${service}/${operation}?${query.toString()}`;

  // TourAPI와 같은 이유로 Referer를 보내지 않는다(apiCache/tourApiClient 주석 참고).
  const data = await withCache(url, async () => {
    const res = await fetch(url, { referrerPolicy: "no-referrer" });
    if (!res.ok) throw new Error(`기상청 요청 실패 (HTTP ${res.status})`);
    return res.json();
  });

  const header = data?.response?.header;
  // 03 NO_DATA는 오류가 아니라 "그 시각 발표본이 아직 없음"이다.
  if (header?.resultCode === "03") return [];
  if (header && header.resultCode !== "00") throw new Error(header.resultMsg ?? "기상청 응답 오류");

  const item = data?.response?.body?.items?.item;
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

/**
 * 위경도 → 기상청 격자(nx, ny).
 * 기상청이 공개한 Lambert Conformal Conic 변환식을 그대로 옮긴 것이다.
 */
export function toGrid(lat, lng) {
  const RE = 6371.00877;
  const GRID = 5.0;
  const SLAT1 = (30.0 * Math.PI) / 180;
  const SLAT2 = (60.0 * Math.PI) / 180;
  const OLON = (126.0 * Math.PI) / 180;
  const OLAT = (38.0 * Math.PI) / 180;
  const XO = 43;
  const YO = 136;

  const re = RE / GRID;
  let sn =
    Math.tan(Math.PI * 0.25 + SLAT2 * 0.5) / Math.tan(Math.PI * 0.25 + SLAT1 * 0.5);
  sn = Math.log(Math.cos(SLAT1) / Math.cos(SLAT2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + SLAT1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(SLAT1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + OLAT * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + ((lat * Math.PI) / 180) * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = (lng * Math.PI) / 180 - OLON;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  return {
    nx: Math.floor(ra * Math.sin(theta) + XO + 0.5),
    ny: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5),
  };
}

function ymd(date) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

/**
 * 단기예보 발표 시각은 02·05·08·11·14·17·20·23시다.
 * 발표 직후에는 아직 자료가 올라오지 않으므로 한 텀 앞선 발표본을 쓴다.
 */
function latestBase(now) {
  const slots = [23, 20, 17, 14, 11, 8, 5, 2];
  const base = new Date(now.getTime() - 45 * 60 * 1000);
  const hour = base.getHours();
  const slot = slots.find((h) => hour >= h);
  if (slot === undefined) {
    const yesterday = new Date(base);
    yesterday.setDate(yesterday.getDate() - 1);
    return { base_date: ymd(yesterday), base_time: "2300" };
  }
  return { base_date: ymd(base), base_time: `${String(slot).padStart(2, "0")}00` };
}

const SKY = { 1: "맑음", 3: "구름많음", 4: "흐림" };
const PTY = { 0: null, 1: "비", 2: "비/눈", 3: "눈", 4: "소나기" };

/**
 * 좌표 기준 단기예보를 날짜별로 묶는다.
 *
 * @returns {Promise<Array<{ymd: string, sky: string, rainProb: number|null, min: number|null, max: number|null}>>}
 */
export async function fetchShortTermForecast({ lat, lng }) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
  try {
    const { nx, ny } = toGrid(lat, lng);
    const items = await callWeather("VilageFcstInfoService_2.0", "getVilageFcst", {
      ...latestBase(new Date()),
      nx: String(nx),
      ny: String(ny),
    });

    const byDate = new Map();
    for (const item of items) {
      const day = byDate.get(item.fcstDate) ?? { ymd: item.fcstDate, sky: null, rainProb: null, min: null, max: null };
      const value = Number(item.fcstValue);
      // 하루 대표값으로 낮(12시) 하늘 상태와 최고 강수확률을 쓴다.
      if (item.category === "SKY" && item.fcstTime === "1200") day.sky = SKY[value] ?? day.sky;
      if (item.category === "PTY" && PTY[value]) day.sky = PTY[value];
      if (item.category === "POP") day.rainProb = Math.max(day.rainProb ?? 0, value);
      if (item.category === "TMN") day.min = value;
      if (item.category === "TMX") day.max = value;
      byDate.set(item.fcstDate, day);
    }

    return [...byDate.values()].sort((a, b) => a.ymd.localeCompare(b.ymd));
  } catch (err) {
    console.warn("[weatherApi] 단기예보 조회 실패", err);
    return [];
  }
}

/**
 * 중기예보(4~10일 후)의 육상예보구역 코드.
 * 기상청이 시도 단위로 고정해 둔 값이라 API로 조회할 수 없어 표로 들고 있다.
 * 주소의 시도명 앞부분으로 찾는다("전북특별자치도"·"전라북도" 모두 "전북"/"전라"로 시작).
 */
const MID_REGIONS = [
  [["서울", "인천", "경기"], "11B00000"],
  [["강원"], "11D10000"],
  [["대전", "세종", "충남", "충청남"], "11C20000"],
  [["충북", "충청북"], "11C10000"],
  [["광주", "전남", "전라남"], "11F20000"],
  [["전북", "전라북"], "11F10000"],
  [["대구", "경북", "경상북"], "11H10000"],
  [["부산", "울산", "경남", "경상남"], "11H20000"],
  [["제주"], "11G00000"],
];

function midRegionId(address) {
  const text = String(address ?? "");
  const found = MID_REGIONS.find(([names]) => names.some((n) => text.startsWith(n)));
  return found?.[1] ?? null;
}

/** 중기예보 발표는 06시·18시 두 번이다. */
function midBaseTime(now) {
  const base = new Date(now.getTime() - 30 * 60 * 1000);
  if (base.getHours() >= 18) return `${ymd(base)}1800`;
  if (base.getHours() >= 6) return `${ymd(base)}0600`;
  const yesterday = new Date(base);
  yesterday.setDate(yesterday.getDate() - 1);
  return `${ymd(yesterday)}1800`;
}

/**
 * 주소 기준 중기 육상예보(4~10일 후).
 * 응답이 wf4Am·wf4Pm…wf10처럼 일수별 필드로 평평하게 오므로 날짜로 되돌린다.
 *
 * @returns {Promise<Array<{ymd: string, sky: string|null, rainProb: number|null}>>}
 */
export async function fetchMidTermForecast({ address }) {
  const regId = midRegionId(address);
  if (!regId) return [];
  try {
    const items = await callWeather("MidFcstInfoService", "getMidLandFcst", {
      regId,
      tmFc: midBaseTime(new Date()),
    });
    const row = items[0];
    if (!row) return [];

    const today = new Date();
    const days = [];
    for (let offset = 4; offset <= 10; offset += 1) {
      // 4~7일은 오전/오후가 나뉘고 8일부터는 하루 한 값이다. 오후 기준으로 통일한다.
      const sky = row[`wf${offset}Pm`] ?? row[`wf${offset}`] ?? null;
      const pop = row[`rnSt${offset}Pm`] ?? row[`rnSt${offset}`] ?? null;
      const date = new Date(today);
      date.setDate(date.getDate() + offset);
      days.push({
        ymd: ymd(date),
        sky: sky ? String(sky) : null,
        rainProb: Number.isFinite(Number(pop)) ? Number(pop) : null,
      });
    }
    return days;
  } catch (err) {
    console.warn("[weatherApi] 중기예보 조회 실패", err);
    return [];
  }
}

/**
 * 단기(0~3일) + 중기(4~10일)를 ymd로 색인한 하나의 표로 합친다.
 *
 * 겹치는 날은 더 정확한 단기예보를 쓰되 **항목 단위로** 합친다.
 * 단기예보는 발표 시각에 따라 경계일(예: 4일째)의 일부 항목만 내려주는데,
 * 통째로 덮어쓰면 그날 하늘 상태가 중기예보에 있는데도 빈칸이 된다.
 */
export async function fetchWeatherByDate({ lat, lng, address }) {
  const [short, mid] = await Promise.all([
    fetchShortTermForecast({ lat, lng }),
    fetchMidTermForecast({ address }),
  ]);
  const map = new Map();
  for (const day of mid) map.set(day.ymd, day);
  for (const day of short) {
    const base = map.get(day.ymd) ?? {};
    map.set(day.ymd, {
      ymd: day.ymd,
      sky: day.sky ?? base.sky ?? null,
      rainProb: day.rainProb ?? base.rainProb ?? null,
      min: day.min ?? base.min ?? null,
      max: day.max ?? base.max ?? null,
    });
  }
  return map;
}
