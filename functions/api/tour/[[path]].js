/**
 * 공공데이터포털 프록시 (Cloudflare Pages Function).
 *
 * 왜 두는가 — 두 가지 문제를 같이 푼다.
 *
 * 1) 일일 한도가 방문자 수에 비례했다.
 *    브라우저가 직접 부르면 방문자 한 명당 약 130회가 든다(실측). 개발계정은
 *    하루 1,000회라 7명이면 소진되고, 그 뒤 방문자는 캐시가 없어 모든 목록이
 *    빈 화면으로 보였다(429 재현으로 확인). 여기서 엣지에 캐시해두면 같은
 *    질의는 하루 한 번만 실제로 나가고 나머지는 전부 캐시가 받는다.
 *
 * 2) 서비스키가 번들에 박혔다.
 *    VITE_ 접두사 변수는 빌드 때 JS에 그대로 인라인된다. 이제 키는 이 함수만
 *    알고, 브라우저는 /api/tour/... 로만 부른다.
 *
 * 경로는 공공데이터포털 경로를 그대로 이어붙인다.
 *   /api/tour/B551011/KorService2/searchKeyword2?...  (한국관광공사)
 *   /api/tour/1360000/MidFcstInfoService/getMidLandFcst?...  (기상청)
 */

// 열어줄 기관만 명시한다. 임의의 주소로 요청을 대신 보내주는 통로가 되지 않도록.
const ALLOWED_AGENCIES = new Set(["B551011", "1360000"]);

const UPSTREAM = "https://apis.data.go.kr";
const CACHE_SECONDS = 24 * 60 * 60;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export async function onRequestGet({ request, env, params, waitUntil }) {
  const segments = Array.isArray(params.path) ? params.path : [params.path];
  if (segments.length < 2 || !ALLOWED_AGENCIES.has(segments[0])) {
    return json({ error: "허용되지 않은 경로입니다." }, 400);
  }

  const serviceKey = env.VITE_TOUR_API_KEY ?? env.TOUR_API_KEY ?? "";
  if (!serviceKey) return json({ error: "서비스키가 설정되지 않았습니다." }, 500);

  const incoming = new URL(request.url);

  // 캐시 키에는 서비스키를 넣지 않는다. 키가 캐시 메타데이터에 남지 않게 하고,
  // 키를 교체해도 캐시가 통째로 무효화되지 않게 한다.
  const cacheKey = new Request(`${incoming.origin}${incoming.pathname}${incoming.search}`, {
    method: "GET",
  });
  const cache = caches.default;

  const cached = await cache.match(cacheKey);
  if (cached) {
    const hit = new Response(cached.body, cached);
    hit.headers.set("x-teoum-cache", "hit");
    return hit;
  }

  const upstream = new URL(`${UPSTREAM}/${segments.join("/")}`);
  upstream.search = incoming.search;
  upstream.searchParams.set("serviceKey", serviceKey);

  let res;
  try {
    // data.go.kr은 Referer에 쿼리스트링이 있으면 400을 준다(NOTES 참고).
    // 서버 간 호출이라 Referer가 붙지 않지만, 명시해두어 의도를 남긴다.
    res = await fetch(upstream.toString(), {
      headers: { accept: "application/json" },
      referrerPolicy: "no-referrer",
    });
  } catch (err) {
    return json({ error: `상위 API 호출 실패: ${err.message}` }, 502);
  }

  const body = await res.text();

  // 실패 응답은 캐시하지 않는다. 한도 초과(429)나 일시 장애를 하루 동안
  // 붙잡고 있으면 복구된 뒤에도 계속 실패하게 된다.
  const cacheable = res.ok && !body.includes("LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS");

  const out = new Response(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json; charset=utf-8",
      "cache-control": cacheable ? `public, max-age=${CACHE_SECONDS}` : "no-store",
      "x-teoum-cache": "miss",
    },
  });

  if (cacheable) waitUntil(cache.put(cacheKey, out.clone()));
  return out;
}
