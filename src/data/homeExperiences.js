import hanjiImage from "../assets/images/experiences/jeonju-hanji.png";
import gayangjuImage from "../assets/images/experiences/andong-gayangju.png";
import jagaeImage from "../assets/images/experiences/bukchon-jagae.png";
import lanternImage from "../assets/images/experiences/gyeongju-lantern.png";

export const homeExperiences = [
  {
    id: "jeonju-hanji",
    region: "전주",
    title: "전통 한지 뜨기 & 염색 체험",
    place: "전주전통서적골 본점",
    duration: "60분 소요",
    price: 28000,
    availability: "예약 가능",
    image: hanjiImage,
  },
  {
    id: "andong-gayangju",
    region: "안동",
    title: "종가 비법 가양주(풍주) 빚기",
    place: "안동 예안전통 본가",
    duration: "90분 소요",
    price: 45000,
    availability: "예약 3건",
    image: gayangjuImage,
  },
  {
    id: "bukchon-jagae",
    region: "서울 북촌",
    title: "북촌 명인 자개 소반 만들기",
    place: "북촌전통공예체험관",
    duration: "120분 소요",
    price: 52000,
    availability: "예약 가능",
    image: jagaeImage,
  },
  {
    id: "gyeongju-lantern",
    region: "경북 경주",
    title: "정자초롱 들고 걷는 교촌 밤산책",
    place: "경주 교촌 야간전통 체험",
    duration: "90분 소요",
    price: 15000,
    availability: "예약 가능",
    image: lanternImage,
  },
];
