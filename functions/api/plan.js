/**
 * AI 맞춤 코스 생성 (Cloudflare Pages Function).
 *
 * 브라우저가 TourAPI에서 실제 장소 후보를 모아 보내면, 여기서 OpenAI에
 * "이 목록 안에서만 골라 순서와 설명을 쓰라"고 요청한다.
 *
 * LLM에게 장소를 지어내게 하지 않는 것이 핵심이다. 응답에 후보에 없는
 * contentId가 섞여 오면 서버에서 걸러내므로, 화면에는 TourAPI에 실재하는
 * 장소만 남는다.
 *
 * OPENAI_API_KEY는 Cloudflare 환경변수(또는 로컬 .dev.vars)에만 둔다.
 * 브라우저 번들에는 들어가지 않는다.
 */

const MODEL = "gpt-4o-mini";
const MAX_STOPS = 6;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function buildPrompt({ conditions, candidates }) {
  const list = candidates
    .map(
      (c, i) =>
        `${i + 1}. [id=${c.contentId}] ${c.name} — ${c.address ?? "주소 미상"}\n   ${(c.overview ?? "").slice(0, 160)}`,
    )
    .join("\n");

  return `너는 한국 한옥·전통문화 여행 코스를 짜는 플래너다.

아래 "후보 장소"는 한국관광공사 TourAPI에 실제로 등록된 곳이다.
반드시 이 목록에 있는 장소만 사용하고, 목록에 없는 장소를 새로 만들어내지 마라.

[여행 조건]
- 동행자: ${conditions.party ?? "미지정"}
- 기간: ${conditions.duration ?? "미지정"}
- 이동 수단: ${conditions.transport ?? "미지정"}
- 분위기: ${conditions.mood ?? "미지정"}

[후보 장소]
${list}

조건에 가장 잘 맞는 장소를 3~${MAX_STOPS}곳 고르고 방문 순서를 정해라.
각 장소마다 왜 이 조건에 맞는지 한 문장으로 설명하고, 권장 방문 시각을 붙여라.

다음 JSON 형식으로만 답하라(설명 문장 없이 JSON만):
{
  "title": "코스 제목 (15자 내외)",
  "summary": "이 코스를 한 문장으로 소개",
  "stops": [
    { "contentId": "후보의 id", "time": "10:00", "reason": "이 조건에 맞는 이유 한 문장" }
  ]
}`;
}

export async function onRequestPost({ request, env }) {
  if (!env.OPENAI_API_KEY) {
    return json({ error: "OPENAI_API_KEY가 설정되지 않았습니다." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "잘못된 요청 형식입니다." }, 400);
  }

  const { conditions = {}, candidates = [] } = body;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return json({ error: "후보 장소가 없습니다." }, 400);
  }

  let aiResult;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: buildPrompt({ conditions, candidates }) }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("OpenAI 오류", res.status, detail.slice(0, 300));
      return json({ error: `AI 응답 실패 (HTTP ${res.status})` }, 502);
    }

    const data = await res.json();
    aiResult = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
  } catch (err) {
    console.error("AI 호출 실패", err);
    return json({ error: "AI 호출에 실패했습니다." }, 502);
  }

  // 지어낸 장소 차단: 후보에 없는 contentId는 버린다.
  const byId = new Map(candidates.map((c) => [String(c.contentId), c]));
  const stops = (aiResult.stops ?? [])
    .map((stop) => {
      const place = byId.get(String(stop.contentId));
      if (!place) return null;
      return {
        contentId: place.contentId,
        contentTypeId: place.contentTypeId ?? null,
        name: place.name,
        address: place.address ?? null,
        image: place.image ?? null,
        time: typeof stop.time === "string" ? stop.time : null,
        reason: typeof stop.reason === "string" ? stop.reason : null,
      };
    })
    .filter(Boolean)
    .slice(0, MAX_STOPS);

  if (stops.length === 0) {
    return json({ error: "조건에 맞는 코스를 만들지 못했습니다." }, 422);
  }

  return json({
    title: typeof aiResult.title === "string" ? aiResult.title : "AI 맞춤 코스",
    summary: typeof aiResult.summary === "string" ? aiResult.summary : null,
    stops,
    // 화면에서 "AI가 고른 곳은 전부 실제 등록 장소"임을 밝히는 데 쓴다.
    candidateCount: candidates.length,
  });
}
