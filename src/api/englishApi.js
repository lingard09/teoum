/**
 * 한국관광공사_영문 관광정보 서비스 (EngService2).
 * data.go.kr/data/15101753 — 상세페이지를 영어로 읽기 위한 용도로만 쓴다.
 *
 * ⚠️ 언어별로 contentId가 완전히 다르다(북촌: 국문 126537 / 영문 561382).
 * contentTypeId 체계도 다르다(관광지 12→76, 숙박 32→80).
 * 그래서 "같은 id로 언어만 바꾸기"가 불가능하다.
 *
 * 대신 영문 제목이 "Bukchon Hanok Village (북촌한옥마을)"처럼 한글 원제를 괄호로
 * 달고 있어서, 한글 제목으로 영문 서비스를 검색하면 짝을 찾을 수 있다(실측 6곳 중 5곳).
 *
 * 이 모듈은 읽기 전용이다. 스크랩·저장한 코스·예약은 전부 국문 contentId로
 * 저장돼 있으므로 저장 경로에는 영문 id가 끼어들지 않는다.
 */

import { callEngService } from "./tourApiClient.js";

function stripHtml(text) {
  return String(text ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .trim();
}

// "Bukchon Hanok Village (북촌한옥마을)" → "Bukchon Hanok Village"
function stripKoreanSuffix(title) {
  return String(title ?? "")
    .replace(/\s*\([^()]*[가-힣][^()]*\)\s*$/, "")
    .trim();
}

/**
 * 한글 제목으로 영문 상세를 찾는다.
 * 짝이 없으면 null이라, 호출부에서 영어 전환 자체를 감춘다.
 *
 * @returns {Promise<{title: string, overview: string|null, address: string|null, homepage: string|null}|null>}
 */
export async function fetchEnglishDetail(koreanTitle) {
  if (!koreanTitle) return null;
  try {
    const { items } = await callEngService("searchKeyword2", {
      keyword: koreanTitle,
      numOfRows: "5",
    });

    // 괄호 안 한글 원제가 정확히 같은 항목만 짝으로 본다.
    // 이름이 비슷한 다른 장소가 걸리는 것을 막는다.
    const match =
      items.find((i) => String(i.title ?? "").includes(`(${koreanTitle})`)) ?? items[0];
    if (!match) return null;

    const { items: details } = await callEngService("detailCommon2", {
      contentId: match.contentid,
    });
    const common = details[0] ?? match;

    return {
      title: stripKoreanSuffix(common.title) || stripKoreanSuffix(match.title),
      overview: stripHtml(common.overview) || null,
      address: [common.addr1, common.addr2].filter(Boolean).join(" ") || null,
      homepage: stripHtml(common.homepage).split(/\s+/)[0] || null,
    };
  } catch (err) {
    console.warn(`[englishApi] 영문 상세(${koreanTitle}) 조회 실패`, err);
    return null;
  }
}
