export const regionFilters = [
  { id: "capital", label: "서울/경기" },
  { id: "yeongnam", label: "영남권" },
  { id: "honam", label: "호남권" },
  { id: "gangwon", label: "강원/충청" },
];

export const quickFilters = [
  { id: "all", label: "전체", icon: "grid" },
  { id: "unesco", label: "유네스코 세계유산", icon: "landmark" },
  { id: "night", label: "실시간 야간개장", icon: "moon" },
  { id: "congestion", label: "혼잡도 낮은순", icon: "gauge" },
  { id: "stay", label: "실시간 인근숙소순", icon: "bed" },
  { id: "route", label: "당일 여행경로", icon: "route" },
];

// 평점 정렬은 뺐다 — TourAPI가 평점을 주지 않아 정렬할 실제 값이 없다.
// "방문자 많은순"은 관광빅데이터(DataLabService)의 지역별 방문자수를 쓴다.
export const sortOptions = [
  { id: "popular", label: "TourAPI 기본순" },
  { id: "visitors", label: "방문자 많은순" },
  { id: "congestion", label: "혼잡도 낮은순" },
  { id: "name", label: "이름순" },
];
