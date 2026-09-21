/**
 * 마이페이지 데이터 계층 (Firestore).
 *
 * 구조: users/{uid} 문서에 프로필, 그 아래 reservations/scraps/courses 하위 컬렉션.
 *
 * 더미 없는 버전이라 기본 데이터를 심지 않는다. 사용자가 직접 담은 것만 보이고,
 * 아무것도 없으면 빈 상태를 그대로 보여준다. 조회에 실패해도 목업으로 채우지 않는다.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { db, ensureUser } from "./firebase.js";
import { resolveImage } from "../data/assets.js";

function userDoc(uid) {
  return doc(db, "users", uid);
}

function userCollection(uid, name) {
  return collection(db, "users", uid, name);
}

// ---------------------------------------------------------------- 에셋 복원
// DB에 저장된 imageKey/iconKey 문자열을 컴포넌트가 기대하는 image/icon 값으로 되돌린다.

function hydrateProfile(profile) {
  return { ...profile, avatar: resolveImage(profile.avatarKey) };
}

/**
 * 저장된 예약. 예약 화면에서 담은 값이라 이미지가 TourAPI 원격 URL이고,
 * 별도 에셋 복원이 필요 없다.
 */
function hydrateReservation(reservation) {
  return reservation;
}

function hydrateScrap(scrap) {
  // TourAPI에서 담은 항목은 번들 에셋이 아니라 원격 URL을 그대로 들고 있다.
  return { ...scrap, image: scrap.imageUrl ?? resolveImage(scrap.imageKey) };
}

/**
 * 저장된 AI 코스. 계획하기에서 만든 코스를 그대로 담아두므로 별도 에셋 복원이
 * 필요 없다(장소 사진은 TourAPI 원격 URL이다).
 */
function hydrateCourse(course) {
  return { ...course, stops: Array.isArray(course.stops) ? course.stops : [] };
}

/** Firestore를 못 쓸 때의 빈 상태. 더미로 채우지 않는다. */
function emptyData() {
  return {
    source: "unavailable",
    profile: null,
    reservations: [],
    scraps: [],
    courses: [],
  };
}


// Firebase Auth가 아직 프로비저닝되지 않았거나 네트워크가 막힌 환경에서는 SDK가
// 에러를 던지지 않고 재시도를 반복하며 응답을 주지 않는 경우가 있다. 그대로 두면
// 화면이 "불러오는 중"에서 영영 멈추므로, 일정 시간이 지나면 실패로 간주하고
// 아래 폴백 경로를 타게 한다.
const LOAD_TIMEOUT_MS = 8000;

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Firestore 응답이 ${ms}ms 안에 오지 않았습니다.`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// ------------------------------------------------------------------- 조회

/** 문서 id를 데이터에 다시 얹어서 돌려준다(저장할 땐 id를 본문에 중복 저장하지 않으므로). */
async function readCollection(uid, name) {
  const snap = await getDocs(query(userCollection(uid, name), orderBy("order")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * 마이페이지 3개 탭이 쓰는 데이터를 한 번에 읽는다.
 * @returns {Promise<{source: 'firestore'|'unavailable', profile, reservations, scraps, courses}>}
 */
async function fetchFromFirestore() {
  const uid = await ensureUser();
  const [profileSnap, reservations, scraps, courses] = await Promise.all([
    getDoc(userDoc(uid)),
    readCollection(uid, "reservations"),
    readCollection(uid, "scraps"),
    readCollection(uid, "courses"),
  ]);

  return {
    source: "firestore",
    profile: profileSnap.exists() ? hydrateProfile(profileSnap.data()) : null,
    reservations: reservations.map(hydrateReservation),
    scraps: scraps.map(hydrateScrap),
    courses: courses.map(hydrateCourse),
  };
}

export async function loadMyPage() {
  try {
    return await withTimeout(fetchFromFirestore(), LOAD_TIMEOUT_MS);
  } catch (err) {
    console.warn("[mypageApi] Firestore 로드 실패, 목업 데이터로 대체합니다.", err);
    return emptyData();
  }
}

// ------------------------------------------------------------------- 변경

/** 스크랩 해제. 성공 여부를 돌려줘서 화면이 실패를 되돌릴 수 있게 한다. */
export async function removeScrap(scrapId) {
  const uid = await ensureUser();
  await deleteDoc(doc(userCollection(uid, "scraps"), scrapId));
}

/**
 * 스크랩 추가. 문서 id를 대상의 id로 쓰기 때문에 같은 대상을 여러 번 눌러도
 * 문서가 늘어나지 않고 덮어써진다.
 *
 * @param {{id: string, location: string, title: string, description: string, imageKey: string}} scrap
 */
export async function addScrap(scrap) {
  const uid = await ensureUser();
  const { id, ...fields } = scrap;
  await setDoc(doc(userCollection(uid, "scraps"), id), {
    ...fields,
    scrapedAt: formatScrapDate(new Date()),
    // 마이페이지는 order로 정렬한다. 새로 담은 것이 위로 오도록 음수 타임스탬프를 쓴다.
    order: -Date.now(),
  });
}

/** 마이페이지 카드에 쓰는 "2026.03.28" 형식. */
function formatScrapDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

/**
 * 스크랩된 대상의 id 집합. 목록 화면에서 하트의 on/off를 칠하는 용도라
 * 문서 전체를 읽지 않고 id만 본다. 실패하면 빈 집합(전부 꺼진 상태)이다.
 *
 * @returns {Promise<Set<string>>}
 */
export async function fetchScrapIds() {
  try {
    const uid = await withTimeout(ensureUser(), LOAD_TIMEOUT_MS);
    const snap = await getDocs(userCollection(uid, "scraps"));
    return new Set(snap.docs.map((d) => d.id));
  } catch (err) {
    console.warn("[mypageApi] 스크랩 목록 조회 실패, 빈 상태로 표시합니다.", err);
    return new Set();
  }
}

/**
 * 계획하기에서 만든 AI 코스를 보관함에 담는다.
 * 문서 id는 저장 시각 기반이라 같은 조건으로 여러 번 만들어도 각각 남는다.
 */
export async function saveAiCourse(plan) {
  const uid = await ensureUser();
  const id = `ai-${Date.now()}`;
  await setDoc(doc(userCollection(uid, "courses"), id), {
    title: plan.title ?? "AI 맞춤 코스",
    summary: plan.summary ?? null,
    stops: (plan.stops ?? []).map((stop) => ({
      contentId: String(stop.contentId),
      name: stop.name ?? "",
      address: stop.address ?? null,
      image: stop.image ?? null,
      time: stop.time ?? null,
      reason: stop.reason ?? null,
    })),
    savedAt: formatScrapDate(new Date()),
    // 마이페이지는 order로 정렬한다. 최근 저장이 위로 오도록 음수 타임스탬프를 쓴다.
    order: -Date.now(),
  });
  return id;
}

/** 저장된 코스 삭제. */
export async function removeCourse(courseId) {
  const uid = await ensureUser();
  await deleteDoc(doc(userCollection(uid, "courses"), courseId));
}

/**
 * 예약 확정 시 보관함에 담는다. 장소 정보는 TourAPI에서 온 값이고, 일정·인원은
 * 사용자가 예약 화면에서 고른 값이다. 결제 자체는 데모 플로우다.
 */
export async function saveReservation(reservation) {
  const uid = await ensureUser();
  const id = `rv-${Date.now()}`;
  await setDoc(doc(userCollection(uid, "reservations"), id), {
    contentId: reservation.contentId ? String(reservation.contentId) : null,
    title: reservation.title ?? "방문 계획",
    location: reservation.location ?? null,
    image: reservation.image ?? null,
    dateLabel: reservation.dateLabel ?? null,
    peopleLabel: reservation.peopleLabel ?? null,
    // 결제를 대행하지 않으므로 금액은 저장하지 않는다(예전 totalLabel 자리).
    note: reservation.note ?? null,
    typeLabel: reservation.typeLabel ?? null,
    savedAt: formatScrapDate(new Date()),
    order: -Date.now(),
  });
  return id;
}

/** 예약 취소. */
export async function removeReservation(reservationId) {
  const uid = await ensureUser();
  await deleteDoc(doc(userCollection(uid, "reservations"), reservationId));
}
