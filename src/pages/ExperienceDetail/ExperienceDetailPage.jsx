import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import { fetchExperiencePage } from '../../api/experienceApi.js'
import { fetchAccessibility } from '../../api/accessApi.js'
import { fetchGalleryPhotos } from '../../api/photoApi.js'
import { fetchCongestionForecast, quietestDay } from '../../api/congestionApi.js'
import { fetchAudioStories } from '../../api/audioGuideApi.js'
import { contentTypeLabel } from '../../api/tourApiDetail.js'
import styles from './ExperienceDetailPage.module.css'

/** 체험 상세. 모든 값이 TourAPI 실데이터이고, 없는 항목은 아예 그리지 않는다. */
function ExperienceDetailPage() {
  const { contentId } = useParams()
  const [detail, setDetail] = useState(null)
  const [status, setStatus] = useState('loading')
  // 무장애 정보와 관광사진은 부가 정보라 본문보다 늦게 채운다.
  // 어느 장소의 결과인지 함께 담아, 장소를 옮긴 직후 이전 결과가 남는 것을 막는다.
  const [extra, setExtra] = useState({
    contentId: null,
    access: [],
    photos: [],
    forecast: [],
    stories: [],
  })
  const matches = extra.contentId === contentId
  const access = matches ? extra.access : []
  const extraPhotos = matches ? extra.photos : []
  const forecast = matches ? extra.forecast : []
  const stories = matches ? extra.stories : []

  useEffect(() => {
    let alive = true
    fetchExperiencePage(contentId).then((d) => {
      if (!alive) return
      setDetail(d)
      setStatus(d ? 'ready' : 'failed')
    })
    return () => {
      alive = false
    }
  }, [contentId])

  useEffect(() => {
    if (status !== 'ready' || !detail) return undefined
    let alive = true
    Promise.all([
      fetchAccessibility(contentId),
      fetchGalleryPhotos(detail.title),
      fetchCongestionForecast({ title: detail.title, address: detail.address }),
      fetchAudioStories({ lat: detail.lat, lng: detail.lng, title: detail.title }),
    ]).then(([access, photos, forecast, stories]) => {
      if (alive) setExtra({ contentId, access, photos, forecast, stories })
    })
    return () => {
      alive = false
    }
  }, [contentId, status, detail])

  // detailImage2는 거의 모든 장소에 있고, 관광사진 API는 일부 장소에만 있는 대신 장수가 많다.
  // 둘을 합치되 같은 URL은 한 번만 그린다.
  const gallery = detail ? [...new Set([...detail.gallery, ...extraPhotos])].slice(0, 12) : []

  // 예측은 오늘부터 30일치가 온다. 한 화면에 다 넣으면 읽히지 않아 2주만 그린다.
  const forecastWeeks = forecast.slice(0, 14)
  const quietest = quietestDay(forecast)
  const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

  const facts = detail
    ? [
        detail.useTime && { label: '이용 시간', value: detail.useTime },
        detail.restDate && { label: '휴무일', value: detail.restDate },
        detail.parking && { label: '주차', value: detail.parking },
        detail.tel && { label: '문의', value: detail.tel },
      ].filter(Boolean)
    : []

  return (
    <>
      <Header />

      <main className={styles.page}>
        {status === 'loading' && <p className={styles.state}>체험 정보를 불러오는 중…</p>}

        {status === 'failed' && (
          <p className={styles.state}>
            체험 정보를 불러오지 못했습니다. <Link to="/experiences">목록으로 돌아가기</Link>
          </p>
        )}

        {status === 'ready' && (
          <>
            <header className={styles.hero}>
              {detail.image && <img className={styles.heroImage} src={detail.image} alt="" />}
              <span className={styles.heroShade} aria-hidden="true" />

              <div className={styles.heroBody}>
                <div className={styles.badges}>
                  {detail.isHeritage && <span className={styles.badgeMint}>국가유산 지정</span>}
                  <span className={styles.badge}>{contentTypeLabel(detail.contentTypeId)}</span>
                </div>
                <h1 className={styles.title}>{detail.title}</h1>
                {detail.address && <p className={styles.address}>{detail.address}</p>}
              </div>
            </header>

            <div className={styles.container}>
              <div className={styles.main}>
                {detail.overview && (
                  <section className={styles.block}>
                    <h2 className={styles.blockTitle}>소개</h2>
                    <p className={styles.overview}>{detail.overview}</p>
                  </section>
                )}

                {detail.programs.length > 0 && (
                  <section className={styles.block}>
                    <h2 className={styles.blockTitle}>체험 프로그램</h2>
                    <ul className={styles.programs}>
                      {detail.programs.map((program) => (
                        <li key={program}>{program}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {gallery.length > 0 && (
                  <section className={styles.block}>
                    <h2 className={styles.blockTitle}>사진</h2>
                    <div className={styles.gallery}>
                      {gallery.map((url) => (
                        <img key={url} src={url} alt="" loading="lazy" />
                      ))}
                    </div>
                  </section>
                )}

                {forecastWeeks.length > 0 && (
                  <section className={styles.block}>
                    <h2 className={styles.blockTitle}>혼잡 예측</h2>
                    {quietest && (
                      <p className={styles.quietest}>
                        앞으로 2주 중 <strong>{quietest.date.getMonth() + 1}월 {quietest.date.getDate()}일
                        ({WEEKDAYS[quietest.date.getDay()]})</strong>이 가장 한산합니다.
                      </p>
                    )}
                    <ul className={styles.forecast}>
                      {forecastWeeks.map((day) => (
                        <li key={day.ymd} className={styles.forecastDay}>
                          <span className={styles.forecastDate}>
                            {day.date.getMonth() + 1}/{day.date.getDate()}
                            <em>{WEEKDAYS[day.date.getDay()]}</em>
                          </span>
                          <span className={styles.forecastBar} aria-hidden="true">
                            <span
                              className={styles[`bar_${day.level}`]}
                              style={{ height: `${Math.max(day.rate, 4)}%` }}
                            />
                          </span>
                          <span className={styles.forecastLabel} data-level={day.level}>
                            {day.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className={styles.accessNote}>
                      한국관광공사 집중률 예측(0~100 지수)입니다. 80 이상이 혼잡입니다.
                    </p>
                  </section>
                )}

                {stories.length > 0 && (
                  <section className={styles.block}>
                    <h2 className={styles.blockTitle}>오디오 해설</h2>
                    <ul className={styles.stories}>
                      {stories.map((story) => (
                        <li key={story.id} className={styles.story}>
                          <details>
                            <summary>
                              <strong>{story.title}</strong>
                              <span>{story.audioTitle}</span>
                            </summary>
                            <p>{story.script}</p>
                          </details>
                        </li>
                      ))}
                    </ul>
                    <p className={styles.accessNote}>한국관광공사 오디오 가이드 &lsquo;오디&rsquo; 대본입니다.</p>
                  </section>
                )}

                {/* 무장애 정보가 없는 장소에서는 섹션을 아예 숨긴다. */}
                {access.length > 0 && (
                  <section className={styles.block}>
                    <h2 className={styles.blockTitle}>무장애 편의</h2>
                    <dl className={styles.access}>
                      {access.map((row) => (
                        <div key={row.key} className={styles.accessRow}>
                          <dt>{row.label}</dt>
                          <dd>{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className={styles.accessNote}>
                      한국관광공사 무장애 여행 정보 기준입니다.
                    </p>
                  </section>
                )}
              </div>

              <aside className={styles.side}>
                {facts.length > 0 && (
                  <dl className={styles.facts}>
                    {facts.map((fact) => (
                      <div key={fact.label} className={styles.fact}>
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {detail.homepage && (
                  <a
                    className={styles.homepage}
                    href={detail.homepage}
                    target="_blank"
                    rel="noreferrer"
                  >
                    공식 홈페이지
                  </a>
                )}

                <Link to="/experiences" className={styles.backLink}>
                  ← 체험 목록으로
                </Link>
              </aside>
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  )
}

export default ExperienceDetailPage
