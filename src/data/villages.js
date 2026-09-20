/**
 * Mock 한옥마을 데이터셋.
 * 추후 한국관광공사 TourAPI(국문관광정보 서비스) 연동 시
 * src/api/villageApi.js 의 fetch 함수 내부 구현만 교체하면 되도록
 * 필드 구조를 API 응답에 대응하기 쉬운 형태로 설계했다.
 *
 * image: 홈 큐레이션 카드용, mapImage: 지도 탐색 목록 카드용 (Figma 디자인 원본 이미지)
 */
// 평점/리뷰수 필드는 두지 않는다. TourAPI에는 평점 데이터가 없고, 시안의
// "★ 4.90 (4.2만)" 값을 그대로 박아두면 실데이터처럼 보이기 때문이다.
// 더미 없는 버전: 큐레이션 마을을 두지 않는다.
// 목록은 전부 TourAPI 검색 결과(villageApi.fetchExtraApiVillages)로 채운다.
export const villages = []
;

export const featuredVillages = []
