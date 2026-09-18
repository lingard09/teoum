// 전통 체험 실시간 예약·결제 목업 데이터 (피그마 시안 문구 그대로). API 붙이면 이 파일을 대체.
import { icons } from '../assets/icons/index.js'
import bookingHero from '../assets/images/booking-hero.png'
import payNaver from '../assets/images/pay-naver.png'
import payKakao from '../assets/images/pay-kakao.png'
import payToss from '../assets/images/pay-toss.png'

export const steps = [
  { n: 1, label: '일정 & 인원' },
  { n: 2, label: '정보 입력 & 결제' },
  { n: 3, label: '예약 확정' },
]

export const experienceSummary = {
  image: bookingHero,
  badge: { label: '명인 직강', icon: icons.heritageBadge },
  tags: [
    { label: '서울 종로구 가회동', tone: 'sand' },
    { label: '국가무형유산 10호 나전장 이수자', tone: 'mint' },
  ],
  title: ['북촌 무형문화재 명인 자개 소반 만들기 & 우전', '차 다도'],
  description: ['120년 고택 안채에서 천연 옻칠 미니 소반에 빛나는 자개 문양을 손수 세', '공하고, 온화한 햇살 아래 봄 우전차와 궁중 다식을 나눕니다.'],
  info: [
    { icon: icons.durationClock, label: '총 120분 소요' },
    { icon: icons.bookingPackage, label: '완성 소반 포장' },
    { icon: icons.bookingTea, label: '궁중 다과 포함' },
  ],
}

export const step1 = {
  title: '체험 일시 선택',
  description: '소수 정예(회차당 최대 6명)로 운영되는 명인 직접 지도 클래스입니다.',
  bookingWindowLabel: '예약 오픈 기간',
  closedDates: ['2025-05-01', '2025-05-02', '2025-05-03'],
  defaultSelectedDate: '2025-05-17',
  timeSlotHeading: (dateLabel) => `${dateLabel} 회차 선택`,
  arrivalNote: '체험 시작 15분 전까지 도착 권장',
  timeSlots: [
    { id: 'morning', time: '10:30 ~ 12:30', status: 'available', seatsLabel: '잔여 2석 (여유)' },
    { id: 'afternoon', time: '14:00 ~ 16:00', status: 'available', seatsLabel: '잔여 3석' },
    { id: 'evening', time: '16:30 ~ 18:30', status: 'soldout', seatsLabel: '예약 마감' },
  ],
  defaultSlotId: 'afternoon',
}

export const step2 = {
  title: '참여 인원 선택',
  description: '정원 마감 시 추가 예약이 불가하며, 1인 1소반 완제품 제작이 원칙입니다.',
  participants: [
    {
      id: 'adult',
      label: '성인 참가자',
      description: '만 13세 이상 · 고급 옻칠 흑칠 소반 및 궁중 다식 세트',
      price: 52000,
      defaultCount: 2,
    },
    {
      id: 'youth',
      label: '청소년 / 어린이',
      tag: '보호자 동반 필수',
      description: '초등 3학년 이상 (자개 공예 도구 안전 사용 가능 연령)',
      price: 42000,
      defaultCount: 0,
    },
  ],
}

export const step3 = {
  title: '예약자 정보 & 현장 요청사항',
  description: '체험 1일 전 안내 알림톡 및 주차 안내가 기재하신 번호로 발송됩니다.',
  defaultName: '박광숙',
  defaultPhone: '010-1234-5678',
  noteLabel: '다과 알레르기 및 공방 방문 시 특이 요청사항 (선택)',
  noteHint: '견과류, 유제품 알레르기 체크',
  notePlaceholder:
    '전통 다식(송화다식, 흑임자다식) 섭취 시 특이 체질이나 알레르기 유무, 휠체어/유모차 이용 여부를 적어주시면 사전 배려해 드립니다.',
}

export const discount = { label: '북촌 골목상생 얼리버드 바우처', tag: '자동적용', amount: 10000 }
export const materialFeeLabel = '재료 키트 및 다과 포장비'

export const paymentMethods = [
  { id: 'naver', label: '네이버페이', logo: payNaver, color: '#03c75a', bg: 'rgba(3, 199, 90, 0.1)' },
  { id: 'kakao', label: '카카오페이', logo: payKakao, color: '#191919', bg: 'rgba(254, 229, 0, 0.4)' },
  { id: 'toss', label: '토스페이', logo: payToss, color: '#0064ff', bg: 'rgba(0, 100, 255, 0.1)' },
  { id: 'card', label: '신용/체크카드', icon: icons.bookingCreditCard, color: '#311908', bg: 'var(--color-surface-2)' },
]

export const cancellationPolicy = {
  title: '취소 및 환불 규정 안내',
  rows: [
    { label: '체험 3일 전 24:00까지', value: '100% 전액 환불', tone: 'green' },
    { label: '체험 2일 전까지', value: '50% 환불', tone: 'default' },
    { label: '체험 1일 전 ~ 당일 취소/노쇼', value: '환불 불가 (재료비 소진)', tone: 'red' },
  ],
  footnote: '* 천재지변 또는 공방 명인의 불가피한 건강 사유로 취소될 경우 100% 즉시 전액 환불됩니다.',
}

export const guaranteeNote = {
  before: '완성된 자개 소반은 특수 제작된 ',
  emphasis: '오동나무 상자 및 보자기',
  after: '에 정성껏 포장하여 당일 안전하게 수령하실 수 있습니다.',
}
