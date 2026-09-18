/**
 * Firebase 초기화 + 익명 로그인.
 *
 * 아래 config 값은 비밀이 아니다. Firebase 웹 config는 클라이언트에 그대로
 * 노출되는 것을 전제로 설계됐고(공식 문서 기준), 실제 접근 제어는 전부
 * firestore.rules에서 한다. TourAPI 서비스키(VITE_TOUR_API_KEY)와 달리
 * .env로 뺄 이유가 없어서 커밋해두고, 팀원이 clone 직후 바로 돌릴 수 있게 한다.
 */
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDHXsJpeH6r93GwOM2pu0BnFXwZDbtjAWU",
  authDomain: "teoum-hanok.firebaseapp.com",
  projectId: "teoum-hanok",
  storageBucket: "teoum-hanok.firebasestorage.app",
  messagingSenderId: "849864293299",
  appId: "1:849864293299:web:4b40a7f549030d7ddca9c6",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

let signInPromise = null;

/**
 * 로그인된 uid를 돌려준다. 계정이 없으면 익명 계정을 만든다.
 *
 * 익명 계정은 브라우저(IndexedDB)에 저장돼서 새로고침/재방문해도 같은 uid가
 * 유지된다. 대신 기기나 브라우저가 바뀌면 다른 사람으로 취급된다 — 나중에
 * Google 로그인을 붙일 때 linkWithCredential로 기존 데이터를 승계시킬 수 있다.
 *
 * 여러 컴포넌트가 동시에 호출해도 로그인 요청이 한 번만 나가도록 promise를 캐시한다.
 * @returns {Promise<string>} uid
 */
export function ensureUser() {
  if (auth.currentUser) return Promise.resolve(auth.currentUser.uid);
  if (signInPromise) return signInPromise;

  signInPromise = new Promise((resolve, reject) => {
    // 저장된 세션 복구가 끝날 때까지 기다린 뒤, 그래도 없으면 익명 로그인한다.
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        if (user) {
          resolve(user.uid);
          return;
        }
        signInAnonymously(auth)
          .then((cred) => resolve(cred.user.uid))
          .catch(reject);
      },
      (err) => {
        unsubscribe();
        reject(err);
      }
    );
  });

  signInPromise.catch(() => {
    // 실패한 promise를 캐시에 남겨두면 이후 호출이 전부 같은 에러를 받는다.
    signInPromise = null;
  });

  return signInPromise;
}
