import { Link, useOutletContext } from 'react-router-dom'
import styles from './CoursesTab.module.css'

/**
 * 저장된 AI 여행 코스. 계획하기에서 만든 코스를 그대로 담아둔 것이라
 * 각 장소는 TourAPI에 실재하고, 상세·예약 화면으로 바로 이어진다.
 */
function CoursesTab() {
  const { courses, removeCourse } = useOutletContext()

  if (courses.length === 0) {
    return (
      <p className={styles.empty}>
        저장된 코스가 없습니다. <Link to="/plan">계획하기</Link>에서 AI 여정을 만들어 보관함에
        담아보세요.
      </p>
    )
  }

  return (
    <section className={styles.section} aria-label="저장된 AI 여행 코스">
      {courses.map((course) => (
        <article key={course.id} className={styles.card}>
          <header className={styles.cardHead}>
            <div>
              <h2 className={styles.title}>{course.title}</h2>
              {course.summary && <p className={styles.description}>{course.summary}</p>}
            </div>

            <div className={styles.cardMeta}>
              <span className={styles.savedAt}>저장 {course.savedAt}</span>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeCourse(course.id)}
              >
                삭제
              </button>
            </div>
          </header>

          <ol className={styles.stops}>
            {course.stops.map((stop, index) => (
              <li key={`${stop.contentId}-${index}`} className={styles.stop}>
                <span className={styles.stopNumber}>{String(index + 1).padStart(2, '0')}</span>

                {stop.image && <img className={styles.stopImage} src={stop.image} alt="" />}

                <div className={styles.stopBody}>
                  <div className={styles.stopHead}>
                    {stop.time && <span className={styles.stopTime}>{stop.time}</span>}
                    <h3 className={styles.stopName}>{stop.name}</h3>
                  </div>
                  {stop.address && <p className={styles.stopAddress}>{stop.address}</p>}
                  {stop.reason && <p className={styles.stopReason}>{stop.reason}</p>}
                </div>

                <Link
                  to={`/stays/reserve?contentId=${stop.contentId}`}
                  className={styles.stopLink}
                >
                  예약
                </Link>
              </li>
            ))}
          </ol>
        </article>
      ))}
    </section>
  )
}

export default CoursesTab
