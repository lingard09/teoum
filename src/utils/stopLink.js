/**
 * AI 코스 정류장의 링크 목적지.
 *
 * 정류장에는 숙소·체험·관광지가 섞여 있는데 전부 예약 페이지로 보내고 있었다.
 * 체험하기에서 결제 경로를 없앤 뒤로는 그게 우회로가 돼서, 관광지인 북촌한옥마을에도
 * 숙박 요금표와 "94,000원 결제" 버튼이 붙었다.
 *
 * 숙박(contentTypeId 32)만 예약으로 보내고 나머지는 상세페이지로 보낸다.
 * 종류를 모르는 경우(예전에 저장돼 contentTypeId가 없는 코스)도 상세로 보낸다 —
 * 결제 화면을 잘못 띄우는 쪽이 더 나쁘기 때문이다.
 */

const STAY_CONTENT_TYPE_ID = "32";

export function stopLink(stop) {
  const isStay = String(stop?.contentTypeId ?? "") === STAY_CONTENT_TYPE_ID;
  return isStay
    ? { to: `/stays/reserve?contentId=${stop.contentId}`, label: "예약" }
    : { to: `/experiences/${stop.contentId}`, label: "상세" };
}
