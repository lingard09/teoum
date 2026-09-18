import { Link } from "react-router-dom";
import Badge from "./Badge.jsx";
import "./TourismCard.css";

function TourismCard({ village }) {
  const { id, name, region, shortDesc, linkLabel, image } = village;

  return (
    <Link to={`/map?highlight=${id}`} className="tourism-card">
      <div className="tourism-card__media">
        <img src={image} alt={`${name} 전경`} loading="lazy" />
        <Badge className="tourism-card__badge">{region}</Badge>
      </div>
      <div className="tourism-card__body">
        <h3 className="tourism-card__title">{name}</h3>
        <p className="tourism-card__desc">{shortDesc}</p>
        <span className="tourism-card__link">
          {linkLabel}
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
  );
}

export default TourismCard;
