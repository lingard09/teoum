import Badge from "./Badge.jsx";
import "./ExperienceCard.css";

const formatPrice = (price) => `${price.toLocaleString("ko-KR")}원`;

function ExperienceCard({ experience }) {
  const { region, title, place, duration, price, availability, image } = experience;

  return (
    <a href="#" className="experience-card" onClick={(e) => e.preventDefault()}>
      <div className="experience-card__media">
        <img src={image} alt={`${title} 이미지`} loading="lazy" />
        <Badge className="experience-card__badge">{region}</Badge>
      </div>
      <div className="experience-card__body">
        <h3 className="experience-card__title">{title}</h3>
        <p className="experience-card__meta">
          {place} · {duration}
        </p>
        <div className="experience-card__footer">
          <span className="experience-card__availability">{availability}</span>
          <span className="experience-card__price">{formatPrice(price)}</span>
        </div>
      </div>
    </a>
  );
}

export default ExperienceCard;
