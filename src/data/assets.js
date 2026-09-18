// Firestore에는 이미지/아이콘을 넣을 수 없다(번들 해시 경로라 저장해봐야 의미가 없음).
// 그래서 DB에는 imageKey/iconKey 문자열만 저장하고, 화면에 뿌리기 직전에
// 여기서 실제 에셋으로 바꿔준다.
import { icons } from '../assets/icons/index.js'
import avatar from '../assets/images/avatar.png'
import andongYemijeong from '../assets/images/andong-yemijeong.jpg'
import bukchonNajeon from '../assets/images/bukchon-najeon.jpg'
import eunpyeongRooftop from '../assets/images/eunpyeong-rooftop.jpg'
import gyeonggijeon from '../assets/images/gyeonggijeon.jpg'
import gyodongBeopju from '../assets/images/gyodong-beopju.jpg'
import hanjiWorkshop from '../assets/images/hanji-workshop.jpg'
import hanokTea from '../assets/images/hanok-tea.jpg'
import jeondongCathedral from '../assets/images/jeondong-cathedral.jpg'
import soswaewon from '../assets/images/soswaewon.jpg'

export const images = {
  avatar,
  'andong-yemijeong': andongYemijeong,
  'bukchon-najeon': bukchonNajeon,
  'eunpyeong-rooftop': eunpyeongRooftop,
  gyeonggijeon,
  'gyodong-beopju': gyodongBeopju,
  'hanji-workshop': hanjiWorkshop,
  'hanok-tea': hanokTea,
  'jeondong-cathedral': jeondongCathedral,
  soswaewon,
}

// 키가 없으면 화면이 깨지는 대신 이미지/아이콘만 빠지게 undefined를 돌려준다.
export function resolveImage(key) {
  return key ? images[key] : undefined
}

export function resolveIcon(key) {
  return key ? icons[key] : undefined
}
