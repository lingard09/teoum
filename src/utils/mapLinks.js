/**
 * 외부 지도/전화 링크.
 *
 * 카카오맵 길찾기 스킴: https://map.kakao.com/link/to/{장소명},{위도},{경도}
 * 좌표가 없으면 장소명 검색으로 대체한다(TourAPI에 좌표가 빠진 항목이 있다).
 */
export function kakaoDirectionsUrl({ name, lat, lng }) {
  const label = encodeURIComponent(name ?? '목적지')
  if (lat && lng) return `https://map.kakao.com/link/to/${label},${lat},${lng}`
  return `https://map.kakao.com/link/search/${label}`
}

/** 전화 링크. 번호가 없으면 null을 돌려줘서 호출부가 버튼을 숨기게 한다. */
export function telUrl(tel) {
  const digits = String(tel ?? '').replace(/[^0-9+]/g, '')
  return digits.length >= 8 ? `tel:${digits}` : null
}
