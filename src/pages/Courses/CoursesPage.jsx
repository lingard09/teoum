import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import { THEME_OPTIONS, fetchCourses } from '../../api/courseApi.js'
import { cx } from '../../utils/cx.js'
import ApiCourseCard from './ApiCourseCard.jsx'
import styles from './CoursesPage.module.css'

/**
 * 여행코스 목록. 전부 TourAPI 여행코스(contentTypeId=25) 실데이터다.
 * 지역 필터는 API의 areaCode 파라미터로 서버에서 걸러온다.
 */
function CoursesPage() {
  // 지도 팝업의 "여정 생성"이 ?q=안동 처럼 지역어를 넘겨준다.
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const [theme, setTheme] = useState('')
  // 검색어가 있으면 그것이 우선이고, 주제 칩은 검색어를 지웠을 때만 쓰인다.
  const activeKeyword = query || theme
  // 결과에 어느 지역의 응답인지 함께 담아두고 렌더할 때 대조한다.
  // 이펙트 안에서 로딩 상태를 따로 세팅하지 않아도 지역을 바꾼 직후 이전
  // 목록이 남지 않는다.
  const [result, setResult] = useState(null)
  const state =
    result && result.theme === activeKeyword ? result : { status: 'loading', courses: [], totalCount: 0 }

  useEffect(() => {
    let alive = true
    fetchCourses({ keyword: activeKeyword }).then(({ source, courses, totalCount }) => {
      if (!alive) return
      setResult({
        theme: activeKeyword,
        status: source === 'tourapi' ? 'ready' : 'unavailable',
        courses,
        totalCount,
      })
    })
    return () => {
      alive = false
    }
  }, [activeKeyword])

  const themeLabel = query || (THEME_OPTIONS.find((t) => t.keyword === theme)?.label ?? '전체')

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
                  <span>TourAPI 여행코스 중 한옥·고택·전통 주제의 코스만 모았습니다.</span>
                  <span>코스를 열면 실제 경유지와 총거리·소요시간을 확인할 수 있습니다.</span>
                </p>
              </div>

              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>{themeLabel} 주제 코스</span>
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
                  주제별 코스 찾기
                </span>
                <span className={styles.filterNote}>한국관광공사 TourAPI 실시간 조회</span>
              </div>

              {query && (
                <p className={styles.searchNote}>
                  <strong>{query}</strong> 검색 결과입니다.
                  <button type="button" className={styles.clearSearch} onClick={() => setSearchParams({})}>
                    검색 해제
                  </button>
                </p>
              )}

              <div className={styles.areaRow}>
                {THEME_OPTIONS.map((option) => (
                  <button
                    key={option.keyword || 'all'}
                    type="button"
                    className={cx(styles.areaChip, !query && theme === option.keyword && styles.areaChipActive)}
                    onClick={() => {
                      setTheme(option.keyword)
                      if (query) setSearchParams({})
                    }}
                  >
                    {option.label}
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
              <p className={styles.empty}>'{themeLabel}' 주제의 여행코스가 없습니다. 다른 주제를 선택해 보세요.</p>
            )}

            {state.courses.length > 0 && (
              <>
                <p className={styles.paginationTotal}>
                  {themeLabel} 주제 코스 {state.totalCount}개 중 {state.courses.length}개 표시 중
                </p>

                <div className={styles.grid}>
                  {state.courses.map((course) => (
                    <ApiCourseCard key={course.id} course={course} />
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
