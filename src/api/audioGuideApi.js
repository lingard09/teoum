/**
 * 한국관광공사_관광지 오디오 가이드 "오디(Odii)".
 * data.go.kr/data/15101971 — 음성 파일과 함께 **해설 대본**이 내려온다.
 *
 * 대본이 있다는 게 핵심이다. 재생 UI를 만들지 않아도 마을 상세에 해설로 바로 붙일 수 있다.
 *
 * 이름 검색(storySearchList)은 다른 지역 동명 장소가 섞인다
 * (실측: "북촌"으로 찾으면 안동의 북촌댁이 먼저 나온다).
 * 우리는 상세페이지에서 좌표를 이미 들고 있으므로 좌표 기반으로 찾는다.
 */

import { callOdiiService } from "./tourApiClient.js";

const DEFAULT_RADIUS_M = 700;

// "북촌한옥마을" → "북촌". 좌표 반경 안에는 이웃 장소 해설도 함께 잡히므로
// (북촌 반경 700m 안에 조계사·우정총국이 있다) 이름이 겹치는 해설을 앞으로 보낸다.
function coreName(title) {
  return String(title ?? "")
    .replace(/\[.*?\]/g, "")
    .replace(/(한옥마을|민속마을|한옥촌|마을|한옥)\s*$/, "")
    .trim();
}

function clean(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 좌표 주변의 오디오 해설을 가져온다.
 *
 * @param {{lat: number, lng: number}} point
 * @param {{radius?: number, limit?: number}} [options]
 * @returns {Promise<Array<{id: string, title: string, audioTitle: string, script: string, audioUrl: string|null}>>}
 */
export async function fetchAudioStories(
  { lat, lng, title },
  { radius = DEFAULT_RADIUS_M, limit = 6 } = {},
) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
  try {
    const { items } = await callOdiiService("storyLocationBasedList", {
      langCode: "ko",
      mapX: String(lng),
      mapY: String(lat),
      radius: String(radius),
      numOfRows: "50",
    });

    const seen = new Set();
    const stories = [];

    for (const item of items) {
      const script = clean(item.script);
      // 대본이 없는 항목은 우리 화면에서 보여줄 게 없다.
      if (script.length < 40) continue;

      const storyTitle = clean(item.title);
      if (!storyTitle || seen.has(storyTitle)) continue;
      seen.add(storyTitle);

      stories.push({
        id: String(item.stlid ?? item.stid ?? storyTitle),
        title: storyTitle,
        audioTitle: clean(item.audioTitle) || storyTitle,
        script,
        audioUrl: item.audioUrl ? String(item.audioUrl).replace(/^http:/, "https:") : null,
      });
    }

    // 이름이 겹치는 해설을 먼저. 같은 순위끼리는 API가 준 순서(가까운 순)를 지킨다.
    const core = coreName(title);
    if (core) {
      stories.sort((a, b) => Number(b.title.includes(core)) - Number(a.title.includes(core)));
    }

    return stories.slice(0, limit);
  } catch (err) {
    console.warn("[audioGuideApi] 오디오 해설 조회 실패", err);
    return [];
  }
}
