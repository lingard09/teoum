import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/home/Hero.jsx";
import TourismCard from "../components/common/TourismCard.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { fetchFeaturedVillages } from "../api/villageApi.js";
import { fetchExperiences } from "../api/experienceApi.js";
import "./HomePage.css";

/** "경상남도 함양군 지곡면 개평길 59" → "경남 함양" 처럼 배지용으로 줄인다. */
function shortRegion(address) {
  if (!address) return "전국";
  const [sido = "", sigungu = ""] = address.split(" ");
  const short = sido
    .replace("특별자치도", "")
    .replace("특별자치시", "")
    .replace("광역시", "")
    .replace("특별시", "")
    .replace("충청", "충")
    .replace("경상", "경")
    .replace("전라", "전")
    .replace("강원", "강원")
    .replace(/도$/, "");
  return [short, sigungu].filter(Boolean).join(" ");
}

function HomePage() {
  // 홈 체험 섹션도 TourAPI 실데이터로 채운다.
  const [apiExperiences, setApiExperiences] = useState([]);

  useEffect(() => {
    let alive = true;
    fetchExperiences({ limit: 4 }).then(({ experiences }) => {
      if (alive) setApiExperiences(experiences);
    });
    return () => {
      alive = false;
    };
  }, []);

  const [villages, setVillages] = useState([]);

  useEffect(() => {
    let active = true;
    fetchFeaturedVillages().then((data) => {
      if (active) setVillages(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main>
      <Hero />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-head__title">전국 대표 한옥마을 큐레이션</h2>
              <p className="section-head__desc">
                고즈넉한 돌담길과 풍경이 좋은 정취가 살아있는 곳
              </p>
            </div>
            <div className="section-head__links">
              <Link to="/map">전체 보기</Link>
              <Link to="/map">지도로 탐색</Link>
            </div>
          </div>
          <div className="village-grid">
            {villages.map((village) => (
              <TourismCard key={village.id} village={village} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-head__title">장인의 숨결이 깃든 전통문화 체험</h2>
            <div className="section-head__links">
              <a href="#experiences">체험 전체보기</a>
            </div>
          </div>
          <div className="experience-grid">
            {apiExperiences.map((exp) => (
              <Link
                key={exp.id}
                to={`/experiences/${exp.contentId}`}
                className="home-exp-card"
              >
                <div className="home-exp-card__media">
                  <img src={exp.image} alt={`${exp.name} 전경`} loading="lazy" />
                  <span className="home-exp-card__badge">{shortRegion(exp.location)}</span>
                </div>
                <div className="home-exp-card__body">
                  <h3 className="home-exp-card__title">{exp.name}</h3>
                  <p className="home-exp-card__desc">{exp.location}</p>
                  <span className="home-exp-card__link">
                    체험 상세 보기
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default HomePage;
