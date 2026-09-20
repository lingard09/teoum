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
} from '../../data/stays.js'
import { addScrap, fetchScrapIds, removeScrap } from '../../api/mypageApi.js'
import { fetchStays } from '../../api/stayApi.js'
import ApiStayCard from './ApiStayCard.jsx'
import styles from './StaysPage.module.css'

function StaysPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeRegion, setActiveRegion] = useState('전국')
  const [checkedConditions, setCheckedConditions] = useState(
    () => new Set(conditionFilters.filter((f) => f.defaultChecked).map((f) => f.id)),
  )

  // 스크랩 상태는 카드마다 따로 읽으면 요청이 카드 수만큼 나가므로 페이지에서 한 번만 읽는다.
  const [scrappedIds, setScrappedIds] = useState(() => new Set())

  // TourAPI 숙박(contentTypeId=32)에서 실제 한옥 숙소를 받아온다.
  // 실패하거나 키가 없으면 apiStays가 비어서 큐레이션 목업만 보인다.
  const [apiStays, setApiStays] = useState([])
  const [apiTotal, setApiTotal] = useState(0)

  useEffect(() => {
    let alive = true
    fetchStays().then(({ stays: list, totalCount: total }) => {
      if (!alive) return
      setApiStays(list)
      setApiTotal(total)
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
                {/* 시안의 "공식 인증 고택 84선 / 평균 만족도 4.94"는 근거 없는 값이라
                    TourAPI가 실제로 돌려준 검색 건수로 대체했다. */}
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>TourAPI 한옥 숙소</span>
                  <span className={styles.metricValue}>
                    {apiTotal || '—'}
                    <span className={styles.metricUnit}>건</span>
                  </span>
                </div>
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
                  TourAPI 등록 한옥 숙소 <strong className={styles.countStrong}>{apiTotal}건</strong> 중 {apiStays.length}곳 표시
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default StaysPage
