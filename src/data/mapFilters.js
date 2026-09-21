export const regionFilters = [
  { id: "capital", label: "서울/경기" },
  { id: "yeongnam", label: "영남권" },
  { id: "honam", label: "호남권" },
  { id: "gangwon", label: "강원/충청" },
];

// 남은 두 개만 실제로 동작한다. 걷어낸 네 개의 사정:
//   유네스코 세계유산 / 실시간 야간개장
//     - 큐레이션 목업의 unesco·event 필드를 보고 거르던 것이다. 더미 데이터를
//       없애면서(villages = []) 필드가 사라져 누르면 0곳이 나왔다.
//       TourAPI에는 이 둘을 가리는 값이 없어 되살릴 방법도 없다.
//   실시간 인근숙소순 / 당일 여행경로
//     - MapSearchPage에 해당 분기가 아예 없어 눌러도 목록이 그대로였다.
// 되지 않는 버튼을 남겨두는 것보다 없는 편이 낫다고 보고 지운다.
export const quickFilters = [
  { id: "all", label: "전체", icon: "grid" },
  { id: "congestion", label: "혼잡도 낮은순", icon: "gauge" },
];

// 평점 정렬은 뺐다 — TourAPI가 평점을 주지 않아 정렬할 실제 값이 없다.
// "방문자 많은순"은 관광빅데이터(DataLabService)의 지역별 방문자수를 쓴다.
export const sortOptions = [
  { id: "popular", label: "TourAPI 기본순" },
  { id: "visitors", label: "방문자 많은순" },
  { id: "congestion", label: "혼잡도 낮은순" },
  { id: "name", label: "이름순" },
];
