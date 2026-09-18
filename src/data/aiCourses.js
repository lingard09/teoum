// AI 맞춤 여행 코스 큐레이션 목록 목업 데이터 (피그마 108:6566 문구 그대로).
import jeonju from '../assets/images/course-jeonju.jpg'
import andong from '../assets/images/course-andong.jpg'
import bukchon from '../assets/images/course-bukchon.jpg'
import gyeongju from '../assets/images/course-gyeongju.jpg'
import gangneung from '../assets/images/course-gangneung.jpg'
import namwon from '../assets/images/course-namwon.jpg'

export const hero = {
  headline: ['나만의 취향과 시간에 맞추어 조작하는', 'AI 한옥 여정 아카이브'],
  description: [
    '한국관광공사 TourAPI 4.0의 실시간 관광 빅데이터와 이동 동선 알고리즘으로 설계된',
    '120여 개 검증된 한옥 여행 코스를 탐색해 보세요.',
  ],
  metrics: [
    { label: '수록 공식 루트', value: '128', unit: '개' },
    { label: '평균 만족도', value: '4.94', unit: '/5.0' },
  ],
}

export const filterBar = {
  title: '조건별 즉시 여정 추천 필터',
  note: '선택된 조건에 부합하는 코스 실시간 동기화',
  submitLabel: '나만의 AI 여정 즉시 생성하기',
}

// 각 필터의 선택지. 첫 번째가 기본값이다.
export const filterFields = [
  {
    id: 'party',
    label: '동행자',
    iconKey: 'planPeople',
    options: ['2인', '혼자', '3~4인', '가족 (아이 동반)'],
  },
  {
    id: 'duration',
    label: '일정 체류 기간',
    iconKey: 'planDays',
    options: ['1박 2일', '당일치기', '2박 3일'],
  },
  {
    id: 'region',
    label: '대상 권역',
    iconKey: 'planRegion',
    options: ['전국 한옥 벨트 전체', '수도권', '영남권', '호남권', '강원권'],
  },
  {
    id: 'transport',
    label: '이동 수단 선호',
    iconKey: 'planTransport',
    options: ['뚜벅이 도보 & 대중교통 최적', '자가용 이동', '기차 + 도보'],
  },
]

export const categories = [
  { id: 'all', label: '전체 AI 코스', count: 120 },
  { id: 'healing', label: '사색과 쉼 고택 힐링', count: 28 },
  { id: 'food', label: '미식 & 종가 손맛 탐방', count: 34 },
  { id: 'heritage', label: '국가유산 장인 투어', count: 22 },
  { id: 'alley', label: '골목' },
]

export const sorts = [
  { id: 'popular', label: '인기순' },
  { id: 'price', label: '가격순' },
  { id: 'walk', label: '도보 최적화순' },
  { id: 'new', label: '신규 등록순' },
]

export const courses = [
  {
    id: 'jeonju-wanju',
    image: jeonju,
    badges: [{ label: '뚜벅이 추천', tone: 'green' }, { label: '전주 한옥마을' }],
    meta: [
      { iconKey: 'courseWalk', text: '도보 3.2km' },
      { text: '1박 2일 권장' },
      { text: '예상비용 1인 14만원대', tone: 'mint' },
    ],
    rating: '4.96',
    reviewCount: '(412개 리뷰)',
    title: '전주 완주 1박 2일 사색과 미식 로드',
    description: [
      '전동성당의 고요함부터 경기전 솔숲길 산책, 전통 한지',
      '장인과의 교감과 고택 다도 스테이까지 완벽한 동선',
    ],
    waypoints: ['전동성당', '경기전 대나무숲', '한지뜨기 공방', '학인당 다도'],
    category: 'healing',
    region: '호남권',
    duration: '1박 2일',
    transport: '뚜벅이 도보 & 대중교통 최적',
  },
  {
    id: 'andong-hahoe',
    image: andong,
    badges: [{ label: '전통 문화 깊이보기', tone: 'green' }, { label: '경북 안동' }],
    meta: [
      { iconKey: 'courseCar', text: '자가용 추천' },
      { text: '2박 3일 코스' },
      { text: '부용대 조망 & 별신굿', tone: 'mint' },
    ],
    rating: '4.98',
    reviewCount: '(289개 리뷰)',
    title: '안동 하회마을 600년 고택 종가 스테이 2박 3일',
    description: [
      '낙동강 물줄기를 감싸는 하회마을 서애 류성룡 종택의',
      '깊은 역사와 예미정 안동 종가 밥상의 풍미를 만끽하는',
    ],
    waypoints: ['병산서원', '하회 류씨 종택', '엿강정 체험', '예미정 종가 만찬'],
    category: 'heritage',
    region: '영남권',
    duration: '2박 3일',
    transport: '자가용 이동',
  },
  {
    id: 'seoul-bukchon',
    image: bukchon,
    badges: [{ label: '대중교통 완벽 연동', tone: 'green' }, { label: '서울 종로' }],
    meta: [
      { iconKey: 'courseSubway', text: '지하철 연계' },
      { text: '당일 코스 (6시간)' },
      { text: '도보 2.4km 최적화', tone: 'mint' },
    ],
    rating: '4.92',
    reviewCount: '(580개 리뷰)',
    title: '서울 북촌·서촌 골목과 장인 공방 당일치기',
    description: [
      '조선 근대 한옥의 정수 백인제가옥부터 북촌 8경, 무형',
      '문화재 장인의 자개 소반 공예 클래스를 아우르는 일일',
    ],
    waypoints: ['백인제가옥', '북촌 8경 전망대', '나전칠기 공방', '계동 찻집'],
    category: 'heritage',
    region: '수도권',
    duration: '당일치기',
    transport: '뚜벅이 도보 & 대중교통 최적',
  },
  {
    id: 'gyeongju-gyochon',
    image: gyeongju,
    badges: [{ label: '연인 추천', tone: 'green' }, { label: '야간 특화' }],
    meta: [
      { iconKey: 'courseNight', text: '야간 로맨틱' },
      { text: '1박 2일 코스' },
      { text: '교동법주 시음 포함', tone: 'mint' },
    ],
    rating: '4.95',
    reviewCount: '(340개 리뷰)',
    title: '경주 교촌마을 & 월정교 달빛 야경 산책 1박 2일',
    description: [
      '최부자 가문의 노블레스 오블리주와 월정교의 황홀한',
      '야간 조명, 신라 천년 숲 계림을 거쳐 월정재 고택에서…',
    ],
    waypoints: ['교촌 최부자 고택', '계림 숲길', '월정재 스테이', '동궁과 월지'],
    category: 'healing',
    region: '영남권',
    duration: '1박 2일',
    transport: '뚜벅이 도보 & 대중교통 최적',
  },
  {
    id: 'gangneung-seongyojang',
    image: gangneung,
    badges: [{ label: '가족·부모님 동반', tone: 'green' }, { label: '강원 강릉' }],
    meta: [
      { iconKey: 'courseTrain', text: 'KTX 연계' },
      { text: '2박 3일 힐링' },
      { text: '99칸 사대부 가옥', tone: 'mint' },
    ],
    rating: '4.91',
    reviewCount: '(195개 리뷰)',
    title: '강릉 선교장 & 오죽헌 솔숲 바다기행 2박 3일',
    description: [
      '신사임당과 율곡 이이의 향기가 서린 오죽헌, 백두대간',
      '솔향 가득한 선교장 활래정 다도와 초당 순두부 고택 밥',
    ],
    waypoints: ['강릉 선교장', '활래정 연화차', '오죽헌 솔숲길', '초당 고택 차담'],
    category: 'food',
    region: '강원권',
    duration: '2박 3일',
    transport: '기차 + 도보',
  },
  {
    id: 'namwon-gwanghallu',
    image: namwon,
    badges: [{ label: '소리 & 풍류', tone: 'green' }, { label: '전북 남원' }],
    meta: [
      { iconKey: 'courseSound', text: '국악 배움터' },
      { text: '1박 2일 코스' },
      { text: '완만한 평지 산책길', tone: 'mint' },
    ],
    rating: '4.89',
    reviewCount: '(142개 리뷰)',
    title: '남원 광한루원 & 지리산 고택 소리 배움 1박 2일',
    description: [
      '춘향전의 무대 광한루원의 완만한 버드나무 호숫가와',
      '지리산 자락 판소리 전수관에서 북장단과 단가를 체험',
    ],
    waypoints: ['광한루원 완월정', '춘향 테마파크', '소리 배움 전수관', '남원예촌 스테이'],
    category: 'food',
    region: '호남권',
    duration: '1박 2일',
    transport: '뚜벅이 도보 & 대중교통 최적',
  },
]

export const pagination = { totalLabel: '총 120개 AI 코스 중 1-6 표시 중', pages: [1, 2, 3, 4, '…', 20] }

export const ctaBanner = {
  title: '3가지 질문으로 완성하는 맞춤 여행',
  description: '일정, 취향, 이동수단을 바탕으로 나에게 맞는 코스를 추천해드려요.',
  buttonLabel: '맞춤 코스 만들기',
  note: '별도 회원가입 없이 테스트 모드로 즉시 생성 가능',
}

export const notice = {
  text: '한국관광공사 TourAPI 4.0 및 지역 생성 데이터 공식 인용',
  sub: '본 큐레이션 아카이브는 매일 오전 04:00 지자체 문화체육 공공데이터와 등기부등본 정보 및 보수 공사 일정이 자동 동기화됩니다.',
  links: ['데이터 출처 명시', '알고리즘 기준치 안내'],
}
