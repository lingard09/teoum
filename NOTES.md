# teoum 작업 노트

피그마: https://www.figma.com/design/Dc7FeLrTzZVgLWm6FDcW74/한옥모아 (Page 1, 데스크톱 1280 기준)

## 현재 상태 (2026-09-15)
- Vite + React(JS) + react-router-dom, 스타일은 CSS Modules + `src/index.css`의 색/그림자/폰트 토큰.
- 폰트: Pretendard(jsdelivr CDN) + Plus Jakarta Sans(Google Fonts) — `index.html`에서 로드.
- **구현 완료: 스토리 & 문화체험 목록 탐색** ← 1:3093 — `/experiences` (지금은 `/` 기본 라우트로 지정)
  - 히어로+검색, 카테고리/지역/난이도 필터, 체험 카드 6개, 페이지네이션, 신뢰 배너
  - `src/pages/Experiences/ExperiencesPage.jsx` + `ExperienceCard.jsx`, 데이터는 `src/data/experiences.js`
  - 필터/정렬/페이지네이션은 클릭 시 활성 상태만 토글됨 (목업 6개 카드만 있어 실제 필터링은 없음)
  - 헤드라인 폰트는 피그마 시안이 '가평한석봉체'지만 CDN에 없어서 일단 Pretendard bold로 대체함 — 실제 폰트 필요하면 확인 필요
- **구현 완료: 한옥스테이 & 로컬길 숙소 큐레이션 목록** ← 1:3643 — `/stays`
  - 히어로(헤드라인+공식인증고택/평균만족도 지표)+빠른검색 폼(지역/체크인아웃/인원/테마, 값은 목업 텍스트만), 카테고리 필터, 권역 칩+조건 체크박스, 스테이 카드 6개, 페이지네이션(1 2 3 4 … 14)
  - `src/pages/Stays/StaysPage.jsx` + `StayCard.jsx`, 데이터는 `src/data/stays.js`
  - 카드 배지 톤 3종(dark/mint/neutral)은 피그마 6장 카드에서 확인된 색만 구현, 6번째 카드(강릉 선교장)는 get_design_context 응답이 잘려서 스크린샷 보고 텍스트/배지 복원함 — 실제 피그마와 살짝 다를 수 있음.
  - 페이지네이션 화살표 아이콘은 이 프레임 전용 export(`stay-pagination-prev/next.svg`)를 새로 받음(ExperiencesPage 것과 다른 asset).
- **구현 완료: 전통 체험 실시간 예약·결제** ← 1:1763 — `/stays/reserve`
  - StaysPage 카드의 "예약 일정 확인" 버튼(`StayCard.jsx`)을 여기로 연결함. `/stays` 하위 경로로 둬서 Header의 "계획하기" 내비가 이 페이지에서도 active로 표시됨(NavLink 기본 prefix 매칭).
  - 주의: 피그마 목업 내용 자체는 "북촌 자개소반" **체험** 예약 화면이라 어떤 스테이 카드를 눌러도 같은 정적 목업이 뜸(카드별 실제 데이터 연동은 안 함) — 원본 디자인이 그렇게 되어 있어서 그대로 둠.
  - 좌측: 진행 단계 트래커(1,2 완료/3 예정), 체험 요약 카드, ①달력(실제 연/월 계산, 5/1~5/3만 '마감'으로 표시)+시간대 선택, ②성인/청소년 인원 카운터, ③예약자 정보 폼(성명/연락처/요청사항)
  - 우측: 결제 예정 내역(성인 인원수 × 단가 − 자동할인 10,000원으로 실시간 재계산됨, 2인 기준 94,000원으로 디자인과 일치 확인함), 간편결제 4종 선택, CTA 버튼, 취소/환불 규정 아코디언
  - `src/pages/Booking/BookingPage.jsx` + `BookingCalendar.jsx`, 데이터는 `src/data/booking.js`
  - 결제 CTA 버튼("94,000원 결제하고 예약 확정하기")은 실제 동작 없음(목업이라 결제 확정 페이지가 없어서 비활성 상태로 둠) — 필요하면 다음 단계 페이지 요청할 것.
  - get_design_context가 우측 결제 패널 직전에서 잘려서, 결제수단/CTA/환불규정 영역은 해당 노드(1:2152)만 따로 다시 불러와 받음.
- **구현 완료: TourAPI(한국관광공사 국문 관광정보 서비스, KorService2) 연동** — `src/api/tourapi.js`
  - BookingPage 진입 시 키워드 "북촌한옥마을"로 `searchKeyword2` → `detailCommon2` 순서로 호출해서 체험 요약 카드의 사진/주소/소개글을 실제 데이터로 덮어씀. 로딩 중엔 mock이 먼저 보이고 카드 위에 "실시간 관광정보 불러오는 중…" 표시, 성공하면 "TourAPI 실시간 연동", 실패(키 없음/네트워크 오류/타임아웃 8초)하면 "TourAPI 연동 실패 · 예시 정보 표시 중"으로 바뀌며 원래 mock 문구를 그대로 유지함 — 실제로 성공 호출까지 curl로 확인함(contentid 126537, resultCode 0000).
  - 서비스키는 `.env.local`의 `VITE_TOURAPI_SERVICE_KEY`에만 있고 `.gitignore`로 커밋 제외됨. `.env.example`에 변수명만 남겨둠.
  - **중요(보안) 주의**: 이 프로젝트는 백엔드가 없는 순수 정적 SPA라서, 빌드된 JS 안에 서비스키가 그대로 들어감 — 배포 후에는 누구나 네트워크 탭/번들에서 키를 볼 수 있음. `.env.local`은 "git에 안 올라간다"는 뜻일 뿐 "브라우저에 안 보인다"는 뜻이 아님. 완전히 감추려면 서버리스 함수 등으로 프록시해야 하는데 이 저장소엔 아직 없음 — 프로토타입이라 일단 이 방식으로 진행함, 실서비스 전환 시 재검토 필요.
  - data.go.kr이 주는 "Encoding" 형태 키(%2B 등 이미 URL 인코딩됨)를 URLSearchParams로 또 인코딩하면 인증이 깨져서, serviceKey만 별도로 문자열에 직접 붙임. detailCommon2는 contentTypeId나 ...YN 옵션을 같이 보내면 `INVALID_REQUEST_PARAMETER_ERROR`가 나서(실제로 겪음) contentId만 보냄.
  - `apis.data.go.kr`은 CORS 헤더를 내려줘서(curl로 Origin 헤더 넣어 직접 확인함) 배포본에서도 브라우저 직접 호출이 막히지 않음. 개발 서버의 `/tourapi-proxy`(`vite.config.js`)는 CORS 우회용이 아니라 순수 개발 편의.
  - **배포 시 할 일**: GitHub Actions로 GH Pages에 배포하려면 저장소 Settings → Secrets and variables → Actions에 `VITE_TOURAPI_SERVICE_KEY`를 등록해야 함(`deploy.yml`에 참조는 넣어뒀지만 실제 값은 사용자가 직접 등록해야 함 — API 키라서 내가 대신 등록하지 않음). 등록 안 하면 배포본은 항상 fallback(mock)만 보임.
  - 이미지 URL이 http로 오는 경우가 있어(같은 호스트가 https도 지원하는 걸 확인) `toHttpsUrl`로 강제 치환함 — 안 하면 https 배포본에서 혼합 콘텐츠로 이미지가 차단됨.
- **구현 완료: 공통 Header/Footer** ← 100:157 / 100:193 — `src/components/Header/`, `src/components/Footer/`
  - ExperiencesPage, StaysPage, BookingPage에 배치함. MyPage에는 아직 안 붙임 — 필요하면 App.jsx에 공통 레이아웃으로 빼는 걸 고려할 것.
  - Header 내비 5개 중 "모아보기"는 아직 미연결, "체험하기"(→ `/experiences`) · "계획하기"(→ `/stays`, `/stays/reserve`에서도 active) · "머무르기"(→ `/mypage`) 연결됨, "둘러보기"는 대응 페이지 없어서 비활성 텍스트.
  - Header 반응형: 원래 960px 이하에서 `.nav { display: none }`으로 메뉴 전체를 숨기던 버그가 있었음 → 제거하고, 1180/960/720px 단계별로 padding·gap·font-size를 줄여서 5개 메뉴+우측(KR/광숙이)이 항상 한 줄에 보이게 고침. 정말 좁은 화면에서는 `.nav`만 가로 스크롤(숨김 아님)되도록 안전장치를 둠.
  - 로고 워드마크 "다시, 터움"은 Noto Serif KR(Google Fonts)로 새로 추가함.
  - Header 아바타는 마이페이지 프로필 아바타와 피그마에서 동일한 이미지라 `avatar.png`를 재사용함(중복 다운로드 안 함).
  - 로고 아이콘은 Header/Footer 둘 다 `src/assets/icons/logo.png`(사용자가 직접 받아둔 파일) 사용으로 통일함 — 기존에 피그마 MCP로 받았던 `logo-mark.png`는 참조하는 곳이 없어져서 삭제함.
  - 피그마 원본에 있던 Footer 하단의 빈 플레이스홀더 박스(h96)는 요청에 따라 제거함 — 로고+텍스트 / 설명 문구 / TourAPI 배지 3단만 렌더링.
- **구현 완료: 나의 여정 보관함 (마이페이지)** — 피그마 프레임 3개를 한 페이지의 탭 3개로 구현
  - `/mypage/upcoming` ← 1:2379 (예약 카드 2개)
  - `/mypage/courses` ← 100:210 (AI 코스 타임라인)
  - `/mypage/scraps` ← 100:807 (스크랩 카드 3개)
- 마이페이지 데이터는 Firestore에서 읽어온다(아래 Firebase 항목). 스크랩 해제만 실제로 저장됨.
  `src/data/mypage.js`는 더 이상 화면에서 쓰지 않는다(시드는 `src/data/mypageSeed.js`).
- 나머지 페이지 데이터는 아직 목업(`src/data/experiences.js`, `src/data/stays.js`, `src/data/booking.js`).
  버튼 클릭 동작은 대부분 없음 — 예외: 스테이 카드 하트 찜 토글, 예약 페이지의 달력/시간대 선택·인원
  카운터·결제수단 선택(총액 실시간 계산)·환불규정 아코디언은 실제로 동작함.
- 이미지/아이콘은 피그마에서 받아 `src/assets/`에 커밋함 (MCP 에셋 URL은 7일 뒤 만료).

## Firebase (마이페이지 데이터)
- 프로젝트: `teoum-hanok` (콘솔: https://console.firebase.google.com/project/teoum-hanok)
- **익명 로그인** 사용. 브라우저마다 uid가 생기고, 그 uid로 처음 들어오면
  `src/data/mypageSeed.js`의 기본 데이터가 자동으로 심어진다(그래서 누가 링크를 열어도
  시안대로 채워진 마이페이지가 보인다). 기기/브라우저가 바뀌면 다른 사람으로 취급됨.
- 구조: `users/{uid}` 프로필 + 하위 컬렉션 `reservations` / `scraps` / `courses`
- 보안 규칙은 `firestore.rules` (본인 uid 문서만 접근). 배포: `firebase deploy --only firestore:rules`
- Firebase 웹 config는 비밀이 아니라서 `src/api/firebase.js`에 커밋해뒀다.
  (TourAPI 키와 달리 .env로 뺄 필요 없음 — 접근 제어는 규칙이 담당)
- Firestore에 이미지/아이콘은 못 넣으므로 DB에는 `imageKey`/`iconKey` 문자열만 저장하고
  `src/data/assets.js`에서 실제 에셋으로 복원한다.
- 연결 실패 시 목업으로 폴백하고 화면 상단에 안내 문구가 뜬다(8초 타임아웃).

## 미확정
- 첫 번째 탭 이름: 프레임 1:2379는 "예약 내역", 나머지 두 프레임은 "다가오는 여정" → 일단 "다가오는 여정" 사용.
- MyPage에는 아직 Header/Footer가 안 붙어 있어서 `/mypage`만 다른 페이지와 톤이 다름.
- 모바일 규격 시안 없음 — 좁은 화면용 미디어쿼리는 임시로만 넣음, 실제 확인 안 함.
- `/` 기본 라우트를 `/mypage`에서 `/experiences`로 바꿨음 (체험 목록이 랜딩 페이지처럼 보여서) — 의도와 다르면 되돌릴 것.

## 명령어
- `npm run dev` 개발 서버
- `npm run build` 빌드
- `npm run lint` oxlint
