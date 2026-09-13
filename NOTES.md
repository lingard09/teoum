# teoum 작업 노트

피그마: https://www.figma.com/design/Dc7FeLrTzZVgLWm6FDcW74/한옥모아 (Page 1, 데스크톱 1280 기준)

## 현재 상태 (2026-09-14)
- Vite + React(JS) + react-router-dom, 스타일은 CSS Modules + `src/index.css`의 색/그림자/폰트 토큰.
- 폰트: Pretendard(jsdelivr CDN) + Plus Jakarta Sans(Google Fonts) — `index.html`에서 로드.
- **구현 완료: 나의 여정 보관함 (마이페이지)** — 피그마 프레임 3개를 한 페이지의 탭 3개로 구현
  - `/mypage/upcoming` ← 1:2379 (예약 카드 2개)
  - `/mypage/courses` ← 100:210 (AI 코스 타임라인)
  - `/mypage/scraps` ← 100:807 (스크랩 카드 3개)
- 데이터는 전부 목업(`src/data/mypage.js`). 버튼 클릭 동작은 아직 없음.
- 이미지/아이콘은 피그마에서 받아 `src/assets/`에 커밋함 (MCP 에셋 URL은 7일 뒤 만료).

## 미확정
- 첫 번째 탭 이름: 프레임 1:2379는 "예약 내역", 나머지 두 프레임은 "다가오는 여정" → 일단 "다가오는 여정" 사용.
- 공통 Header(100:157)/Footer(100:193) 프레임은 아직 안 붙임.
- 모바일 규격 시안 없음 — 좁은 화면용 미디어쿼리는 임시로만 넣음, 실제 확인 안 함.

## 명령어
- `npm run dev` 개발 서버
- `npm run build` 빌드
- `npm run lint` oxlint
