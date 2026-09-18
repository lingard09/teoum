/**
 * 마이페이지 데이터 계층 (Firestore).
 *
 * 구조: users/{uid} 문서에 프로필, 그 아래 reservations/scraps/courses 하위 컬렉션.
 * 익명 로그인이라 계정은 브라우저마다 새로 생기므로, 처음 들어온 uid에는
 * mypageSeed.js의 기본 데이터를 한 번 심어준다(그래야 첫 방문자도 빈 화면 대신
 * 시안대로 채워진 마이페이지를 본다).
 *
 * villageApi.js와 마찬가지로 네트워크/권한 문제로 실패하면 조용히 목업으로
 * 폴백해서 화면이 깨지지 않게 한다.
 */
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  writeBatch,
} from "firebase/firestore";
import { db, ensureUser } from "./firebase.js";
import { resolveIcon, resolveImage } from "../data/assets.js";
import {
  coursesSeed,
  profileSeed,
  reservationsSeed,
  scrapsSeed,
} from "../data/mypageSeed.js";

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

function hydrateReservation(reservation) {
  return {
    ...reservation,
    image: resolveImage(reservation.imageKey),
    category: {
      ...reservation.category,
      icon: resolveIcon(reservation.category.iconKey),
    },
    details: reservation.details.map((detail) => ({
      ...detail,
      icon: resolveIcon(detail.iconKey),
    })),
    actions: reservation.actions.map((action) => ({
      ...action,
      icon: resolveIcon(action.iconKey),
      trailingIcon: resolveIcon(action.trailingIconKey),
    })),
  };
}

function hydrateScrap(scrap) {
  return { ...scrap, image: resolveImage(scrap.imageKey) };
}

function hydrateCourse(course) {
  return {
    ...course,
    days: course.days.map((day) => ({
      ...day,
      waypoints: day.waypoints.map((waypoint) => ({
        ...waypoint,
        image: resolveImage(waypoint.imageKey),
        meta: waypoint.meta.map((item) => ({
          ...item,
          icon: resolveIcon(item.iconKey),
        })),
      })),
    })),
  };
}

/** Firestore를 못 쓸 때 쓰는 목업 스냅샷. 화면 입장에서는 정상 응답과 구분되지 않는다. */
function fallbackData() {
  return {
    source: "fallback",
    profile: hydrateProfile(profileSeed),
    reservations: reservationsSeed.map(hydrateReservation),
    scraps: scrapsSeed.map(hydrateScrap),
    course: hydrateCourse(coursesSeed[0]),
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

// ------------------------------------------------------------------- 시딩

/** users/{uid} 문서가 없으면(= 이 브라우저의 첫 방문) 기본 데이터를 한 번에 심는다. */
async function seedIfNeeded(uid) {
  const snap = await getDoc(userDoc(uid));
  if (snap.exists()) return;

  const batch = writeBatch(db);
  batch.set(userDoc(uid), profileSeed);

  const seedCollection = (name, rows) => {
    rows.forEach(({ id, ...fields }) => {
      batch.set(doc(userCollection(uid, name), id), fields);
    });
  };

  seedCollection("reservations", reservationsSeed);
  seedCollection("scraps", scrapsSeed);
  seedCollection("courses", coursesSeed);

  await batch.commit();
}

// ------------------------------------------------------------------- 조회

/** 문서 id를 데이터에 다시 얹어서 돌려준다(저장할 땐 id를 본문에 중복 저장하지 않으므로). */
async function readCollection(uid, name) {
  const snap = await getDocs(query(userCollection(uid, name), orderBy("order")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * 마이페이지 3개 탭이 쓰는 데이터를 한 번에 읽는다.
 * @returns {Promise<{source: 'firestore'|'fallback', profile, reservations, scraps, course}>}
 */
async function fetchFromFirestore() {
  const uid = await ensureUser();
  await seedIfNeeded(uid);

  const [profileSnap, reservations, scraps, courses] = await Promise.all([
    getDoc(userDoc(uid)),
    readCollection(uid, "reservations"),
    readCollection(uid, "scraps"),
    readCollection(uid, "courses"),
  ]);

  return {
    source: "firestore",
    profile: hydrateProfile(profileSnap.data() ?? profileSeed),
    reservations: reservations.map(hydrateReservation),
    scraps: scraps.map(hydrateScrap),
    // 시안상 저장된 코스는 한 개만 보여준다. 코스가 없으면 목업으로 채운다.
    course: hydrateCourse(courses[0] ?? coursesSeed[0]),
  };
}

export async function loadMyPage() {
  try {
    return await withTimeout(fetchFromFirestore(), LOAD_TIMEOUT_MS);
  } catch (err) {
    console.warn("[mypageApi] Firestore 로드 실패, 목업 데이터로 대체합니다.", err);
    return fallbackData();
  }
}

// ------------------------------------------------------------------- 변경

/** 스크랩 해제. 성공 여부를 돌려줘서 화면이 실패를 되돌릴 수 있게 한다. */
export async function removeScrap(scrapId) {
  const uid = await ensureUser();
  await deleteDoc(doc(userCollection(uid, "scraps"), scrapId));
}
