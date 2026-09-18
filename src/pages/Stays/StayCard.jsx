import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import { cx } from '../../utils/cx.js'
import styles from './StayCard.module.css'

function StayCard({ stay }) {
  const [saved, setSaved] = useState(false)
  const { image, badges, location, subtitle, title, description, amenities, rating, reviewCount, price } = stay

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img src={image} alt="" />
        <div className={styles.badges}>
          {badges.map((badge) => (
            <span key={badge.label} className={cx(styles.badge, styles[badge.tone])}>
              {badge.icon && <Icon {...badge.icon} />}
              {badge.label}
            </span>
          ))}
        </div>
        <button
          type="button"
          className={cx(styles.saveButton, saved && styles.saveButtonActive)}
          onClick={() => setSaved((v) => !v)}
          aria-pressed={saved}
          aria-label="관심 한옥 보관"
        >
          <Icon {...icons.stayHeart} />
        </button>
        <div className={styles.locationTag}>
          <Icon {...icons.stayLocationPin} />
          <span>{location}</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.top}>
          <div className={styles.subtitleRow}>
            <span className={styles.subtitle}>{subtitle}</span>
            <span className={styles.rating}>
              <Icon {...icons.stayStar} />
              <span className={styles.ratingValue}>{rating.toFixed(2)}</span>
              <span className={styles.reviewCount}>({reviewCount})</span>
            </span>
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
          <div className={styles.amenities}>
            {amenities.map((item) => (
              <span key={item} className={styles.amenity}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            <span className={styles.priceLabel}>1박 기준 요금</span>
            <span>
              <span className={styles.priceValue}>{price.toLocaleString()}</span>
              <span className={styles.priceUnit}>원 ~</span>
            </span>
          </div>
          <Link to="/stays/reserve" className={styles.reserveButton}>
            예약 일정 확인
          </Link>
        </div>
      </div>
    </article>
  )
}

export default StayCard
