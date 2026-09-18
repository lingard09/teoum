// 한옥스테이 & 로컬길 숙소 큐레이션 목록 목업 데이터 (피그마 시안 문구 그대로). API 붙이면 이 파일을 대체.
import { icons } from '../assets/icons/index.js'
import andongYemijeongStay from '../assets/images/andong-yemijeong-stay.png'
import eunpyeongNumaruStay from '../assets/images/eunpyeong-numaru-stay.png'
import jeonjuHakindang from '../assets/images/jeonju-hakindang.png'
import hahoeYangjindang from '../assets/images/hahoe-yangjindang.png'
import gyeongjuWoljeongjae from '../assets/images/gyeongju-woljeongjae.png'
import gangneungSeongyojang from '../assets/images/gangneung-seongyojang.png'

export const hero = {
  heading: ['마루에 앉아 하늘을 바라보는', '고택의 하루'],
  description: [
    "문화체육관광부·한국관광공사 품질인증 '한국관광 품질인증(KQ)' 고택부터 300년 종가 독채, 현대",
    '적 편의를 갖춘 프리미엄 한옥스테이 80여 곳을 엄선했습니다.',
  ],
  metrics: [
    { label: '공식 인증 고택', value: '84', unit: '선' },
    { label: '평균 만족도', value: '4.94', unit: '/5.0' },
  ],
}

export const searchFields = [
  { id: 'region', label: '지역 선택', value: '전국 전체 (권역별)', icon: icons.stayRegion },
  { id: 'dates', label: '체크인 / 체크아웃', value: '2026.05.02 (토) - 05.03 (일)', icon: icons.stayCalendar },
  { id: 'guests', label: '숙박 인원', value: '성인 2명', icon: icons.stayGuests },
  { id: 'theme', label: '테마 · 공간', value: '전체 테마', icon: icons.stayTheme },
]

export const searchCta = '한옥 스테이 찾기'

export const categories = [
  { id: 'all', label: '전체 스테이 (84)', icon: icons.stayCatAll },
  { id: 'heritage', label: '300년 이상 명품 고택 독채 (18)', icon: icons.stayCatHeritage },
  { id: 'spa', label: '모던 누마루 자쿠지 & 스파 (24)', icon: icons.stayCatSpa },
  { id: 'garden', label: '돌담길 정원 & 툇마루 차담 (28)', icon: icons.stayCatGarden },
  { id: 'kq', label: '한국관광 품질인증(KQ) 전용 (42)', icon: icons.stayCatKq },
]

export const regions = ['전국', '안동/하회', '전주 한옥마을', '경주 교촌', '서울 북촌·은평', '강릉 선교장']

export const conditionFilters = [
  { id: 'private', label: '독채 전용', defaultChecked: true },
  { id: 'breakfast', label: '종가 조식 제공', defaultChecked: true },
  { id: 'tea', label: '다도 세트', defaultChecked: false },
]

export const totalCount = 84
export const pageCount = 14

export const stays = [
  {
    id: 'andong-yemijeong',
    image: andongYemijeongStay,
    badges: [
      { label: '독채 고택', tone: 'dark' },
      { label: 'KQ 최고등급 인증', tone: 'mint', icon: icons.stayCertBadge },
    ],
    location: '경북 안동시 정상동',
    subtitle: '300년 풍산 류씨 종가 고택',
    title: ['안동 예미정 본채 (300년 사대부 독', '채 고택)'],
    description: ['기준 4인 (최대 6인) · 침실 2개 · 마루 대청 · 아침 종가', '칠첩반상 조식 포함'],
    amenities: ['전통 툇마루 다도', '황토 온돌방', '종가 다과상'],
    rating: 4.96,
    reviewCount: 184,
    price: 280000,
  },
  {
    id: 'eunpyeong-numaru',
    image: eunpyeongNumaruStay,
    badges: [
      { label: '북한산 파노라마 뷰', tone: 'dark' },
      { label: '모던 힐링 한옥', tone: 'neutral' },
    ],
    location: '서울 은평구 진관동 (은평한옥마을)',
    subtitle: '모던 누마루 프라이빗 힐링',
    title: ['은평 일인일잔 누마루 스테이'],
    description: ['기준 2인 (최대 3인) · 통유리 마루 · 북한산 의상봉 조망', '· 핸드드립 다기 세트 구비'],
    amenities: ['북한산 조망 마루', '웰컴 드립백', '은평역 셔틀'],
    rating: 4.92,
    reviewCount: 312,
    price: 240000,
  },
  {
    id: 'jeonju-hakindang',
    image: jeonjuHakindang,
    badges: [
      { label: '태조 어진 인근', tone: 'dark' },
      { label: '전통 정원 인증', tone: 'mint', icon: icons.stayCertBadge },
    ],
    location: '전북 전주시 완산구 풍남동',
    subtitle: '전주 최상급 문화재 고택',
    title: ["전주 경기전 돌담길 '학인당' 행랑", '채'],
    description: ['기준 2인 · 백년 궁중 정원 산책로 · 명창 다담과 판소리', '체험 연계 · 전주비빔밥 명가 할인'],
    amenities: ['궁중 정원', '판소리 체험 연계', '향토 차담'],
    rating: 4.89,
    reviewCount: 420,
    price: 190000,
  },
  {
    id: 'hahoe-yangjindang',
    image: hahoeYangjindang,
    badges: [
      { label: '유네스코 고택', tone: 'dark' },
      { label: '종손 직접 호스팅', tone: 'mint', icon: icons.stayHostBadge },
    ],
    location: '경북 안동시 풍천면 (하회마을)',
    subtitle: '유네스코 세계유산 600년 역사',
    title: ['하회마을 양진당 묵계재 (풍산 류씨 종택)'],
    description: ['기준 2인 · 600년 역사 유네스코 세계유산 마을 중심 ·', '아침 하회별신굿탈놀이 전수관 입장권 증정'],
    amenities: ['별신굿 관람권', '고택 해설 투어', '부용대 조망'],
    rating: 4.98,
    reviewCount: 95,
    price: 220000,
  },
  {
    id: 'gyeongju-woljeongjae',
    image: gyeongjuWoljeongjae,
    badges: [
      { label: '노천 히노끼 스파', tone: 'dark' },
      { label: '프라이빗 정원', tone: 'mint', icon: icons.stayGardenBadge },
    ],
    location: '경북 경주시 교촌길 (월정교 도보 3분)',
    subtitle: '월정교 야경 · 프리미엄 자쿠지',
    title: ['경주 교촌 월정재 (프라이빗 노천', '자쿠지 한옥)'],
    description: ['기준 2인 (최대 4인) · 월정교 야경 뷰 · 야외 편백 노천탕', '· 웰컴 경주 교동법주 시음키트 제공'],
    amenities: ['노천 편백탕', '교동법주 증정', '월정교 도보 3분'],
    rating: 4.97,
    reviewCount: 268,
    price: 340000,
  },
  {
    id: 'gangneung-seongyojang',
    image: gangneungSeongyojang,
    badges: [
      { label: '국가민속문화재', tone: 'dark' },
      { label: '99칸 전통 사대부 가옥', tone: 'neutral' },
    ],
    location: '강원 강릉시 저동리 (경포호수 인근)',
    subtitle: '조선 후기 300년 대저택 별채',
    title: ['강릉 선교장 홍예헌 별채'],
    description: ['기준 3인 · 활래정 연못 조망 · 솔숲 산책로 · 전통', '차담 다과 서비스 포함'],
    amenities: ['활래정 연못뷰', '해송 숲 산책로', '선교장 프리패스'],
    rating: 4.94,
    reviewCount: 175,
    price: 260000,
  },
]
