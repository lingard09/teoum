import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import styles from './ExperienceCard.module.css'

function ExperienceCard({ experience }) {
  const { image, badges, highlight, location, duration, title, description, rating, reviewCount, originalPrice, price } =
    experience

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img src={image} alt="" />
        <div className={styles.gradient} />
        <div className={styles.badges}>
          {badges.map((badge) => (
            <span
              key={badge.label}
              className={styles.badge}
              style={{ background: badge.bg, color: badge.color }}
            >
              {badge.icon && <Icon {...badge.icon} />}
              {badge.label}
            </span>
          ))}
        </div>
        <div className={styles.highlight}>
          <Icon {...highlight.icon} />
          <span>{highlight.label}</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.top}>
          <div className={styles.meta}>
            <Icon {...icons.locationPin} />
            <span>{location}</span>
            <span>·</span>
            <Icon {...icons.durationClock} />
            <span>{duration}</span>
          </div>
          <h3 className={styles.title}>
            {title.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </h3>
          <p className={styles.description}>
            {description.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </p>
        </div>

        <div className={styles.footer}>
          <div className={styles.rating}>
            <Icon {...icons.starRating} />
            <span className={styles.ratingValue}>{rating.toFixed(2)}</span>
            <span className={styles.reviewCount}>({reviewCount}개 리뷰)</span>
          </div>
          <div className={styles.price}>
            {originalPrice && <span className={styles.originalPrice}>{originalPrice.toLocaleString()}원</span>}
            <span>
              <span className={styles.priceValue}>{price.toLocaleString()}</span>
              <span className={styles.priceUnit}>원 / 1인</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

export default ExperienceCard
