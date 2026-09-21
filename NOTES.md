# teoum 작업 노트

> **이 브랜치(no-dummy)는 더미 데이터 없는 버전입니다.**
> 화면에 보이는 장소·숙소·체험·코스가 전부 한국관광공사 TourAPI 실데이터이고,
> API가 주지 않는 값(요금·평점·소요시간)은 만들어 넣지 않습니다.
> 데이터가 없으면 빈 상태를 그대로 보여줍니다. 시안 그대로의 큐레이션 버전은 main 브랜치에 있습니다.

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
  - 서비스키는 `.env`의 `VITE_TOUR_API_KEY` 하나로 통일했다(지도탐색·예약 상세조회가 공유).
    `.gitignore`로 커밋 제외됨. `.env.example`에 변수명만 남겨둠.
  - **중요(보안) 주의**: 이 프로젝트는 백엔드가 없는 순수 정적 SPA라서, 빌드된 JS 안에 서비스키가 그대로 들어감 — 배포 후에는 누구나 네트워크 탭/번들에서 키를 볼 수 있음. `.env.local`은 "git에 안 올라간다"는 뜻일 뿐 "브라우저에 안 보인다"는 뜻이 아님. 완전히 감추려면 서버리스 함수 등으로 프록시해야 하는데 이 저장소엔 아직 없음 — 프로토타입이라 일단 이 방식으로 진행함, 실서비스 전환 시 재검토 필요.
  - data.go.kr이 주는 "Encoding" 형태 키(%2B 등 이미 URL 인코딩됨)를 URLSearchParams로 또 인코딩하면 인증이 깨져서, serviceKey만 별도로 문자열에 직접 붙임. detailCommon2는 contentTypeId나 ...YN 옵션을 같이 보내면 `INVALID_REQUEST_PARAMETER_ERROR`가 나서(실제로 겪음) contentId만 보냄.
  - `apis.data.go.kr`은 CORS 헤더를 내려줘서(curl로 Origin 헤더 넣어 직접 확인함) 배포본에서도 브라우저 직접 호출이 막히지 않음. 개발 서버의 `/tourapi-proxy`(`vite.config.js`)는 CORS 우회용이 아니라 순수 개발 편의.
  - **배포 시 할 일**: GitHub Actions로 GH Pages에 배포하려면 저장소 Settings → Secrets and variables → Actions에 `VITE_TOUR_API_KEY`를 등록해야 함(`deploy.yml`에 참조는 넣어뒀지만 실제 값은 사용자가 직접 등록해야 함 — API 키라서 내가 대신 등록하지 않음). 등록 안 하면 배포본은 항상 fallback(mock)만 보임.
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

## 데이터 출처 (실데이터 vs 목업)
- **실데이터(TourAPI)**: 지도탐색 관광지 검색/주소/좌표/전화, 연관 관광지("함께 가는 곳"),
  지역 혼잡도(관광빅데이터 방문자수), 한옥스테이 목록(숙박 contentTypeId=32, 한옥 143건·고택 38건).
- **예약 페이지**(`/stays/reserve?contentId=...`): 결제 대상은 목록에서 누른 실제 항목이다.
  이름·사진·주소·소개문구와 요약 배지(숙소=체크인/퇴실/객실수/주차, 체험=이용시간/휴무/
  프로그램/주차)가 전부 TourAPI 값이다. 반면 요금·정원·할인·환불규정·결제수단은
  TourAPI에 없는 값이라 booking.js의 데모 시나리오를 그대로 쓴다.
- **⚠️ data.go.kr은 Referer에 쿼리스트링이 있으면 400을 돌려준다.** 그 값까지 요청
  파라미터로 해석한다(실호출 확인: Referer 없음/Origin만/쿼리 없는 Referer는 200,
  "?contentId=..."가 붙으면 INVALID_REQUEST_PARAMETER_ERROR). 그래서 두 API 클라이언트
  모두 `referrerPolicy: 'no-referrer'`로 호출한다. 쿼리가 붙는 화면(/stays/reserve,
  /plan/result)에서 API가 통째로 죽는 문제였다.
- **목업**: AI 코스 큐레이션/플래너, 홈 스토리·체험 섹션, 마이페이지 시드,
  그리고 각 목록 앞쪽의 큐레이션 카드(시안 문구 그대로).
- **평점·리뷰수는 어디에도 두지 않는다.** TourAPI는 관광정보 API일 뿐 리뷰 플랫폼이 아니라
  평점을 제공하지 않는다. 예전에 있던 pseudoRatingFor(해시로 4.5~4.94 생성)와 villages.js의
  하드코딩 평점은 실데이터처럼 보여서 제거했다. 지도 정렬의 "평점 높은순"도
  "방문자 많은순"(DataLab 실데이터)으로 교체했다.
- TourAPI가 주지 않는 값(요금 등)은 지어내지 않고, 대신 실제로 오는 값을 보여준다
  (숙소 카드는 요금 자리에 문의 전화·객실 타입/수·체크인아웃·편의시설,
  체험 카드는 요금/평점 자리에 체험 프로그램·이용시간·휴무일·문의처).
- **TourAPI 응답은 localStorage에 하루 캐시한다**(`src/api/apiCache.js`). 개발계정은
  일일 요청 한도가 있어 초과하면 429 LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR가
  난다. 실측: 전 페이지 첫 방문 90회 → 재방문 0회.
  - 캐시 키에 serviceKey를 넣지 않는다(키가 localStorage에 남지 않도록 쿼리에서 제거 후 해시).
  - 호출이 실패하면 만료된 캐시라도 돌려준다(stale-while-error). 발표 중 한도가 떨어져도
    화면이 통째로 비지 않게 하기 위함이다.
  - localStorage가 막히거나 용량이 차도 조용히 캐시 없이 동작한다.
- **사용 중인 공공 API는 5종**(전부 한국관광공사, 인증키 하나 공유).
  KorService2(국문 관광정보), TarRlteTarService1(연관 관광지), DataLabService(방문자수),
  KorWithService2(무장애 여행), PhotoGalleryService1(관광사진).
- **무장애 여행 정보**(`src/api/accessApi.js`)는 상세페이지의 "무장애 편의" 섹션에 쓴다.
  국문 서비스와 contentId 체계가 같아 기존 id로 바로 조회된다. 커버리지는 전수가 아니다
  — 실측으로 우리가 노출하는 장소 100곳 중 17곳(마을 29%, 한옥숙소 17%, 고택 7%, 체험 23%).
  다만 북촌·남산골·은평·전주 등 방문이 몰리는 곳은 들어 있다. 없는 곳은 섹션을 통째로 숨긴다.
- **관광사진 정보**(`src/api/photoApi.js`)는 detailImage2와 겹치지 않고 보완한다.
  실측(한옥마을 12곳): detailImage2는 12곳 전부 3~21장, 관광사진 API는 5곳뿐이지만
  북촌 47장·개평 38장으로 훨씬 많다. 상세페이지는 둘을 합쳐 최대 12장을 그린다.
  - 키워드 검색이 제목 밖까지 매칭된다("북촌한옥마을" 71장 중 24장이 창덕궁·동림매듭공방 등).
    그래서 galTitle을 검색어와 대조해 거른다.
- 검증해보고 **쓰지 않기로 한 것**: 반려동물(detailPetTour2는 키 없이 동작하지만 한옥마을
  12곳 중 2곳뿐), 한옥 축제(contentTypeId=15 검색 결과 전국 2건). 둘 다 화면이 대부분
  비어서 기능으로 만들 분량이 아니다.
- API 목록은 12개씩만 노출한다. 카드마다 상세를 부르기 때문에 목록이 길수록
  호출 수가 배로 늘어 공공데이터포털 일일 트래픽을 빠르게 소진한다.

## AI 맞춤 코스 (계획하기)
- `functions/api/plan.js` — Cloudflare Pages Function. 브라우저가 TourAPI에서 모은
  장소 후보를 받아 OpenAI에 "이 목록 안에서만 골라 순서·이유를 쓰라"고 요청한다.
- **LLM이 장소를 지어내지 못하게 하는 것이 설계의 핵심이다.** 응답에 후보에 없는
  contentId가 섞여 오면 서버에서 걸러낸다. 화면에는 TourAPI에 실재하는 곳만 남는다.
- `OPENAI_API_KEY`는 Cloudflare 환경변수(운영)와 `.dev.vars`(로컬)에만 둔다.
  브라우저 번들에 들어가지 않는다. 등록:
  `npx wrangler pages secret put OPENAI_API_KEY --project-name teoum`
- 키가 없으면 생성 버튼이 실패 안내를 띄운다(빈 화면이 되지 않는다).
- `vite dev`에는 Functions가 없어서 로컬 확인은 `npx wrangler pages dev`가 필요하다.

## 배포
- **Cloudflare Pages** — https://teoum.pages.dev (저장소 연결, main 푸시 시 자동 빌드)
  - 빌드 설정: Build command `npm run build`, Output directory `dist`
  - 환경변수(`VITE_TOUR_API_KEY`, `VITE_NAVER_MAP_CLIENT_ID`)는 Cloudflare 프로젝트
    Settings > Environment variables에 등록돼 있다. GitHub Secrets는 쓰지 않는다.
  - SPA 딥링크는 `public/_redirects`의 `/* /index.html 200`이 처리한다.
  - 브랜치를 푸시하면 미리보기 URL이 자동 생성된다. 단 임의 서브도메인이라
    네이버 지도 Web 서비스 URL 화이트리스트에 안 걸려 미리보기에선 지도가 안 뜰 수 있다.
- **도메인이 바뀌면 네이버 지도가 인증 실패한다.** NCP 콘솔 > Maps 애플리케이션의
  "Web 서비스 URL"에 배포 주소를 등록해야 지도가 뜬다. Firestore는 도메인 제한이 없다.
- GitHub Pages 배포는 Cloudflare로 이전하면서 제거했다(2026-09-19).

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
