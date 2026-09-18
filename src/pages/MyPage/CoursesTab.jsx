import { useOutletContext } from 'react-router-dom'
import Button from '../../components/Button/Button.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import DayTimeline from './DayTimeline.jsx'
import styles from './CoursesTab.module.css'

function CoursesTab() {
  const { course } = useOutletContext()

  return (
    <section className={styles.section} aria-label="저장된 AI 여행 코스">
      <div className={styles.heading}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>{course.title}</h2>
          <p className={styles.description}>{course.description}</p>
        </div>

        <div className={styles.toolbar}>
          <Button variant="cream">
            <Icon {...icons.share} />
            동행자에게 공유
          </Button>
          <Button variant="cream" className={styles.latin}>
            <Icon {...icons.pdf} />
            PDF 다운로드
          </Button>
          <Button variant="dark">
            <Icon {...icons.calendarEdit} />
            일정 재배열 · 수정
          </Button>
        </div>
      </div>

      {course.days.map((day) => (
        <DayTimeline key={day.label} day={day} />
      ))}
    </section>
  )
}

export default CoursesTab
