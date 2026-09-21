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
  { level: "high", label: "혼잡", min: 80 },
  { level: "medium", label: "보통", min: 50 },
  { level: "low", label: "여유", min: 0 },
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
        const { level, label } = congestionLevel(rate);
        return { date: parseYmd(item.baseYmd), ymd: String(item.baseYmd), rate, level, label };
      })
      .filter(Boolean)
      .sort((a, b) => a.ymd.localeCompare(b.ymd));
  } catch (err) {
    console.warn(`[congestionApi] 집중률 예측(${title}) 조회 실패`, err);
    return [];
  }
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
