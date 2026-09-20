import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import { AREA_OPTIONS, fetchCourses } from '../../api/courseApi.js'
import { cx } from '../../utils/cx.js'
import styles from './CoursesPage.module.css'

/**
 * 여행코스 목록. 전부 TourAPI 여행코스(contentTypeId=25) 실데이터다.
 * 지역 필터는 API의 areaCode 파라미터로 서버에서 걸러온다.
 */
function CoursesPage() {
  const [areaCode, setAreaCode] = useState('')
  // 결과에 어느 지역의 응답인지 함께 담아두고 렌더할 때 대조한다.
  // 이펙트 안에서 로딩 상태를 따로 세팅하지 않아도 지역을 바꾼 직후 이전
  // 목록이 남지 않는다.
  const [result, setResult] = useState(null)
  const state =
    result && result.areaCode === areaCode ? result : { status: 'loading', courses: [], totalCount: 0 }

  useEffect(() => {
    let alive = true
    fetchCourses({ areaCode }).then(({ source, courses, totalCount }) => {
      if (!alive) return
      setResult({
        areaCode,
        status: source === 'tourapi' ? 'ready' : 'unavailable',
        courses,
        totalCount,
      })
    })
    return () => {
      alive = false
    }
  }, [areaCode])

  const areaLabel = AREA_OPTIONS.find((a) => a.code === areaCode)?.label ?? '전국'

  return (
    <>
      <Header />

      <main className={styles.page}>
        <section className={styles.hero}>
          <span className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroTop}>
              <div className={styles.heroText}>
                <h1 className={styles.headline}>
                  <span>한국관광공사가 검증한</span>
                  <span className={styles.headlineAccent}>여행코스 아카이브</span>
                </h1>
                <p className={styles.heroDesc}>
                  <span>TourAPI 4.0의 여행코스 데이터를 그대로 불러옵니다.</span>
                  <span>코스를 열면 실제 경유지와 총거리·소요시간을 확인할 수 있습니다.</span>
                </p>
              </div>

              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>{areaLabel} 등록 코스</span>
                  <span className={styles.metricValue}>
                    {state.status === 'ready' ? state.totalCount : '—'}
                    <span className={styles.metricUnit}>개</span>
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.filterCard}>
              <div className={styles.filterHead}>
                <span className={styles.filterTitle}>
                  <Icon {...icons.planFilter} />
                  지역별 코스 찾기
                </span>
                <span className={styles.filterNote}>한국관광공사 TourAPI 실시간 조회</span>
              </div>

              <div className={styles.areaRow}>
                {AREA_OPTIONS.map((area) => (
                  <button
                    key={area.code || 'all'}
                    type="button"
                    className={cx(styles.areaChip, areaCode === area.code && styles.areaChipActive)}
                    onClick={() => setAreaCode(area.code)}
                  >
                    {area.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.catalog}>
          <div className={styles.catalogInner}>
            {state.status === 'loading' && <p className={styles.empty}>코스를 불러오는 중…</p>}

            {state.status === 'unavailable' && (
              <p className={styles.empty}>
                TourAPI에서 코스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
              </p>
            )}

            {state.status === 'ready' && state.courses.length === 0 && (
              <p className={styles.empty}>{areaLabel}에 등록된 여행코스가 없습니다.</p>
            )}

            {state.courses.length > 0 && (
              <>
                <p className={styles.paginationTotal}>
                  {areaLabel} {state.totalCount}개 코스 중 {state.courses.length}개 표시 중
                </p>

                <div className={styles.grid}>
                  {state.courses.map((course) => (
                    <article key={course.id} className={styles.courseCard}>
                      <div className={styles.courseMedia}>
                        <img src={course.image} alt="" />
                        <span className={styles.courseBadge}>TourAPI 여행코스</span>
                      </div>
                      <div className={styles.courseBody}>
                        {course.location && (
                          <span className={styles.courseLocation}>{course.location}</span>
                        )}
                        <h2 className={styles.courseTitle}>{course.title}</h2>
                        <Link to={`/plan/result?course=${course.id}`} className={styles.courseCta}>
                          코스 경유지 보기
                          <Icon {...icons.courseArrow} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default CoursesPage
