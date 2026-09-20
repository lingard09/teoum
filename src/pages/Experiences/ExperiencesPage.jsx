import { useEffect, useState } from 'react'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import { cx } from '../../utils/cx.js'
import {
  hero,
  categories,
  regions,
  difficultyFilters,
  sortOptions,
  trustItems,
} from '../../data/experiences.js'
import { fetchExperiences } from '../../api/experienceApi.js'
import ApiExperienceCard from './ApiExperienceCard.jsx'
import styles from './ExperiencesPage.module.css'

function ExperiencesPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  // TourAPI 관광지/문화시설에서 실제 체험 시설을 받아온다.
  // 키가 없거나 실패하면 비어서 큐레이션 목업만 보인다.
  const [apiExperiences, setApiExperiences] = useState([])
  const [apiTotal, setApiTotal] = useState(0)

  useEffect(() => {
    let alive = true
    fetchExperiences().then(({ experiences: list, totalCount: total }) => {
      if (!alive) return
      setApiExperiences(list)
      setApiTotal(total)
    })
    return () => {
      alive = false
    }
  }, [])
  const [activeRegion, setActiveRegion] = useState('전국')
  const [activeDifficulty, setActiveDifficulty] = useState(() => new Set(['instant']))
  const [sortId, setSortId] = useState('recommended')

  function toggleDifficulty(id) {
    setActiveDifficulty((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className={styles.page}>
      <Header />

      <main>
        <section className={styles.hero}>
          <div className={styles.ambientBlurTop} aria-hidden="true" />
          <div className={styles.ambientBlurBottom} aria-hidden="true" />
          <div className={styles.container}>
            <div className={styles.heroInner}>
              <div className={styles.heroText}>
                <h1 className={styles.heading}>
                  {hero.heading.map((line, i) => (
                    <span key={i}>{line}</span>
                  ))}
                </h1>
                <p className={styles.heroDescription}>
                  {hero.description.map((line, i) => (
                    <span key={i}>{line}</span>
                  ))}
                </p>
              </div>

              <form className={styles.searchBox} onSubmit={(e) => e.preventDefault()}>
                <Icon {...icons.search} />
                <input
                  type="text"
                  className={styles.searchInput}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={hero.searchPlaceholder}
                />
                <button type="submit" className={styles.searchButton}>
                  검색
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className={styles.filterSection}>
          <div className={styles.container}>
            <div className={styles.categoryBar}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={cx(styles.categoryPill, activeCategory === category.id && styles.categoryPillActive)}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <Icon {...category.icon} />
                  {category.label}
                </button>
              ))}
            </div>

            <div className={styles.refinementRow}>
              <div className={styles.refinementLeft}>
                <span className={styles.regionLabel}>지역별:</span>
                {regions.map((region) => (
                  <button
                    key={region}
                    type="button"
                    className={cx(styles.regionChip, activeRegion === region && styles.regionChipActive)}
                    onClick={() => setActiveRegion(region)}
                  >
                    {region}
                  </button>
                ))}
                <span className={styles.divider} />
                {difficultyFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    className={cx(
                      styles.difficultyChip,
                      activeDifficulty.has(filter.id) && styles.difficultyChipActive,
                    )}
                    onClick={() => toggleDifficulty(filter.id)}
                  >
                    {filter.label}
                    {filter.icon && <Icon {...filter.icon} />}
                  </button>
                ))}
              </div>

              <div className={styles.refinementRight}>
                <span className={styles.count}>
                  TourAPI 검색 결과 <strong className={styles.countStrong}>{apiTotal}</strong>곳
                </span>
                <div className={styles.sortWrap}>
                  <select
                    className={styles.sortSelect}
                    value={sortId}
                    onChange={(e) => setSortId(e.target.value)}
                    aria-label="정렬 기준"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Icon {...icons.sortChevron} className={styles.sortChevron} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.gridSection}>
          <div className={styles.container}>
            <div className={styles.grid}>

              {apiExperiences.map((experience) => (
                <ApiExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.trustSection}>
          <div className={styles.container}>
            <div className={styles.trustGrid}>
              {trustItems.map((item) => (
                <div key={item.title} className={styles.trustItem}>
                  <div className={styles.trustIcon} style={{ background: item.iconBg }}>
                    <Icon {...item.icon} />
                  </div>
                  <div>
                    <h3 className={styles.trustTitle}>{item.title}</h3>
                    <p className={styles.trustDescription}>
                      {item.description.map((line, i) => (
                        <span key={i}>{line}</span>
                      ))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ExperiencesPage
