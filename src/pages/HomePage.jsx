import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/home/Hero.jsx";
import TourismCard from "../components/common/TourismCard.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { fetchFeaturedVillages } from "../api/villageApi.js";
import { fetchExperiences } from "../api/experienceApi.js";
import "./HomePage.css";

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

              <article key={exp.id} className="home-exp-card">

                <img src={exp.image} alt="" />

                <div>

                  <p className="home-exp-card__location">{exp.location}</p>

                  <h3 className="home-exp-card__title">{exp.name}</h3>

                </div>

              </article>

            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default HomePage;
