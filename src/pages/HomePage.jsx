import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/home/Hero.jsx";
import TourismCard from "../components/common/TourismCard.jsx";
import StoryCard from "../components/common/StoryCard.jsx";
import ExperienceCard from "../components/common/ExperienceCard.jsx";
import Footer from "../components/common/Footer.jsx";
import { fetchFeaturedVillages } from "../api/villageApi.js";
import { stories } from "../data/stories.js";
import { experiences } from "../data/experiences.js";
import "./HomePage.css";

function HomePage() {
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

      <section className="section section--muted">
        <div className="container">
          <div className="section-head">
            <h2 className="section-head__title">고택과 선비 정신, 문화 아카이브</h2>
            <div className="section-head__links">
              <a href="#stories">전체보기</a>
            </div>
          </div>
          <div className="story-grid">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
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
            {experiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default HomePage;
