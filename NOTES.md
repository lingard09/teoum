# teoum 작업 노트

피그마: https://www.figma.com/design/Dc7FeLrTzZVgLWm6FDcW74/한옥모아 (Page 1, 데스크톱 1280 기준)

## 현재 상태 (2026-09-14)
- Vite + React(JS) + react-router-dom, 스타일은 CSS Modules + `src/index.css`의 색/그림자/폰트 토큰.
- 폰트: Pretendard(jsdelivr CDN) + Plus Jakarta Sans(Google Fonts) — `index.html`에서 로드.
- **구현 완료: 나의 여정 보관함 (마이페이지)** — 피그마 프레임 3개를 한 페이지의 탭 3개로 구현
  - `/mypage/upcoming` ← 1:2379 (예약 카드 2개)
  - `/mypage/courses` ← 100:210 (AI 코스 타임라인)
  - `/mypage/scraps` ← 100:807 (스크랩 카드 3개)
- 데이터는 Firestore에서 읽어온다(아래 Firebase 항목). 스크랩 해제만 실제로 저장되고,
  나머지 버튼 동작은 아직 없음. `src/data/mypage.js`는 더 이상 화면에서 쓰지 않는다.
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
- 공통 Header(100:157)/Footer(100:193) 프레임은 아직 안 붙임.
- 모바일 규격 시안 없음 — 좁은 화면용 미디어쿼리는 임시로만 넣음, 실제 확인 안 함.

## 명령어
- `npm run dev` 개발 서버
- `npm run build` 빌드
- `npm run lint` oxlint
