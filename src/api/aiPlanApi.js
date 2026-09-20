/**
 * AI 맞춤 코스 생성 클라이언트.
 *
 * 장소 후보는 이 파일에서 TourAPI로 직접 모은다(전통체험 + 한옥 숙소 + 한옥마을).
 * 후보를 서버 함수(/api/plan)에 넘기면 OpenAI가 그중에서 골라 순서와 이유를 쓴다.
 * 서버가 후보에 없는 장소를 걸러내므로 결과에는 실재하는 곳만 남는다.
 *
 * OpenAI 키는 서버(Cloudflare Functions)에만 있다 — 이 파일은 키를 모른다.
 */
import { callKorService, hasTourApiKey } from "./tourApiClient.js";

const CANDIDATE_SOURCES = [
  // 전통체험
  { contentTypeId: "12", cat1: "A02", cat2: "A0203", cat3: "A02030200" },
  // 한옥 숙소
  { contentTypeId: "32", keyword: "한옥" },
  // 한옥마을
  { contentTypeId: "12", keyword: "한옥마을" },
];

function stripHtml(text) {
  return (text ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** 후보 장소 수집. 지역어가 있으면 그 지역 쪽으로 좁힌다. */
async function collectCandidates({ region, limit = 24 }) {
  const results = await Promise.all(
    CANDIDATE_SOURCES.map((source) => {
      const { contentTypeId, keyword, ...category } = source;
      const operation = keyword ? "searchKeyword2" : "areaBasedList2";
      const params = { contentTypeId, numOfRows: "15", arrange: "O", ...category };
      if (keyword) params.keyword = region ? `${region} ${keyword}` : keyword;
      return callKorService(operation, params).catch(() => ({ items: [] }));
    }),
  );

  const byId = new Map();
  for (const { items } of results) {
    for (const item of items) {
      if (byId.has(item.contentid)) continue;
      // 지역어가 있으면 주소로 한 번 더 거른다(키워드 검색은 제목만 본다).
      const address = [item.addr1, item.addr2].filter(Boolean).join(" ");
      if (region && address && !address.includes(region)) continue;
      byId.set(item.contentid, {
        contentId: item.contentid,
        name: item.title,
        address: address || null,
        image: item.firstimage || item.firstimage2 || null,
      });
    }
  }
  return [...byId.values()].slice(0, limit);
}

/** 후보 몇 곳의 소개문구를 채운다. AI가 고를 근거가 되므로 앞쪽만 가져온다. */
async function attachOverviews(candidates, count = 10) {
  await Promise.all(
    candidates.slice(0, count).map(async (candidate) => {
      try {
        const { items } = await callKorService("detailCommon2", {
          contentId: candidate.contentId,
        });
        candidate.overview = stripHtml(items[0]?.overview).slice(0, 200) || null;
      } catch {
        candidate.overview = null;
      }
    }),
  );
  return candidates;
}

/**
 * 조건에 맞는 AI 코스를 만든다.
 * @returns {Promise<{ok: true, plan: object} | {ok: false, message: string}>}
 */
export async function generateAiPlan(conditions) {
  if (!hasTourApiKey()) {
    return { ok: false, message: "TourAPI 키가 없어 장소 후보를 모을 수 없습니다." };
  }

  let candidates;
  try {
    candidates = await attachOverviews(await collectCandidates({ region: conditions.region }));
  } catch (err) {
    console.warn("[aiPlanApi] 후보 수집 실패", err);
    return { ok: false, message: "장소 후보를 불러오지 못했습니다." };
  }

  if (candidates.length === 0) {
    return { ok: false, message: "조건에 맞는 장소 후보가 없습니다. 지역을 바꿔 보세요." };
  }

  try {
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ conditions, candidates }),
    });
    const data = await res.json();

    if (!res.ok) return { ok: false, message: data?.error ?? "AI 코스 생성에 실패했습니다." };
    return { ok: true, plan: data };
  } catch (err) {
    console.warn("[aiPlanApi] AI 코스 생성 실패", err);
    return { ok: false, message: "AI 코스 생성 요청이 실패했습니다." };
  }
}
