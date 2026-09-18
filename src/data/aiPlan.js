// AI 맞춤 여행 코스 플래너 목업 데이터 (피그마 1:553 문구 그대로).
// 큐레이션 목록에서 코스를 고르면 이 형태의 일정이 만들어진다는 전제.
import routeMap from '../assets/images/plan-route-map.png'

export const plan = {
  title: '안동 하회마을 1박 2일 사색의 길',
  subtitle: '고즈넉한 고택 돌담길과 낙동강 물길을 따라 걷는 여유로운 힐링 여정',
  conditions: [
    { iconKey: 'planPin', label: '경북 안동' },
    { iconKey: 'planCalendar', label: '1박 2일' },
    { iconKey: 'planMood', label: '여유 & 힐링' },
  ],
  summary: {
    countLabel: '총 5개 주요 일정',
    weather: '쾌청 22°C',
    walk: '도보 4.2km',
  },
  steps: [
    {
      time: '10:00 AM',
      title: '안동터미널 도착 및 마을 진입',
      description: '낙동강 변을 따라 달리는 급행버스로 여유롭게 하회마을로 이동합니다.',
      tag: { label: '급행버스 연계', tone: 'sand' },
    },
    {
      time: '11:30 AM',
      title: '단아한 한복 환복 & 흙돌담길 산책',
      description: '자연 염색 한복을 입고 고즈넉한 600년 돌담길과 소나무 숲길을 거닙니다.',
    },
    {
      time: '02:00 PM',
      title: '충효당 사랑채 다도 & 사색 체험',
      description: '서애 류성룡 종택 마루에서 전통 작설차 우림과 쌀엿강정 다식을 즐깁니다.',
    },
    {
      time: '05:00 PM',
      title: '나룻배 탑승 & 부용대 일몰 조망',
      description:
        '나룻배로 낙동강을 건너 부용대 정상에서 황금빛으로 물드는 마을 전경을 조망합니다.',
      tag: { label: '골든아워 명소', tone: 'mint' },
    },
    {
      time: '06:30 PM',
      title: '지산고택 체크인 & 온돌 휴식',
      description: '전통 온돌의 아늑한 온기와 밤안개 내린 고택 마당의 정취 속에 하루를 마감합니다.',
      // 마지막 일정만 번호 배지가 진한 색이다.
      last: true,
    },
  ],
  route: {
    heading: '동선 맵 미리보기',
    areaLabel: '안동 하회 권역 (약 18.4km)',
    image: routeMap,
    pathLabel: '안동터미널 → 하회마을 → 부용대 → 지산고택',
  },
  cta: {
    title: '이 일정이 마음에 드시나요?',
    description: '내 보관함에 담아두거나 동행인과 손쉽게 공유해보세요.',
  },
}
