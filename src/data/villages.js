import jeonjuImage from "../assets/images/villages/jeonju.png";
import andongImage from "../assets/images/villages/andong.png";
import gyeongjuImage from "../assets/images/villages/gyeongju.png";
import seoulBukchonImage from "../assets/images/villages/seoul-bukchon.png";

import jeonjuMapImage from "../assets/images/villages-map/jeonju.png";
import andongMapImage from "../assets/images/villages-map/andong.png";
import gyeongjuMapImage from "../assets/images/villages-map/gyeongju.png";
import seoulBukchonMapImage from "../assets/images/villages-map/seoul-bukchon.png";

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
export const villages = [
  {
    id: "jeonju",
    name: "전주 한옥마을",
    region: "전북 전주",
    shortDesc:
      "700여 채 기와집이 다닥다닥 붙어있는 국내 최대 규모 전통 도심 한옥지구.",
    description:
      "700여 채 기와집과 다닥다닥 이어진 골목길이 700년 역사를 그대로 간직한 곳. 경기전, 전동성당과 어우러진 도심 속 전통미.",
    linkLabel: "도보 순환 코스",
    image: jeonjuImage,
    mapImage: jeonjuMapImage,
    tag: "당일코스 인기",
    tagIcon: "walk",
    congestion: { level: "low", label: "낮음", score: 3.3 },
    address: "전라북도 전주시 완산구 교동 일원",
    travel: { from: "서울 경부 출발 기준", duration: "약 2시간 40분 (208km)" },
    highlight: "조선왕조 태조부터 경기전 및 어진박물관",
    event: "전통 상설 야간개장 프로그램 (금~토 19:30)",
    lat: 35.8182727649,
    lng: 127.1536126138,
    // 연관 관광지 조회용(TarRlteTarService1). areaCd/signguCd는 TourAPI의
    // areaCode가 아니라 법정동(행정표준) 코드다 — 실호출로 확인. 전주시 완산구.
    related: { areaCd: "52", signguCd: "52111", keyword: "경기전" },
    featured: true,
  },
  {
    id: "andong",
    name: "안동 하회마을",
    region: "경북 안동",
    shortDesc: "낙동강이 휘감아 도는 600년 원형 그대로의 유네스코 세계유산.",
    description:
      "낙동강이 감싸 도는 600년 원형 유지 씨족마을. 종가 문화의 원형, 병산서원, 만송정 솔밭까지 함께 즐길 수 있는 곳.",
    linkLabel: "유네스코 세계유산",
    image: andongImage,
    mapImage: andongMapImage,
    tag: "당일코스 인기",
    tagIcon: "home",
    congestion: { level: "medium", label: "여유", score: 4.0 },
    address: "경상북도 안동시 풍천면 하회종가길",
    travel: { from: "서울 경부 출발 기준", duration: "약 3시간 10분 (243km)" },
    highlight: "병산서원, 만송정 솔밭, 하회별신굿탈놀이",
    event: "하회별신굿탈놀이 상설공연 (주말 15:00)",
    lat: 36.5506148855,
    lng: 128.5282935032,
    // 연관 관광지 조회용(TarRlteTarService1). areaCd/signguCd는 TourAPI의
    // areaCode가 아니라 법정동(행정표준) 코드다 — 실호출로 확인. 안동시.
    related: { areaCd: "47", signguCd: "47170", keyword: "하회마을" },
    featured: true,
    unesco: true,
  },
  {
    id: "gyeongju",
    name: "경주 교촌마을",
    region: "경북 경주",
    shortDesc: "신라 천년 고도의 최부자 고택과 전통 한식이 살아있는 마을.",
    description:
      "조선시대 대대로 내려온 최부자 고택과 월성교 인근 전통 한식, 교촌떡 등 먹거리까지 그대로 보존한 전통 건축미.",
    linkLabel: "역사·문화체험",
    image: gyeongjuImage,
    mapImage: gyeongjuMapImage,
    tag: "실시간 맛집",
    tagIcon: "food",
    congestion: { level: "medium", label: "보통", score: 4.1 },
    address: "경상북도 경주시 교촌안길",
    travel: { from: "서울 경부 출발 기준", duration: "약 3시간 20분 (270km)" },
    highlight: "경주 최부자 고택, 월정교 야경",
    event: "정자초롱 야간산책 프로그램 (매일 19:00)",
    lat: 35.8296308266,
    lng: 129.2146933674,
    // 연관 관광지 조회용(TarRlteTarService1). areaCd/signguCd는 TourAPI의
    // areaCode가 아니라 법정동(행정표준) 코드다 — 실호출로 확인. 경주시.
    related: { areaCd: "47", signguCd: "47130", keyword: "교촌한옥마을" },
    featured: true,
  },
  {
    id: "seoul-bukchon",
    name: "서울 북촌 & 서촌",
    // "서울 북촌 & 서촌"은 실제 관광지명이 아니라 큐레이션 명칭이라 TourAPI
    // 키워드 검색이 잘 안 맞는다. 실주소 보강 시 이 이름으로 대신 검색한다.
    searchKeyword: "북촌한옥마을",
    region: "서울 종로",
    shortDesc: "경복궁과 창덕궁 사이, 도심 한복판 한옥 밀집 지역.",
    description:
      "경복궁과 창덕궁 사이에 자리 잡은 도심 속 한옥 밀집 지역. 몇 대째 이어지는 전통가옥과 골목 갤러리, 공방이 함께한다.",
    linkLabel: "도심 문화 산책",
    image: seoulBukchonImage,
    mapImage: seoulBukchonMapImage,
    tag: "실시간 도보 산책",
    tagIcon: "walk",
    congestion: { level: "high", label: "혼잡", score: 4.6 },
    address: "서울특별시 종로구 계동길 일원",
    travel: { from: "서울 시청 기준", duration: "약 20분 (5km)" },
    highlight: "익선동 골목, 경복궁 옆 한옥, 인사동",
    event: "한복 거리 퍼레이드 (매월 마지막 토요일)",
    lat: 37.5790529392,
    lng: 126.9867060298,
    // 연관 관광지 조회용(TarRlteTarService1). areaCd/signguCd는 TourAPI의
    // areaCode가 아니라 법정동(행정표준) 코드다 — 실호출로 확인. 종로구.
    related: { areaCd: "11", signguCd: "11110", keyword: "북촌한옥마을" },
    featured: true,
  },
];

export const featuredVillages = villages.filter((v) => v.featured);
