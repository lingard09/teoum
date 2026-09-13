// 마이페이지 목업 데이터 (피그마 시안 문구 그대로). API 붙이면 이 파일을 대체.
import { icons } from '../assets/icons/index.js'
import avatar from '../assets/images/avatar.png'
import bukchonNajeon from '../assets/images/bukchon-najeon.jpg'
import andongYemijeong from '../assets/images/andong-yemijeong.jpg'
import jeondongCathedral from '../assets/images/jeondong-cathedral.jpg'
import gyeonggijeon from '../assets/images/gyeonggijeon.jpg'
import hanjiWorkshop from '../assets/images/hanji-workshop.jpg'
import hanokTea from '../assets/images/hanok-tea.jpg'
import eunpyeongRooftop from '../assets/images/eunpyeong-rooftop.jpg'
import soswaewon from '../assets/images/soswaewon.jpg'
import gyodongBeopju from '../assets/images/gyodong-beopju.jpg'

export const profile = {
  name: '박광숙',
  avatar,
  levelLabel: '고택 유랑자 Lv.3',
  memberLabel: '문화유산 애호회원',
  journeyCount: 14,
  summary: '전국 한옥 마을 8곳 탐방 · 고택 스탬프 4/12개 수집 완료',
}

export const reservations = [
  {
    id: 'HK-260418-09',
    category: { label: '전통 체험', tone: 'mint', icon: icons.palette },
    image: bukchonNajeon,
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
      { label: '길찾기', variant: 'light', icon: icons.navigation },
      { label: '예약 상세확인', variant: 'dark', trailingIcon: icons.chevronRight },
    ],
  },
  {
    id: 'HK-260418-10',
    category: { label: '한옥 스테이', tone: 'peach', icon: icons.home },
    image: andongYemijeong,
    location: '경북 안동시 정상동',
    title: '안동 예미정 본채 (독채 고택)',
    detailsLayout: 'list',
    details: [
      { label: '일시', value: '2026.05.02 (토) 15:00 입실 - 05.03 (일) 11:00 퇴실' },
      { label: '조식 포함 여부', value: '안동 양반가 아침 죽상 2인' },
      { label: '스마트 도어락 비밀번호', value: '체크인 당일 13:00 문자 발송', icon: icons.doorlock },
    ],
    actionSize: 'lg',
    actions: [
      { label: '호스트 문의', variant: 'light', icon: icons.phone },
      { label: '입실 가이드 & 지도', variant: 'green', icon: icons.map },
    ],
  },
]

export const savedCourse = {
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
          image: jeondongCathedral,
          meta: [
            { icon: icons.clock, text: '체류 권장 40분' },
            { icon: icons.camera, text: '포토스팟: 본당 우측 은행나무 아래' },
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
          image: gyeonggijeon,
          meta: [
            { icon: icons.ticket, text: '입장권 포함됨 (통합패스 등록 완료)' },
            { icon: icons.leaf, text: '피톤치드 쉼터 30분 추천' },
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
          image: hanjiWorkshop,
          meta: [{ icon: icons.kit, text: '체험 키트 및 현장 완성본 포장 제공' }],
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
          image: hanokTea,
          meta: [{ icon: icons.tea, text: '계절 다과상(약과, 개성주악) 호스트 세팅' }],
        },
      ],
    },
  ],
}

export const scraps = [
  {
    id: 'eunpyeong-rooftop',
    location: '은평 한옥마을',
    title: '은평 일인일잔 · 북한산 조망 루프탑',
    description: '통유리창 너머 웅장한 북한산 암벽과 기와지붕이 한눈에…',
    scrapedAt: '2026.03.28',
    image: eunpyeongRooftop,
  },
  {
    id: 'soswaewon',
    location: '전남 담양',
    title: '소쇄원 원림 · 선비 정원 조망 코스',
    description: '자연 계곡과 대나무 숲을 거스르지 않고 지은 조선 최고의',
    scrapedAt: '2026.03.12',
    image: soswaewon,
  },
  {
    id: 'gyodong-beopju',
    location: '경북 경주',
    title: '교동법주 국가무형유산 전수관 시음',
    description: '350년 내림 솜씨로 빚어내는 황금빛 찹쌀 발효 전통 청주…',
    scrapedAt: '2026.02.19',
    image: gyodongBeopju,
  },
]
