import { useCallback, useEffect, useState } from 'react'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import { cx } from '../../utils/cx.js'
import {
  hero,
  searchFields,
  searchCta,
  categories,
  regions,
  conditionFilters,
  totalCount,
  pageCount,
  stays,
} from '../../data/stays.js'
import { addScrap, fetchScrapIds, removeScrap } from '../../api/mypageApi.js'
import { fetchStays } from '../../api/stayApi.js'
import ApiStayCard from './ApiStayCard.jsx'
import StayCard from './StayCard.jsx'
import styles from './StaysPage.module.css'

const PAGE_ITEMS = [1, 2, 3, 4, '…', pageCount]

function StaysPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeRegion, setActiveRegion] = useState('전국')
  const [checkedConditions, setCheckedConditions] = useState(
    () => new Set(conditionFilters.filter((f) => f.defaultChecked).map((f) => f.id)),
  )
  const [currentPage, setCurrentPage] = useState(1)

  // 스크랩 상태는 카드마다 따로 읽으면 요청이 카드 수만큼 나가므로 페이지에서 한 번만 읽는다.
  const [scrappedIds, setScrappedIds] = useState(() => new Set())

  // TourAPI 숙박(contentTypeId=32)에서 실제 한옥 숙소를 받아온다.
  // 실패하거나 키가 없으면 apiStays가 비어서 큐레이션 목업만 보인다.
  const [apiStays, setApiStays] = useState([])

  useEffect(() => {
    let alive = true
    fetchStays().then(({ stays: list }) => {
      if (alive) setApiStays(list)
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    fetchScrapIds().then((ids) => {
      if (alive) setScrappedIds(ids)
    })
    return () => {
      alive = false
    }
  }, [])

  // 낙관적 업데이트: 하트를 먼저 칠하고, 저장이 실패하면 되돌린다.
  const toggleScrap = useCallback(async (stay) => {
    const wasScrapped = scrappedIds.has(stay.id)
    setScrappedIds((prev) => {
      const next = new Set(prev)
      if (wasScrapped) next.delete(stay.id)
      else next.add(stay.id)
      return next
    })

    try {
      if (wasScrapped) {
        await removeScrap(stay.id)
      } else {
        // Firestore는 undefined 값을 거부한다. 이미지 출처에 따라 키를 갈라 넣는다.
        await addScrap({
          id: stay.id,
          location: stay.location,
          title: stay.name,
          description: stay.description.join(' '),
          ...(stay.apiImage ? { imageUrl: stay.apiImage } : { imageKey: `stay-${stay.id}` }),
        })
      }
    } catch (err) {
      console.warn('[StaysPage] 스크랩 저장 실패, 되돌립니다.', err)
      setScrappedIds((prev) => {
        const next = new Set(prev)
        if (wasScrapped) next.add(stay.id)
        else next.delete(stay.id)
        return next
      })
    }
  }, [scrappedIds])

  function toggleCondition(id) {
    setCheckedConditions((prev) => {
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

              <div className={styles.metrics}>
                {hero.metrics.map((metric, i) => (
                  <div key={metric.label} className={styles.metricGroup}>
                    {i > 0 && <span className={styles.metricDivider} aria-hidden="true" />}
                    <div className={styles.metric}>
                      <span className={styles.metricLabel}>{metric.label}</span>
                      <span className={styles.metricValue}>
                        {metric.value}
                        <span className={styles.metricUnit}>{metric.unit}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.searchBar}>
              {searchFields.map((field) => (
                <div key={field.id} className={styles.searchField}>
                  <Icon {...field.icon} />
                  <div className={styles.searchFieldText}>
                    <span className={styles.searchFieldLabel}>{field.label}</span>
                    <span className={styles.searchFieldValue}>{field.value}</span>
                  </div>
                </div>
              ))}
              <button type="button" className={styles.searchButton}>
                <Icon {...icons.staySearch} />
                {searchCta}
              </button>
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
                <span className={styles.groupLabel}>권역:</span>
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
                <span className={styles.groupLabel}>조건:</span>
                {conditionFilters.map((filter) => (
                  <label key={filter.id} className={styles.conditionLabel}>
                    <input
                      type="checkbox"
                      className={styles.conditionInput}
                      checked={checkedConditions.has(filter.id)}
                      onChange={() => toggleCondition(filter.id)}
                    />
                    {filter.label}
                  </label>
                ))}
              </div>

              <div className={styles.refinementRight}>
                <span className={styles.count}>
                  총 <strong className={styles.countStrong}>{totalCount}개</strong> 한옥 중 추천 6선
                </span>
                <div className={styles.sortWrap}>
                  <span>하루한옥 추천순</span>
                  <Icon {...icons.staySortChevron} className={styles.sortChevron} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.gridSection}>
          <div className={styles.container}>
            <div className={styles.grid}>
              {stays.map((stay) => (
                <StayCard
                  key={stay.id}
                  stay={stay}
                  saved={scrappedIds.has(stay.id)}
                  onToggleSave={() => toggleScrap(stay)}
                />
              ))}

              {apiStays.map((stay) => (
                <ApiStayCard
                  key={stay.id}
                  stay={stay}
                  saved={scrappedIds.has(stay.id)}
                  onToggleSave={() =>
                    toggleScrap({
                      id: stay.id,
                      name: stay.name,
                      location: stay.location,
                      title: [stay.name],
                      description: ['한국관광공사 TourAPI 등록 한옥 숙소'],
                      apiImage: stay.image,
                    })
                  }
                />
              ))}
            </div>

            <nav className={styles.pagination} aria-label="한옥 스테이 목록 페이지">
              <button
                type="button"
                className={styles.pageArrow}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="이전 페이지"
              >
                <Icon {...icons.stayPaginationPrev} />
              </button>
              {PAGE_ITEMS.map((item, i) =>
                item === '…' ? (
                  <span key={`ellipsis-${i}`} className={styles.pageEllipsis}>
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={cx(styles.pageNumber, currentPage === item && styles.pageNumberActive)}
                    onClick={() => setCurrentPage(item)}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                type="button"
                className={styles.pageArrow}
                onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                disabled={currentPage === pageCount}
                aria-label="다음 페이지"
              >
                <Icon {...icons.stayPaginationNext} />
              </button>
            </nav>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default StaysPage
