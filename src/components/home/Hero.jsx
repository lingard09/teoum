import SearchPanel from "./SearchPanel.jsx";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <h1 className="hero__title">한옥의 고즈넉한 쉼을 만나다</h1>
        <p className="hero__subtitle">
          600년 세월이 깃든 나무와 처마선 아래, 스치는 걸음을 멈추고 고즈넉한 여백을 만납니다.
        </p>
        <SearchPanel />
      </div>
    </section>
  );
}

export default Hero;
