/**
 * 주소 문자열 → 법정동 시도/시군구 코드.
 *
 * 집중률 API(TatsCnctrRateService)는 contentId가 아니라 areaCd + signguCd로 조회한다.
 * 그런데 TourAPI 항목이 들고 있는 areacode/sigungucode는 관광공사 자체 코드라
 * 법정동 코드와 다르다(북촌 = areacode 1, sigungucode 23 / 법정동 11, 11110).
 * 그래서 주소 문자열을 ldongCode2가 주는 공식 명칭과 대조해 코드를 얻는다.
 *
 * 코드 목록은 KorService2를 거치므로 apiCache의 하루 캐시를 그대로 탄다.
 */

import { callKorService } from "./tourApiClient.js";

// 주소에 옛 이름이 남아 있는 항목이 있다. ldongCode2의 현재 명칭으로 맞춰준다.
const ALIASES = {
  전라북도: "전북특별자치도",
  강원도: "강원특별자치도",
  광주광역시: "전남광주통합특별시",
};

let regionsPromise = null;
const districtCache = new Map();

function loadRegions() {
  // 시도 목록은 16건뿐이라 한 번만 받아 재사용한다.
  regionsPromise ??= callKorService("ldongCode2", { numOfRows: "50" })
    .then((res) => res.items.map((i) => ({ code: String(i.code), name: String(i.name) })))
    .catch((err) => {
      regionsPromise = null; // 실패는 캐시하지 않는다 — 다음 호출에서 다시 시도한다.
      throw err;
    });
  return regionsPromise;
}

function loadDistricts(regionCode) {
  if (!districtCache.has(regionCode)) {
    const promise = callKorService("ldongCode2", { lDongRegnCd: regionCode, numOfRows: "100" })
      .then((res) => res.items.map((i) => ({ code: String(i.code), name: String(i.name) })))
      .catch((err) => {
        districtCache.delete(regionCode);
        throw err;
      });
    districtCache.set(regionCode, promise);
  }
  return districtCache.get(regionCode);
}

/**
 * "전북특별자치도 전주시 완산구 태조로 44" → { areaCd: "52", signguCd: "52111" }
 *
 * 시군구는 "전주시"와 "전주시 완산구"가 모두 존재하므로 가장 긴 이름을 고른다.
 * 짧은 쪽을 고르면 구 단위 예측이 있는 도시에서 엉뚱한 값을 받는다.
 *
 * @returns {Promise<{areaCd: string, signguCd: string}|null>}
 */
export async function resolveRegion(address) {
  if (!address) return null;
  try {
    const text = String(address).trim();
    const regions = await loadRegions();

    const region =
      regions.find((r) => text.startsWith(r.name)) ??
      regions.find((r) => {
        const alias = Object.entries(ALIASES).find(([old]) => text.startsWith(old));
        return alias ? r.name === alias[1] : false;
      });
    if (!region) return null;

    // 세종시는 시군구가 없어 시도 코드 자체가 5자리다.
    if (region.code.length === 5) return { areaCd: region.code.slice(0, 2), signguCd: region.code };

    const oldName = Object.keys(ALIASES).find((old) => text.startsWith(old));
    const rest = text.slice((oldName ?? region.name).length).trim();

    const districts = await loadDistricts(region.code);
    const matches = districts.filter((d) => rest.startsWith(d.name));
    if (matches.length === 0) return null;

    const best = matches.reduce((a, b) => (b.name.length > a.name.length ? b : a));
    return { areaCd: region.code, signguCd: `${region.code}${best.code}` };
  } catch (err) {
    console.warn(`[regionCodes] 지역 코드 해석 실패: ${address}`, err);
    return null;
  }
}
