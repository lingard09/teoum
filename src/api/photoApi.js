/**
 * 한국관광공사_관광사진 정보 (PhotoGalleryService1).
 * data.go.kr/data/15101933 — 저작권 제약 없이 쓸 수 있도록 선별된 사진만 모아둔 서비스.
 *
 * detailImage2와 겹치지 않고 서로 보완한다(실측, 한옥마을 12곳):
 *   - detailImage2: 12곳 전부에 3~21장. 항상 있지만 장수가 적다.
 *   - 이 API:       5곳에만 있지만 북촌 47장, 개평 38장처럼 훨씬 많다.
 * 그래서 상세페이지에서는 둘을 합쳐 쓴다.
 *
 * 주의: 키워드 검색은 제목이 아닌 넓은 범위로 매칭돼서 다른 장소가 섞인다
 * (예: "북촌한옥마을" 검색 결과 71장 중 24장이 동림매듭공방·창덕궁 등).
 * 아래에서 제목을 대조해 걸러낸다.
 */

import { callPhotoService } from "./tourApiClient.js";

// 공백·괄호 차이를 무시하고 제목을 비교하기 위한 정규화.
function normalize(text) {
  return String(text ?? "")
    .replace(/[\s()[\]]/g, "")
    .toLowerCase();
}

/**
 * 장소 이름으로 관광사진을 가져온다.
 * 제목이 검색어와 맞물리는 사진만 남기므로, 엉뚱한 장소 사진이 섞이지 않는다.
 *
 * @param {string} title 장소 이름
 * @param {{limit?: number}} [options]
 * @returns {Promise<string[]>} 이미지 URL 목록 (중복 제거)
 */
export async function fetchGalleryPhotos(title, { limit = 12 } = {}) {
  if (!title) return [];
  try {
    const { items } = await callPhotoService("gallerySearchList1", {
      keyword: title,
      numOfRows: "100",
    });

    const wanted = normalize(title);
    const urls = [];
    const seen = new Set();

    for (const item of items) {
      const name = normalize(item.galTitle);
      // 검색어가 제목에 들어 있거나 그 반대인 경우만 같은 장소로 본다.
      if (!name.includes(wanted) && !wanted.includes(name)) continue;

      const url = String(item.galWebImageUrl ?? "").replace(/^http:/, "https:");
      if (!url.startsWith("https://") || seen.has(url)) continue;

      seen.add(url);
      urls.push(url);
      if (urls.length >= limit) break;
    }

    return urls;
  } catch (err) {
    // 사진은 부가 정보다. 실패하면 detailImage2 결과만으로 그린다.
    console.warn(`[photoApi] 관광사진(${title}) 조회 실패`, err);
    return [];
  }
}
