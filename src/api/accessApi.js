/**
 * 한국관광공사_무장애 여행 정보 (KorWithService2).
 * data.go.kr/data/15101897 — 국문 서비스와 같은 contentId 체계를 쓰므로,
 * 우리가 이미 들고 있는 contentId로 그대로 조회할 수 있다.
 *
 * 커버리지는 전수가 아니다(실측: 우리가 노출하는 장소 100곳 중 17곳).
 * 대신 북촌·남산골·은평·전주처럼 방문이 몰리는 곳은 들어 있다.
 * 없는 곳에서는 섹션을 통째로 숨긴다 — 빈 항목을 "정보 없음"으로 채우지 않는다.
 */

import { callWithService } from "./tourApiClient.js";

// 응답 필드 → 화면 라벨. 여기 없는 필드는 그리지 않는다.
// 순서가 곧 화면에 나오는 순서다(이동 → 시설 → 안내 순).
const FIELD_LABELS = [
  ["parking", "장애인 주차"],
  ["route", "이동 경로"],
  ["exit", "주출입구"],
  ["elevator", "엘리베이터"],
  ["wheelchair", "휠체어 대여"],
  ["restroom", "장애인 화장실"],
  ["braileblock", "점자블록"],
  ["helpdog", "보조견 동반"],
  ["guidehuman", "안내 요원"],
  ["audioguide", "오디오·음성 안내"],
  ["brailepromotion", "점자 안내물"],
  ["signguide", "수어 안내"],
  ["stroller", "유모차 대여"],
  ["lactationroom", "수유실"],
  ["infantsfamilyetc", "영유아 편의"],
  ["blindhandicapetc", "시각장애 참고"],
  ["hearinghandicapetc", "청각장애 참고"],
];

// 원문에는 "_무장애 편의시설" 같은 분류 꼬리표와 줄바꿈이 섞여 있다.
function clean(value) {
  if (!value) return null;
  const text = String(value)
    .replace(/_무장애\s*편의시설/g, "")
    .replace(/\s*\n\s*/g, " · ")
    .trim();
  return text || null;
}

/**
 * 한 장소의 무장애 정보를 라벨이 붙은 배열로 돌려준다.
 * 정보가 없으면 빈 배열이라 호출부에서 length로 바로 분기할 수 있다.
 *
 * @returns {Promise<Array<{key: string, label: string, value: string}>>}
 */
export async function fetchAccessibility(contentId) {
  if (!contentId) return [];
  try {
    const { items } = await callWithService("detailWithTour2", { contentId });
    const item = items[0];
    if (!item) return [];

    return FIELD_LABELS.map(([key, label]) => {
      const value = clean(item[key]);
      return value ? { key, label, value } : null;
    }).filter(Boolean);
  } catch (err) {
    // 무장애는 부가 정보다. 실패해도 상세페이지 전체를 막지 않는다.
    console.warn(`[accessApi] 무장애 정보(${contentId}) 조회 실패`, err);
    return [];
  }
}
