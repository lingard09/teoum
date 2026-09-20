import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import { fetchCourseDetail } from '../../api/courseApi.js'
import styles from './PlannerPage.module.css'

/**
 * 여행코스 상세. 경유지·총거리·소요시간 모두 TourAPI 실데이터다.
 * 코스를 지정하지 않고 들어오면 목록으로 돌려보낸다.
 */
function PlannerPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const courseId = searchParams.get('course')

  const [detail, setDetail] = useState(null)
  const [status, setStatus] = useState(courseId ? 'loading' : 'none')

  useEffect(() => {
    if (!courseId) return undefined
    let alive = true
    fetchCourseDetail(courseId).then((d) => {
      if (!alive) return
      setDetail(d)
      setStatus(d ? 'ready' : 'failed')
    })
    return () => {
      alive = false
    }
  }, [courseId])

  const conditions = [
    detail?.distance && { iconKey: 'planPin', label: detail.distance },
    detail?.takeTime && { iconKey: 'planCalendar', label: detail.takeTime },
    detail?.theme && { iconKey: 'planMood', label: detail.theme },
  ].filter(Boolean)

  return (
    <>
      <Header />

      <header className={styles.topBar}>
        <div className={styles.topInner}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>{detail?.title ?? '여행코스'}</h1>
            <p className={styles.subtitle}>
              {status === 'ready'
                ? '한국관광공사 TourAPI 여행코스 데이터'
                : status === 'loading'
                  ? '코스를 불러오는 중…'
                  : '코스를 선택하면 경유지가 표시됩니다.'}
            </p>
          </div>

          <div className={styles.topActions}>
            {conditions.length > 0 && (
              <div className={styles.conditions}>
                {conditions.map((condition, index) => (
                  <div key={condition.label} className={styles.condition}>
                    {index > 0 && <span className={styles.conditionDivider} aria-hidden="true" />}
                    <Icon {...icons[condition.iconKey]} />
                    <span>{condition.label}</span>
                  </div>
                ))}
              </div>
            )}

            <button type="button" className={styles.changeButton} onClick={() => navigate('/plan')}>
              <Icon {...icons.planRefresh} />
              다른 코스 보기
            </button>
          </div>
        </div>
      </header>

      <main className={styles.page}>
        <div className={styles.container}>
          {status === 'none' && (
            <p className={styles.emptyState}>
              선택된 코스가 없습니다. <Link to="/plan">여행코스 목록</Link>에서 코스를 골라 주세요.
            </p>
          )}

          {status === 'loading' && <p className={styles.emptyState}>경유지를 불러오는 중…</p>}

          {status === 'failed' && (
            <p className={styles.emptyState}>
              TourAPI에서 코스를 불러오지 못했습니다. <Link to="/plan">목록으로 돌아가기</Link>
            </p>
          )}

          {status === 'ready' && (
            <>
              {detail.overview && <p className={styles.overview}>{detail.overview}</p>}

              <div className={styles.sectionHead}>
                <div className={styles.sectionTitleRow}>
                  <h2 className={styles.sectionTitle}>코스 경유지</h2>
                  <span className={styles.countBadge}>총 {detail.waypoints.length}곳</span>
                </div>
                {detail.schedule && (
                  <div className={styles.sectionMeta}>
                    <span className={styles.metaItem}>{detail.schedule}</span>
                  </div>
                )}
              </div>

              {detail.waypoints.length === 0 ? (
                <p className={styles.emptyState}>이 코스에는 등록된 경유지 정보가 없습니다.</p>
              ) : (
                <ol className={styles.steps}>
                  {detail.waypoints.map((waypoint, index) => (
                    <li key={waypoint.name} className={styles.step}>
                      <span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span>

                      {waypoint.image && (
                        <img className={styles.stepImage} src={waypoint.image} alt="" />
                      )}

                      <div className={styles.stepBody}>
                        <div className={styles.stepHeading}>
                          <h3 className={styles.stepTitle}>{waypoint.name}</h3>
                        </div>
                        {waypoint.description && (
                          <p className={styles.stepDesc}>{waypoint.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}

export default PlannerPage
