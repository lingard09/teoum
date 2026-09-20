import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import { fetchCourseThumbnail } from '../../api/courseApi.js'
import styles from './CoursesPage.module.css'

/**
 * 여행코스 카드. 코스에는 대표이미지가 없어서 첫 경유지 사진을 썸네일로 쓴다.
 * 그마저 없으면 이미지 영역을 비워둔다(가짜 이미지를 넣지 않는다).
 */
function ApiCourseCard({ course }) {
  const [image, setImage] = useState(course.image)

  useEffect(() => {
    if (course.image) return undefined
    let alive = true
    fetchCourseThumbnail(course.id).then((url) => {
      if (alive && url) setImage(url)
    })
    return () => {
      alive = false
    }
  }, [course.id, course.image])

  return (
    <article className={styles.courseCard}>
      <div className={styles.courseMedia}>
        {image ? (
          <img src={image} alt="" />
        ) : (
          <div className={styles.coursePlaceholder} aria-hidden="true" />
        )}
        <span className={styles.courseBadge}>TourAPI 여행코스</span>
      </div>

      <div className={styles.courseBody}>
        {course.location && <span className={styles.courseLocation}>{course.location}</span>}
        <h2 className={styles.courseTitle}>{course.title}</h2>
        <Link to={`/plan/result?course=${course.id}`} className={styles.courseCta}>
          코스 경유지 보기
          <Icon {...icons.courseArrow} />
        </Link>
      </div>
    </article>
  )
}

export default ApiCourseCard
