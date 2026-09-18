import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import { cx } from '../../utils/cx.js'
import styles from './CourseCard.module.css'

function CourseCard({ course }) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img src={course.image} alt="" />
        <span className={styles.gradient} aria-hidden="true" />

        <div className={styles.badges}>
          {course.badges.map((badge) => (
            <span
              key={badge.label}
              className={cx(styles.badge, badge.tone === 'green' && styles.badgeGreen)}
            >
              {badge.label}
            </span>
          ))}
        </div>

        <button type="button" className={styles.bookmark} aria-label={`${course.title} 저장`}>
          <Icon {...icons.courseBookmark} />
        </button>

        <div className={styles.mediaMeta}>
          {course.meta.map((item) => (
            <span
              key={item.text}
              className={cx(styles.metaItem, item.tone === 'mint' && styles.metaMint)}
            >
              {item.iconKey && <Icon {...icons[item.iconKey]} />}
              {item.text}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.rating}>
          <Icon {...icons.courseStar} />
          <span className={styles.ratingValue}>{course.rating}</span>
          <span className={styles.reviewCount}>{course.reviewCount}</span>
        </div>

        <h3 className={styles.title}>{course.title}</h3>

        <p className={styles.description}>
          {course.description.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>

        <div className={styles.waypoints}>
          <div className={styles.waypointHead}>
            <span className={styles.waypointTitle}>
              <Icon {...icons.courseRoute} />
              AI 주요 동선
            </span>
            <span className={styles.waypointCount}>총 {course.waypoints.length}개 스팟</span>
          </div>

          <ol className={styles.waypointList}>
            {course.waypoints.map((spot, index) => (
              <li key={spot} className={styles.waypoint}>
                <span className={styles.waypointStep}>{index + 1}</span>
                <span className={styles.waypointName}>{spot}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* 코스를 고르면 그 조건으로 만들어진 플래너 화면으로 넘어간다. */}
        <Link to={`/plan/result?course=${course.id}`} className={styles.cta}>
          이 코스로 여정 보기 &amp; 커스텀하기
          <Icon {...icons.courseArrow} />
        </Link>
      </div>
    </article>
  )
}

export default CourseCard
