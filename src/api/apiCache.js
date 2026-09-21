/**
 * TourAPI 응답 캐시 (localStorage).
 *
 * 공공데이터포털 개발계정은 일일 요청 한도가 있어서(초과 시 429
 * LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR), 같은 화면을 다시 열 때마다
 * 호출이 나가면 금방 소진된다. 응답을 하루 동안 보관해 재방문 비용을 없앤다.
 *
 * 캐시 키에는 serviceKey를 넣지 않는다 — 키가 localStorage에 남지 않도록
 * 쿼리에서 제거한 뒤 해시한다.
 *
 * 한도를 넘겨 호출이 실패하면 만료된 캐시라도 돌려준다(stale-while-error).
 * 발표 도중 한도가 떨어져도 화면이 통째로 비지 않게 하기 위함이다.
 */

const PREFIX = "teoum:tourapi:";
const TTL_MS = 24 * 60 * 60 * 1000;

/** URL에서 serviceKey를 뺀 뒤 짧은 해시로 만든다. */
function cacheKey(url) {
  const clean = String(url).replace(/serviceKey=[^&]*&?/, "");
  let hash = 0;
  for (let i = 0; i < clean.length; i += 1) {
    hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  }
  return `${PREFIX}${hash.toString(36)}`;
}

function readEntry(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // 사생활 보호 모드 등에서 접근이 막힐 수 있다. 캐시 없이 동작한다.
    return null;
  }
}

/** 우리 네임스페이스만 비운다(다른 저장값은 건드리지 않는다). */
function clearOwnEntries() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // 무시
  }
}

function writeEntry(key, data) {
  const payload = JSON.stringify({ t: Date.now(), d: data });
  try {
    localStorage.setItem(key, payload);
  } catch {
    // 용량이 차면 우리 캐시를 비우고 한 번만 다시 시도한다.
    clearOwnEntries();
    try {
      localStorage.setItem(key, payload);
    } catch {
      // 그래도 안 되면 캐시를 포기한다(기능에는 영향 없음).
    }
  }
}

/**
 * 캐시를 거쳐 요청한다.
 *
 * @param {string} url 실제 요청 URL(serviceKey 포함)
 * @param {() => Promise<any>} request 캐시가 없을 때 수행할 실제 호출
 * @returns {Promise<any>}
 */
export async function withCache(url, request) {
  const key = cacheKey(url);
  const entry = readEntry(key);

  if (entry && Date.now() - entry.t < TTL_MS) return entry.d;

  try {
    const data = await request();
    writeEntry(key, data);
    return data;
  } catch (err) {
    // 한도 초과·네트워크 오류 시 만료된 캐시라도 쓴다.
    if (entry) {
      console.warn("[apiCache] 호출 실패, 만료된 캐시로 대체합니다.", err);
      return entry.d;
    }
    throw err;
  }
}
