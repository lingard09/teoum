// 스토리 & 문화체험 목록 탐색 목업 데이터 (피그마 시안 문구 그대로). API 붙이면 이 파일을 대체.
import { icons } from '../assets/icons/index.js'
import bukchonJagaSoban from '../assets/images/bukchon-jaga-soban.png'
import jeonjuHanji from '../assets/images/jeonju-hanji.png'
import hahoeYeotgangjeong from '../assets/images/hahoe-yeotgangjeong.png'
import gyeongjuBeopjuBrewing from '../assets/images/gyeongju-beopju-brewing.png'
import namwonGwanghalluPansori from '../assets/images/namwon-gwanghallu-pansori.png'
import icheonPotteryWheel from '../assets/images/icheon-pottery-wheel.png'

export const hero = {
  heading: ['장인의 숨결과 시간이 머무는', '전국 전통 문화체험'],
  description: [
    '한국관광공사 TourAPI에서 한옥·공방·한지·도예 등 전통문화 키워드로',
    '검색한 체험 시설입니다. 프로그램과 운영시간은 공공데이터 원본입니다.',
  ],
}

export const categories = [
  { id: 'all', label: '전체 보기', icon: icons.categoryAll },
  { id: 'craft', label: '전통 공예 (나전칠기·도예·한지)', icon: icons.categoryCraft },
  { id: 'tea', label: '다도 & 전통주 (궁중다도·소주도가)', icon: icons.categoryTea },
  { id: 'food', label: '음식 & 미식 (종가음식·장담그기)', icon: icons.categoryFood },
  { id: 'hanbok', label: '한복 & 예절 (궁중복식·서당)', icon: icons.categoryHanbok },
  { id: 'music', label: '고택 국악 & 예술 (판소리·가야금)', icon: icons.categoryMusic },
]

export const regions = ['전국', '서울/북촌', '전북/전주', '경북/안동', '경북/경주', '강원/강릉']

export const difficultyFilters = [
  { id: 'beginner', label: '입문자 추천' },
  { id: 'instant', label: '즉시 예약 가능', icon: icons.checkInstant },
]

export const sortOptions = [
  { id: 'recommended', label: '추천순' },
  { id: 'reviews', label: '리뷰 많은순' },
  { id: 'rating', label: '평점 높은순' },
  { id: 'priceAsc', label: '가격 낮은순' },
  { id: 'priceDesc', label: '가격 높은순' },
]

export const totalCount = 48
export const pageCount = 5

export const experiences = [
  {
    id: 'bukchon-jaga-soban',
    image: bukchonJagaSoban,
    badges: [
      { label: '명인 직강', bg: '#311908', color: '#fff' },
      { label: '국가무형유산 연계', bg: '#c4e7db', color: '#002019', icon: icons.heritageBadge },
    ],
    highlight: { icon: icons.instantBadge, label: '실시간 예약 가능' },
    location: '서울 종로구 북촌',
    duration: '120분',
    title: ['북촌 무형문화재 명인 자개 소반', '만들기 & 우전차 다도'],
    description: ['120년 고택 안채에서 천연 옻칠 미니 소반에 빛', '나는 자개 문양을 새기는 시간. 장인의 해설과…'],
    rating: 4.98,
    reviewCount: 284,
    originalPrice: 65000,
    price: 52000,
  },
  {
    id: 'jeonju-hanji',
    image: jeonjuHanji,
    badges: [
      { label: '전주 로컬 장인', bg: '#efe7dc', color: '#311908' },
      { label: '입문자 맞춤', bg: '#e9e1d7', color: '#50443e' },
    ],
    highlight: { icon: icons.highlightMaterial, label: '천연 닥나무 재료' },
    location: '전북 전주시 완산구',
    duration: '90분',
    title: ['천년 전주 한지 뜨기 & 계절 야생', '화 압화 엽서 제작'],
    description: ['닥나무 펄프를 전통 방식으로 직접 건져 올리고', '말려 완성하는 나만의 천연 한지와 말린 들꽃으로'],
    rating: 4.95,
    reviewCount: 192,
    price: 38000,
  },
  {
    id: 'hahoe-yeotgangjeong',
    image: hahoeYeotgangjeong,
    badges: [
      { label: '안동 고택 워크숍', bg: '#311908', color: '#fff' },
      { label: '종부 직전수', bg: '#c4e7db', color: '#002019' },
    ],
    highlight: { icon: icons.highlightLimited, label: '회차당 8인 한정' },
    location: '경북 안동시 하회마을',
    duration: '150분',
    title: ['하회 류씨 종가 내림 엿강정 빚기', '와 봉정사 차담'],
    description: ['600년 전통 종택 안방에서 전수받는 자연 식재', '료 다식과 차 이야기. 고풍스러운 목조 마루에…'],
    rating: 4.96,
    reviewCount: 115,
    price: 45000,
  },
  {
    id: 'gyeongju-beopju',
    image: gyeongjuBeopjuBrewing,
    badges: [
      { label: '명주 빚기', bg: '#4a2e1b', color: '#fff' },
      { label: '성인 전용', bg: '#c4e7db', color: '#002019' },
    ],
    highlight: { icon: icons.highlightTasting, label: '무 주안상 테이스팅 포함' },
    location: '경북 경주시 교촌',
    duration: '180분',
    title: ['경주 교동법주 빚기와 전통 누록', '디딤 체험'],
    description: ['국가무형유산 제86-다호 가양주 제조 비법과', '직접 빚은 법주 1병 증정 및 정갈한 전통 안주 폐'],
    rating: 4.99,
    reviewCount: 340,
    price: 65000,
  },
  {
    id: 'namwon-gwanghallu-pansori',
    image: namwonGwanghalluPansori,
    badges: [
      { label: '달빛 야간기행', bg: '#1c201e', color: '#fff' },
      { label: '시즌 특별기획', bg: '#efe7dc', color: '#311908' },
    ],
    highlight: { icon: icons.highlightSchedule, label: '금·토 저녁 7시' },
    location: '전북 남원시',
    duration: '100분',
    title: ['광한루원 달빛 풍류 판소리 단가', '& 고택 소리 배우터'],
    description: ['명창과 함께 춘향가의 주요 대목과 추임새를 배', '우고 남원의 정취를 오롯이 누리는 고즈넉한 밤'],
    rating: 4.93,
    reviewCount: 88,
    price: 35000,
  },
  {
    id: 'icheon-pottery',
    image: icheonPotteryWheel,
    badges: [
      { label: '도예 워크숍', bg: '#45655b', color: '#fff' },
      { label: '소성 후 택배 배송', bg: '#e9e1d7', color: '#311908' },
    ],
    highlight: { icon: icons.highlightTea, label: '웰컴 차 제공' },
    location: '경기 이천 / 서울 은평',
    duration: '120분',
    title: ['북한산 자락 달항아리 물레 성형', '& 백자 다기 세트'],
    description: ['순백의 고령토를 매만지며 잡념을 비워내는 몰', '입의 시간. 전통 장작 가마 소성 후 안전하게 댁'],
    rating: 4.97,
    reviewCount: 210,
    price: 58000,
  },
]

export const trustItems = [
  {
    icon: icons.trustCert,
    iconBg: 'rgba(196, 231, 219, 0.5)',
    title: '공인 전승자 & 명인 안전 인증',
    description: ['문화재청 및 지자체 문화재단에서 검증된 정규 전수', '관과 지정 고택에서만 안전하게 진행됩니다.'],
  },
  {
    icon: icons.trustCalendar,
    iconBg: 'var(--color-surface-3)',
    title: '안심 예약 & 3일 전 100% 무료 취소',
    description: ['재료 준비 일정에 맞춤 공정한 취소 환불 규정을 준', '수하며 기상 악화 시 전액 환불을 보장합니다.'],
  },
  {
    icon: icons.trustAi,
    iconBg: 'var(--color-surface-3)',
    title: 'AI 여행 동선 최적화 결합',
    description: ['선택하신 체험 일정은 하루한옥 AI 여정 플래너와의 연', '동되어 최적의 도보 산책로와 맛집을 함께 설계해드립니다.'],
  },
]
