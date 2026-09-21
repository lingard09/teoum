/**
 * 한국관광공사_관광지 집중률 방문자 추이 예측 (TatsCnctrRateService).
 * data.go.kr/data/15128555 — 통신사 이동 데이터로 산출한 **향후 30일 예측치**다.
 *
 * DataLabService(지역별 방문자수)는 지나간 방문자 수라 "지금 붐빈다"까지만 말할 수 있다.
 * 이 API는 앞으로 30일을 주므로 "언제 가면 한산한가"를 답할 수 있다.
 *
 * 값은 0~100 지수다(2018년 이후 최고치를 100으로 정규화).
 * 포털 기준: 50 미만 여유 / 50~80 보통 / 80 이상 혼잡.
 *
 * 주의: 장소를 contentId가 아니라 **관광지 이름(tAtsNm)**으로 식별한다.
 * 이름이 조금이라도 다르면 결과가 비므로, 없을 때는 아무것도 그리지 않는다.
 */

import { callCongestionService } from "./tourApiClient.js";
import { resolveRegion } from "./regionCodes.js";

export const CONGESTION_LEVELS = [
  { level: "high", label: "혼잡", labelEn: "Busy", min: 80 },
  { level: "medium", label: "보통", labelEn: "Moderate", min: 50 },
  { level: "low", label: "여유", labelEn: "Quiet", min: 0 },
];

export function congestionLevel(rate) {
  return CONGESTION_LEVELS.find((l) => rate >= l.min) ?? CONGESTION_LEVELS.at(-1);
}

// "20260926" → Date. 문자열을 그대로 쪼개야 타임존 영향을 받지 않는다.
function parseYmd(ymd) {
  const text = String(ymd);
  return new Date(Number(text.slice(0, 4)), Number(text.slice(4, 6)) - 1, Number(text.slice(6, 8)));
}

/**
 * 한 장소의 향후 30일 혼잡 예측.
 *
 * @param {{title: string, address: string}} place
 * @returns {Promise<Array<{date: Date, ymd: string, rate: number, level: string, label: string}>>}
 *          데이터가 없으면 빈 배열
 */
export async function fetchCongestionForecast({ title, address }) {
  if (!title || !address) return [];
  try {
    const region = await resolveRegion(address);
    if (!region) return [];

    // tAtsNm으로 걸러 받으면 30행이면 끝난다. 필터 없이 받으면 시군구 전체가
    // 내려와(종로구만 3,390행) 캐시 용량을 잡아먹는다.
    const { items } = await callCongestionService("tatsCnctrRatedList", {
      areaCd: region.areaCd,
      signguCd: region.signguCd,
      tAtsNm: title,
      numOfRows: "40",
    });

    return items
      .map((item) => {
        const rate = Number(item.cnctrRate);
        if (!Number.isFinite(rate)) return null;
        const { level, label, labelEn } = congestionLevel(rate);
        return { date: parseYmd(item.baseYmd), ymd: String(item.baseYmd), rate, level, label, labelEn };
      })
      .filter(Boolean)
      .sort((a, b) => a.ymd.localeCompare(b.ymd));
  } catch (err) {
    console.warn(`[congestionApi] 집중률 예측(${title}) 조회 실패`, err);
    return [];
  }
}

/**
 * 목록·지도에서 쓰는 요약. 오늘 값과 앞으로 2주 중 가장 한산한 날을 함께 준다.
 * 데이터가 없는 장소는 null이라 배지를 그리지 않는다.
 *
 * @returns {Promise<{rate: number, level: string, label: string, quietest: object|null}|null>}
 */
export async function fetchCongestionSummary(place) {
  const forecast = await fetchCongestionForecast(place);
  if (forecast.length === 0) return null;
  const [today] = forecast;
  return { ...today, quietest: quietestDay(forecast) };
}

/**
 * 예측 중 가장 한산한 날. 추천 문구("화요일이 가장 한산합니다")에 쓴다.
 * 오늘은 "언제 갈까"의 후보가 아니므로 내일부터 본다.
 */
export function quietestDay(forecast) {
  const future = forecast.slice(1);
  if (future.length === 0) return null;
  return future.reduce((best, day) => (day.rate < best.rate ? day : best));
}

/**
 * 여러 장소의 예측을 합쳐 "코스 전체가 가장 한산한 날"을 고른다.
 *
 * 코스에는 집중률 데이터가 있는 장소와 없는 장소가 섞인다. 날짜별로 **데이터가
 * 있는 장소들의 평균**을 쓰되, 비교 대상이 적은 날이 유리해지지 않도록
 * 가장 많은 장소가 커버된 날 수를 기준으로 삼는다.
 *
 * 오늘은 "언제 갈까"의 후보가 아니므로 내일부터 본다.
 *
 * 기본 열흘로 끊는 것은 기상청 예보가 10일까지이기 때문이다. 집중률만 보면
 * 더 먼 날이 한산할 수 있지만, 날씨를 같이 보여줄 수 없는 날을 추천하면
 * "언제 갈까"의 근거가 반쪽이 된다.
 *
 * @param {Array<Array>} forecasts fetchCongestionForecast 결과들
 * @param {{withinDays?: number}} [options]
 * @returns {{ymd: string, date: Date, rate: number, level: string, label: string, labelEn: string, places: number}|null}
 */
export function bestVisitDay(forecasts, { withinDays = 10 } = {}) {
  const withData = forecasts.filter((f) => f.length > 0);
  if (withData.length === 0) return null;

  const byDate = new Map();
  for (const forecast of withData) {
    for (const day of forecast.slice(1, withinDays + 1)) {
      const entry = byDate.get(day.ymd) ?? { ymd: day.ymd, date: day.date, sum: 0, places: 0 };
      entry.sum += day.rate;
      entry.places += 1;
      byDate.set(day.ymd, entry);
    }
  }
  if (byDate.size === 0) return null;

  const maxPlaces = Math.max(...[...byDate.values()].map((e) => e.places));
  const comparable = [...byDate.values()].filter((e) => e.places === maxPlaces);
  const best = comparable.reduce((a, b) => (b.sum < a.sum ? b : a));

  const rate = best.sum / best.places;
  const { level, label, labelEn } = congestionLevel(rate);
  return { ymd: best.ymd, date: best.date, rate, level, label, labelEn, places: best.places };
}
