import "./StoryCard.css";

function StoryCard({ story }) {
  const { label, title, description, image } = story;

  return (
    <a href="#" className="story-card" onClick={(e) => e.preventDefault()}>
      <div className="story-card__media">
        <img src={image} alt={title} loading="lazy" />
      </div>
      <div className="story-card__body">
        <span className="story-card__label">{label}</span>
        <h3 className="story-card__title">{title}</h3>
        <p className="story-card__desc">{description}</p>
        <span className="story-card__link">
          읽어보기
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
    </a>
  );
}

export default StoryCard;
