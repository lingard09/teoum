// 익명 계정이 처음 접속했을 때 Firestore에 심어주는 기본 데이터.
//
// 피그마 시안의 문구를 그대로 담되, 이미지/아이콘은 import가 아니라 문자열 키다.
// Firestore에 그대로 write할 수 있어야 하므로 여기에는 JSON으로 표현 가능한
// 값만 들어간다(에셋 복원은 data/assets.js).
//
// order 필드는 정렬용이다. Firestore 문서 조회 순서는 보장되지 않아서
// 피그마 시안의 카드 순서를 유지하려면 명시적인 정렬 키가 필요하다.

export const profileSeed = {
  name: '박광숙',
  avatarKey: 'avatar',
  levelLabel: '고택 유랑자 Lv.3',
  memberLabel: '문화유산 애호회원',
  journeyCount: 14,
  summary: '전국 한옥 마을 8곳 탐방 · 고택 스탬프 4/12개 수집 완료',
}

export const reservationsSeed = [
  {
    id: 'HK-260418-09',
    order: 1,
    category: { label: '전통 체험', tone: 'mint', iconKey: 'palette' },
    imageKey: 'bukchon-najeon',
    location: '서울 북촌 가회동 공방거리',
    title: '북촌 명인 나전칠기 · 자개 소반 만들기',
    detailsLayout: 'grid',
    details: [
      { label: '일시', value: '2026.04.18 (토) 14:00' },
      { label: '인원', value: '성인 2명' },
      { label: '소요시간', value: '120분' },
      { label: '장소', value: '북촌로 11길 자헌공방' },
    ],
    actionSize: 'md',
    actions: [
      { label: '길찾기', variant: 'light', iconKey: 'navigation' },
      { label: '예약 상세확인', variant: 'dark', trailingIconKey: 'chevronRight' },
    ],
  },
  {
    id: 'HK-260418-10',
    order: 2,
    category: { label: '한옥 스테이', tone: 'peach', iconKey: 'home' },
    imageKey: 'andong-yemijeong',
    location: '경북 안동시 정상동',
    title: '안동 예미정 본채 (독채 고택)',
    detailsLayout: 'list',
    details: [
      { label: '일시', value: '2026.05.02 (토) 15:00 입실 - 05.03 (일) 11:00 퇴실' },
      { label: '조식 포함 여부', value: '안동 양반가 아침 죽상 2인' },
      { label: '스마트 도어락 비밀번호', value: '체크인 당일 13:00 문자 발송', iconKey: 'doorlock' },
    ],
    actionSize: 'lg',
    actions: [
      { label: '호스트 문의', variant: 'light', iconKey: 'phone' },
      { label: '입실 가이드 & 지도', variant: 'green', iconKey: 'map' },
    ],
  },
]

export const scrapsSeed = [
  {
    id: 'eunpyeong-rooftop',
    order: 1,
    location: '은평 한옥마을',
    title: '은평 일인일잔 · 북한산 조망 루프탑',
    description: '통유리창 너머 웅장한 북한산 암벽과 기와지붕이 한눈에…',
    scrapedAt: '2026.03.28',
    imageKey: 'eunpyeong-rooftop',
  },
  {
    id: 'soswaewon',
    order: 2,
    location: '전남 담양',
    title: '소쇄원 원림 · 선비 정원 조망 코스',
    description: '자연 계곡과 대나무 숲을 거스르지 않고 지은 조선 최고의',
    scrapedAt: '2026.03.12',
    imageKey: 'soswaewon',
  },
  {
    id: 'gyodong-beopju',
    order: 3,
    location: '경북 경주',
    title: '교동법주 국가무형유산 전수관 시음',
    description: '350년 내림 솜씨로 빚어내는 황금빛 찹쌀 발효 전통 청주…',
    scrapedAt: '2026.02.19',
    imageKey: 'gyodong-beopju',
  },
]

export const coursesSeed = [
  {
    id: 'jeonju-wanju-2d1n',
    order: 1,
    title: '전주 완주 1박 2일',
    description:
      '박광숙님의 성향(고즈넉한 산책 70% + 장인 미식 30%)에 맞춰 AI가 최적 동선으로 직조한 일정입니다.',
    days: [
      {
        label: '1일차',
        title: '역사와 전통 미식의 날 (풍남동 일대)',
        stats: ['도보 3.2km (약 4,500보)', 'AI 혼잡도 지수: 보통 (쾌적)'],
        waypoints: [
          {
            time: '10:30',
            kind: '출발',
            tone: 'default',
            tag: { label: '건축 유산', tone: 'sand' },
            subLabel: '사적 제288호',
            title: '전동성당 · 로마네스크 양식과 한옥의 조우',
            description:
              '성심을 모아 올린 붉은 벽돌의 위용을 감상하고, 한옥마을 진입 전 고요한 묵상의 시간을 가집니다.',
            imageKey: 'jeondong-cathedral',
            meta: [
              { iconKey: 'clock', text: '체류 권장 40분' },
              { iconKey: 'camera', text: '포토스팟: 본당 우측 은행나무 아래' },
            ],
            transit: '도보 5분 (340m) 이동 · 완만한 태조로 은행나무길',
          },
          {
            time: '11:20',
            kind: '산책',
            tone: 'default',
            tag: { label: '스탬프 인증지', tone: 'mint' },
            subLabel: '태조 어진 봉안처',
            title: '경기전 대나무 숲길과 어진박물관',
            description:
              '울창한 왕죽 사이로 스치는 바람 소리를 들으며 조선 태조 이성계의 진영을 친견합니다.',
            imageKey: 'gyeonggijeon',
            meta: [
              { iconKey: 'ticket', text: '입장권 포함됨 (통합패스 등록 완료)' },
              { iconKey: 'leaf', text: '피톤치드 쉼터 30분 추천' },
            ],
            transit: '도보 12분 (750m) 이동 · 전주천변 골목길',
          },
          {
            time: '14:00',
            kind: '체험',
            tone: 'green',
            tag: { label: '장인 워크숍', tone: 'peach' },
            subLabel: '무형유산 연계',
            title: '전주 전통 한지 뜨기 & 닥종이 엽서 제작',
            description:
              '닥나무 펄프를 직접 체로 걸러 물을 빼고 천연 야생화를 얹어 나만의 한지 엽서를 말려 완성합니다.',
            imageKey: 'hanji-workshop',
            meta: [{ iconKey: 'kit', text: '체험 키트 및 현장 완성본 포장 제공' }],
            transit: '도보 8분 (520m) · 한옥스테이 골목 안길 진입',
          },
          {
            time: '17:00',
            kind: '입실',
            tone: 'dark',
            tag: { label: '휴식 & 다도', tone: 'sand' },
            subLabel: '프라이빗 정원',
            title: '한옥스테이 마루 · 달빛 차담 다회',
            description:
              '해질녘 대청마루에 앉아 지리산 야생 녹차를 우리며 소슬바람을 만끽하는 고즈넉한 쉼의 시간.',
            imageKey: 'hanok-tea',
            meta: [{ iconKey: 'tea', text: '계절 다과상(약과, 개성주악) 호스트 세팅' }],
          },
        ],
      },
    ],
  },
]
