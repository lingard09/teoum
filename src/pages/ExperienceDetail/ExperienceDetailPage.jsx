import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import { fetchExperiencePage } from '../../api/experienceApi.js'
import { fetchAccessibility } from '../../api/accessApi.js'
import { fetchGalleryPhotos } from '../../api/photoApi.js'
import { fetchCongestionForecast, quietestDay } from '../../api/congestionApi.js'
import { fetchAudioStories } from '../../api/audioGuideApi.js'
import { fetchWeatherByDate } from '../../api/weatherApi.js'
import { fetchEnglishDetail } from '../../api/englishApi.js'
import { contentTypeLabel } from '../../api/tourApiDetail.js'
import styles from './ExperienceDetailPage.module.css'

// 고정 문구만 번역한다. 장소 이름·소개는 영문 관광정보 서비스가 주는 실제 영문 값을 쓰고,
// 혼잡·날씨·무장애처럼 국문 서비스에만 있는 값은 한국어 그대로 둔다(지어내지 않는다).
const COPY = {
  ko: {
    intro: '소개', programs: '체험 프로그램', photos: '사진', forecast: '혼잡 예측',
    audio: '오디오 해설', access: '무장애 편의', homepage: '공식 홈페이지',
    useTime: '이용 시간', restDate: '휴무일',
    parking: '주차', tel: '문의', loading: '정보를 불러오는 중…',
    checkIn: '체크인', checkOut: '체크아웃', roomCount: '객실 수',
    roomType: '객실 종류', cooking: '취사', subFacility: '부대시설',
    backStay: '← 숙소 목록으로', backExp: '← 체험 목록으로',
    addTrip: '내 여정에 담기',
  },
  en: {
    intro: 'About', programs: 'Programs', photos: 'Photos', forecast: 'Crowd forecast',
    audio: 'Audio guide', access: 'Accessibility', homepage: 'Official website',
    useTime: 'Hours', restDate: 'Closed',
    parking: 'Parking', tel: 'Contact', loading: 'Loading…',
    checkIn: 'Check-in', checkOut: 'Check-out', roomCount: 'Rooms',
    roomType: 'Room types', cooking: 'Cooking', subFacility: 'Facilities',
    backStay: '← Back to stays', backExp: '← Back to list',
    addTrip: 'Add to my trip',
  },
}

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
    weather: new Map(),
    english: null,
  })
  // 언어 선택도 어느 장소의 것인지 함께 들고 있는다. 장소를 옮기면 자동으로
  // 한국어로 돌아가므로, 영문 자료가 없는 장소에서 영어가 선택된 채로 남지 않는다.
  const [langState, setLangState] = useState({ contentId: null, lang: 'ko' })
  const lang = langState.contentId === contentId ? langState.lang : 'ko'
  const setLang = (next) => setLangState({ contentId, lang: next })
  const matches = extra.contentId === contentId
  const access = matches ? extra.access : []
  const extraPhotos = matches ? extra.photos : []
  const forecast = matches ? extra.forecast : []
  const stories = matches ? extra.stories : []
  const weather = matches ? extra.weather : new Map()
  const english = matches ? extra.english : null
  // 영문 자료가 없으면 전환 자체를 감춘다. 빈 영어 화면을 보여주지 않는다.
  const showEnglish = lang === 'en' && english !== null
  const t = COPY[showEnglish ? 'en' : 'ko']

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
      fetchWeatherByDate({ lat: detail.lat, lng: detail.lng, address: detail.address }),
      fetchEnglishDetail(detail.title),
    ]).then(([access, photos, forecast, stories, weather, english]) => {
      if (alive) setExtra({ contentId, access, photos, forecast, stories, weather, english })
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
  const WEEKDAYS = showEnglish
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['일', '월', '화', '수', '목', '금', '토']

  // 숙소와 체험은 TourAPI가 주는 항목 자체가 다르다. 있는 값만 넣는다.
  const facts = !detail
    ? []
    : (detail.isStay
        ? [
            detail.stay?.checkIn && { label: t.checkIn, value: detail.stay.checkIn },
            detail.stay?.checkOut && { label: t.checkOut, value: detail.stay.checkOut },
            detail.stay?.roomCount && { label: t.roomCount, value: detail.stay.roomCount },
            detail.stay?.roomType && { label: t.roomType, value: detail.stay.roomType },
            detail.stay?.cooking && { label: t.cooking, value: detail.stay.cooking },
            detail.stay?.subFacility && { label: t.subFacility, value: detail.stay.subFacility },
            detail.parking && { label: t.parking, value: detail.parking },
            detail.tel && { label: t.tel, value: detail.tel },
          ]
        : [
            detail.useTime && { label: t.useTime, value: detail.useTime },
            detail.restDate && { label: t.restDate, value: detail.restDate },
            detail.parking && { label: t.parking, value: detail.parking },
            detail.tel && { label: t.tel, value: detail.tel },
          ]
      ).filter(Boolean)

  return (
    <>
      <Header />

      <main className={styles.page}>
        {status === 'loading' && <p className={styles.state}>{COPY.ko.loading}</p>}

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
                <h1 className={styles.title}>
                  {showEnglish ? english.title : detail.title}
                </h1>
                {(showEnglish ? english.address : detail.address) && (
                  <p className={styles.address}>
                    {showEnglish ? english.address : detail.address}
                  </p>
                )}

                {/* 영문 자료가 있는 장소에서만 전환을 보여준다. */}
                {english && (
                  <div className={styles.langSwitch} role="group" aria-label="Language">
                    <button
                      type="button"
                      onClick={() => setLang('ko')}
                      aria-pressed={!showEnglish}
                      className={!showEnglish ? styles.langOn : undefined}
                    >
                      한국어
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang('en')}
                      aria-pressed={showEnglish}
                      className={showEnglish ? styles.langOn : undefined}
                    >
                      English
                    </button>
                  </div>
                )}
              </div>
            </header>

            <div className={styles.container}>
              <div className={styles.main}>
                {(showEnglish ? english.overview : detail.overview) && (
                  <section className={styles.block}>
                    <h2 className={styles.blockTitle}>{t.intro}</h2>
                    <p className={styles.overview}>
                      {showEnglish ? english.overview : detail.overview}
                    </p>
                  </section>
                )}

                {detail.programs.length > 0 && (
                  <section className={styles.block}>
                    <h2 className={styles.blockTitle}>{t.programs}</h2>
                    <ul className={styles.programs}>
                      {detail.programs.map((program) => (
                        <li key={program}>{program}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {gallery.length > 0 && (
                  <section className={styles.block}>
                    <h2 className={styles.blockTitle}>{t.photos}</h2>
                    <div className={styles.gallery}>
                      {gallery.map((url) => (
                        <img key={url} src={url} alt="" loading="lazy" />
                      ))}
                    </div>
                  </section>
                )}

                {forecastWeeks.length > 0 && (
                  <section className={styles.block}>
                    <h2 className={styles.blockTitle}>{t.forecast}</h2>
                    {quietest && (
                      <p className={styles.quietest}>
                        {showEnglish ? (
                          <>
                            The quietest day in the next two weeks is{' '}
                            <strong>
                              {quietest.date.getMonth() + 1}/{quietest.date.getDate()} (
                              {WEEKDAYS[quietest.date.getDay()]})
                            </strong>
                            .
                          </>
                        ) : (
                          <>
                            앞으로 2주 중{' '}
                            <strong>
                              {quietest.date.getMonth() + 1}월 {quietest.date.getDate()}일 (
                              {WEEKDAYS[quietest.date.getDay()]})
                            </strong>
                            이 가장 한산합니다.
                          </>
                        )}
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
                            {showEnglish ? day.labelEn : day.label}
                          </span>
                          {/* 날씨는 열흘치만 온다. 없는 날은 자리를 비워 둔다. */}
                          <span className={styles.forecastWeather}>
                            {weather.get(day.ymd)?.sky ?? ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className={styles.accessNote}>
                      {showEnglish
                        ? 'Korea Tourism Organization crowd index (0–100; 80+ is busy) with KMA weather. Weather terms are in Korean.'
                        : '한국관광공사 집중률 예측(0~100 지수, 80 이상 혼잡)과 기상청 예보입니다.'}
                    </p>
                  </section>
                )}

                {stories.length > 0 && (
                  <section className={styles.block}>
                    <h2 className={styles.blockTitle}>{t.audio}</h2>
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
                    <p className={styles.accessNote}>
                      {showEnglish
                        ? 'Transcripts from the Korea Tourism Organization audio guide. Korean only.'
                        : '한국관광공사 오디오 가이드 ‘오디’ 대본입니다.'}
                    </p>
                  </section>
                )}

                {/* 무장애 정보가 없는 장소에서는 섹션을 아예 숨긴다. */}
                {access.length > 0 && (
                  <section className={styles.block}>
                    <h2 className={styles.blockTitle}>{t.access}</h2>
                    <dl className={styles.access}>
                      {access.map((row) => (
                        <div key={row.key} className={styles.accessRow}>
                          <dt>{row.label}</dt>
                          <dd>{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className={styles.accessNote}>
                      {showEnglish
                        ? 'Based on Korea Tourism Organization accessible-travel data. Korean only.'
                        : '한국관광공사 무장애 여행 정보 기준입니다.'}
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

                {/* 여정 담기는 숙소에만 있다. 체험은 예약 경로 자체를 없앴다. */}
                {detail.isStay && (
                  <Link
                    to={`/stays/reserve?contentId=${contentId}`}
                    className={styles.stayCta}
                  >
                    {t.addTrip}
                  </Link>
                )}

                {detail.homepage && (
                  <a
                    className={styles.homepage}
                    href={(showEnglish && english.homepage) || detail.homepage}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t.homepage}
                  </a>
                )}

                <Link
                  to={detail.isStay ? '/stays' : '/experiences'}
                  className={styles.backLink}
                >
                  {detail.isStay ? t.backStay : t.backExp}
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
