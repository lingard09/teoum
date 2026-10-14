# 터움 (Teoum)

한국 전통 문화 여행 플랫폼. 한옥마을·고택·전통 체험을 탐색하고, AI가 짜주는 맞춤 코스로 여정을 계획합니다.

**배포** → https://teoum.pages.dev

---

## 주요 기능

- **둘러보기** — 지도에서 전통 관광지 탐색, 혼잡도 낮은 시간대 확인
- **체험하기** — 전통 문화 체험 목록, 카테고리·지역·난이도 필터
- **머무르기** — 한옥스테이·고택 숙소 큐레이션
- **계획하기** — OpenAI 기반 AI 맞춤 코스 생성, 방문 예정일·날씨·혼잡도 예측 포함
- **마이페이지** — 여정 보관함 (다가오는 여정 / AI 코스 / 스크랩), Firebase 저장

## 데이터

모든 장소 정보는 **한국관광공사 TourAPI** 실데이터입니다. 평점·리뷰·요금처럼 API가 제공하지 않는 값은 만들어 넣지 않습니다.

| 출처 | 용도 |
|---|---|
| TourAPI KorService2 | 장소 정보·사진·주소·소개 |
| TourAPI DataLab | 방문자수 (정렬용) |
| TourAPI TatsCnctrRateService | 집중률 예측 (향후 30일) |
| TourAPI KorWithService2 | 무장애 여행 정보 |
| TourAPI Odii | 오디오 가이드 대본 |
| 기상청 VilageFcst + MidFcst | 단기·중기 날씨 예보 (최대 10일) |
| OpenAI GPT | AI 코스 생성 (후보 장소 안에서만 선택) |
| Firebase Firestore | 마이페이지 데이터 (익명 로그인) |
| 네이버 지도 | 지도 탐색 |

공공 API 호출은 **Cloudflare Functions 프록시**(`/api/tour`)를 거쳐 엣지에 하루 캐시합니다. 서비스 키가 브라우저 번들에 포함되지 않고, 일일 호출 한도가 방문자 수에 비례해 소진되지 않습니다.

## 스택

`React` `React Router` `Vite` `Firebase` `Cloudflare Pages` `Cloudflare Functions`

## 로컬 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# VITE_TOUR_API_KEY, VITE_NAVER_MAP_CLIENT_ID 값 채우기

# 개발 서버 (Functions 없음 — Vite 프록시로 대체)
npm run dev

# Functions 포함 로컬 실행
npx wrangler pages dev
```

## 배포

**Cloudflare Pages** — `main` 푸시 시 자동 빌드·배포

- Build command: `npm run build`
- Output directory: `dist`
- 환경변수는 Cloudflare 프로젝트 Settings > Environment variables에 등록
- SPA 딥링크는 `public/_redirects`가 처리

OpenAI 키 등록:
```bash
npx wrangler pages secret put OPENAI_API_KEY --project-name teoum
```
