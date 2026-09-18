import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import {
  categories,
  courses,
  ctaBanner,
  filterBar,
  filterFields,
  hero,
  notice,
  pagination,
  sorts,
} from '../../data/aiCourses.js'
import { cx } from '../../utils/cx.js'
import CourseCard from './CourseCard.jsx'
import styles from './CoursesPage.module.css'

// 각 필터의 기본값은 선택지의 첫 항목이다.
const DEFAULT_FILTERS = Object.fromEntries(filterFields.map((f) => [f.id, f.options[0]]))

// 기본값은 "아직 고르지 않음"으로 취급해서 거르지 않는다.
// 시안도 필터를 건드리지 않은 초기 상태에서 코스가 전부 보인다.
const isDefault = (id, value) => DEFAULT_FILTERS[id] === value

function CoursesPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('popular')

  const visibleCourses = useMemo(() => {
    const matched = courses.filter((course) => {
      if (category !== 'all' && course.category !== category) return false
      if (!isDefault('region', filters.region) && course.region !== filters.region) return false
      if (!isDefault('duration', filters.duration) && course.duration !== filters.duration) return false
      if (!isDefault('transport', filters.transport) && course.transport !== filters.transport)
        return false
      return true
    })

    // 정렬은 목업 데이터 기준으로만 동작한다(가격 필드가 없어 평점/이름으로 대체).
    const sorted = [...matched]
    if (sort === 'popular') sorted.sort((a, b) => Number(b.rating) - Number(a.rating))
    if (sort === 'walk') sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'))
    if (sort === 'new') sorted.reverse()
    return sorted
  }, [filters, category, sort])

  const setFilter = (id, value) => setFilters((prev) => ({ ...prev, [id]: value }))

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
                  <span>{hero.headline[0]}</span>
                  <span className={styles.headlineAccent}>{hero.headline[1]}</span>
                </h1>
                <p className={styles.heroDesc}>
                  {hero.description.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
              </div>

              <div className={styles.metrics}>
                {hero.metrics.map((metric, index) => (
                  <div key={metric.label} className={styles.metric}>
                    {index > 0 && <span className={styles.metricDivider} aria-hidden="true" />}
                    <span className={styles.metricLabel}>{metric.label}</span>
                    <span className={styles.metricValue}>
                      {metric.value}
                      <span className={styles.metricUnit}>{metric.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.filterCard}>
              <div className={styles.filterHead}>
                <span className={styles.filterTitle}>
                  <Icon {...icons.planFilter} />
                  {filterBar.title}
                </span>
                <span className={styles.filterNote}>{filterBar.note}</span>
              </div>

              <div className={styles.filterGrid}>
                {filterFields.map((field) => (
                  <label key={field.id} className={styles.field}>
                    <span className={styles.fieldLabel}>
                      <Icon {...icons[field.iconKey]} />
                      {field.label}
                    </span>
                    <span className={styles.selectWrap}>
                      <select
                        className={styles.select}
                        value={filters[field.id]}
                        onChange={(e) => setFilter(field.id, e.target.value)}
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <Icon {...icons.planChevron} className={styles.selectChevron} />
                    </span>
                  </label>
                ))}
              </div>

              <div className={styles.filterSubmit}>
                <button
                  type="button"
                  className={styles.generateButton}
                  onClick={() => navigate('/plan/result')}
                >
                  <Icon {...icons.planSparkle} />
                  {filterBar.submitLabel}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.catalog}>
          <div className={styles.catalogInner}>
            <div className={styles.tabsRow}>
              <div className={styles.categories} role="tablist" aria-label="코스 분류">
                {categories.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={category === tab.id}
                    className={cx(styles.category, category === tab.id && styles.categoryActive)}
                    onClick={() => setCategory(tab.id)}
                  >
                    {tab.label}
                    {tab.count != null && <span className={styles.categoryCount}>{tab.count}</span>}
                  </button>
                ))}
              </div>

              <div className={styles.sorts}>
                {sorts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={cx(styles.sort, sort === item.id && styles.sortActive)}
                    onClick={() => setSort(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {visibleCourses.length === 0 ? (
              <p className={styles.empty}>
                선택한 조건에 맞는 코스가 없습니다. 조건을 바꾸거나 AI로 새 여정을 만들어 보세요.
              </p>
            ) : (
              <div className={styles.grid}>
                {visibleCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

            <div className={styles.pagination}>
              <span className={styles.paginationTotal}>{pagination.totalLabel}</span>
              <nav className={styles.pages} aria-label="코스 목록 페이지">
                <button type="button" className={styles.pageArrow} aria-label="이전 페이지">
                  ‹
                </button>
                {pagination.pages.map((page, index) => (
                  <span
                    key={`${page}-${index}`}
                    className={cx(styles.pageNum, page === 1 && styles.pageNumActive)}
                  >
                    {page}
                  </span>
                ))}
                <button type="button" className={styles.pageArrow} aria-label="다음 페이지">
                  ›
                </button>
              </nav>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.ctaBanner}>
            <h2 className={styles.ctaTitle}>{ctaBanner.title}</h2>
            <p className={styles.ctaDesc}>{ctaBanner.description}</p>
            <button
              type="button"
              className={styles.ctaButton}
              onClick={() => navigate('/plan/result')}
            >
              {ctaBanner.buttonLabel}
            </button>
            <p className={styles.ctaNote}>{ctaBanner.note}</p>
          </div>
        </section>

        <section className={styles.notice}>
          <div className={styles.noticeInner}>
            <div className={styles.noticeText}>
              <p className={styles.noticeTitle}>{notice.text}</p>
              <p className={styles.noticeSub}>{notice.sub}</p>
            </div>
            <div className={styles.noticeLinks}>
              {notice.links.map((link) => (
                <span key={link}>{link}</span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default CoursesPage
