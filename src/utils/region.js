const REGION_GROUP_PREFIXES = {
  capital: ["서울", "경기", "인천"],
  yeongnam: ["경북", "경남", "부산", "대구", "울산"],
  honam: ["전북", "전남", "광주", "제주"],
  gangwon: ["강원", "충북", "충남", "대전", "세종"],
};

export function regionGroupOf(regionLabel) {
  return Object.entries(REGION_GROUP_PREFIXES).find(([, prefixes]) =>
    prefixes.some((p) => regionLabel.startsWith(p))
  )?.[0];
}

// TourAPI 응답의 정식 행정구역명 → 앱 전체에서 쓰는 짧은 표기
const PROVINCE_SHORT_NAME = [
  ["서울", "서울"],
  ["인천", "인천"],
  ["부산", "부산"],
  ["대구", "대구"],
  ["광주", "광주"],
  ["대전", "대전"],
  ["울산", "울산"],
  ["세종", "세종"],
  ["경기", "경기"],
  ["강원", "강원"],
  ["충청북도", "충북"],
  ["충청남도", "충남"],
  ["전북", "전북"],
  ["전라남도", "전남"],
  ["경상북도", "경북"],
  ["경상남도", "경남"],
  ["제주", "제주"],
];

/**
 * "전북특별자치도 전주시 완산구 기린대로 99" 같은 실제 주소를
 * villages.js 큐레이션 데이터와 같은 짧은 표기("전북 전주")로 변환한다.
 * TourAPI에서 새로 받아온 관광지를 우리 리스트에 합칠 때 사용.
 */
export function shortRegionLabelFromAddress(addr1 = "") {
  const province = PROVINCE_SHORT_NAME.find(([full]) => addr1.startsWith(full));
  if (!province) return addr1.split(" ")[0] ?? "";

  const city = addr1.split(" ")[1]?.replace(/(특별자치시|특별자치도|광역시|특별시|시|군|구)$/, "");
  return city ? `${province[1]} ${city}` : province[1];
}
