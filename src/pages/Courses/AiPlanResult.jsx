import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { saveAiCourse } from '../../api/mypageApi.js'
import { fetchCongestionForecast, bestVisitDay } from '../../api/congestionApi.js'
import { fetchWeatherByDate } from '../../api/weatherApi.js'
import { fetchAttractionDetail } from '../../api/tourApi.js'
import { stopLink } from '../../utils/stopLink.js'
import styles from './CoursesPage.module.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/**
 * AI가 짠 코스 결과.
 *
 * 여기 나오는 장소는 전부 TourAPI 후보에서 고른 것이다. 서버가 후보에 없는
 * contentId를 걸러내므로 지어낸 장소는 표시되지 않는다.
 */
function AiPlanResult({ state, onRetry }) {
  // 저장은 마이페이지의 "저장된 AI 여행 코스" 탭으로 들어간다.
  const [saveState, setSaveState] = useState('idle')

  // 코스가 나온 뒤에 혼잡 예측과 날씨를 덧붙인다. 코스 자체를 늦추지 않는다.
  const [timing, setTiming] = useState({ key: null, best: null, byStop: new Map(), weather: new Map() })
  const planKey = state.status === 'ready' ? state.plan.stops.map((s) => s.contentId).join(',') : null
  const timingReady = timing.key === planKey

  useEffect(() => {
    if (state.status !== 'ready' || !planKey) return undefined
    let alive = true
    const stops = state.plan.stops

    // 날씨는 코스 첫 장소 기준이다. 단기예보(0~3일)가 좌표를 요구하는데 코스
    // 정류장에는 좌표가 없어서 상세를 한 번 더 부른다(캐시되므로 하루 1회).
    const weatherPromise = stops[0]
      ? fetchAttractionDetail(stops[0].contentId)
          .catch(() => null)
          .then((place) =>
            fetchWeatherByDate({
              lat: place?.lat,
              lng: place?.lng,
              address: stops[0].address,
            }),
          )
      : Promise.resolve(new Map())

    Promise.all([
      Promise.all(stops.map((stop) => fetchCongestionForecast({ title: stop.name, address: stop.address }))),
      weatherPromise,
    ]).then(([forecasts, weather]) => {
      if (!alive) return
      const byStop = new Map()
      stops.forEach((stop, i) => {
        if (forecasts[i].length > 0) byStop.set(stop.contentId, forecasts[i][0])
      })
      setTiming({ key: planKey, best: bestVisitDay(forecasts), byStop, weather })
    })

    return () => {
      alive = false
    }
  }, [state.status, state.plan, planKey])

  const best = timingReady ? timing.best : null
  const bestWeather = best ? timing.weather.get(best.ymd) : null

  async function handleSave() {
    setSaveState('saving')
    try {
      await saveAiCourse(state.plan)
      setSaveState('saved')
    } catch (err) {
      console.warn('[AiPlanResult] 코스 저장 실패', err)
      setSaveState('failed')
    }
  }

  return (
    <section className={styles.aiResult} aria-label="AI 맞춤 코스">
      <div className={styles.aiResultInner}>
        {state.status === 'loading' && (
          <p className={styles.aiNotice}>조건에 맞는 장소를 모아 AI가 코스를 구성하고 있습니다…</p>
        )}

        {state.status === 'failed' && (
          <p className={styles.aiNotice}>
            {state.message}
            <button type="button" className={styles.clearSearch} onClick={onRetry}>
              다시 시도
            </button>
          </p>
        )}

        {state.status === 'ready' && (
          <>
            <div className={styles.aiResultHead}>
              <div>
                <h2 className={styles.aiResultTitle}>{state.plan.title}</h2>
                {state.plan.summary && <p className={styles.aiResultDesc}>{state.plan.summary}</p>}
              </div>
              <div className={styles.aiResultActions}>
                <span className={styles.aiResultBadge}>
                  TourAPI 실제 장소 {state.plan.candidateCount}곳 중 선별
                </span>

                {saveState === 'saved' ? (
                  <Link to="/mypage/courses" className={styles.aiSaveDone}>
                    보관함에서 보기 →
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={styles.aiSaveButton}
                    onClick={handleSave}
                    disabled={saveState === 'saving'}
                  >
                    {saveState === 'saving' ? '저장 중…' : '이 코스 저장'}
                  </button>
                )}
              </div>
            </div>

            {/* 집중률 데이터가 있는 장소가 하나도 없으면 아무것도 그리지 않는다. */}
            {best && (
              <p className={styles.aiTiming}>
                <strong>
                  {best.date.getMonth() + 1}월 {best.date.getDate()}일(
                  {WEEKDAYS[best.date.getDay()]})
                </strong>
                에 가면 가장 한산합니다
                {bestWeather?.sky ? ` · 예보 ${bestWeather.sky}` : ''}
                {bestWeather?.rainProb != null ? ` (강수 ${bestWeather.rainProb}%)` : ''}
                <span className={styles.aiTimingNote}>
                  코스 {best.places}곳의 집중률 예측 평균
                  {bestWeather ? ' · 날씨는 첫 장소 지역 기준' : ''}
                </span>
              </p>
            )}

            {saveState === 'failed' && (
              <p className={styles.aiSaveError}>코스를 저장하지 못했습니다. 다시 시도해 주세요.</p>
            )}

            <ol className={styles.aiStops}>
              {state.plan.stops.map((stop, index) => (
                <li key={stop.contentId} className={styles.aiStop}>
                  <span className={styles.aiStopNumber}>{String(index + 1).padStart(2, '0')}</span>

                  {stop.image && <img className={styles.aiStopImage} src={stop.image} alt="" />}

                  <div className={styles.aiStopBody}>
                    <div className={styles.aiStopHead}>
                      {stop.time && <span className={styles.aiStopTime}>{stop.time}</span>}
                      <h3 className={styles.aiStopName}>{stop.name}</h3>
                      {timing.byStop.get(stop.contentId) && (
                        <span
                          className={styles.aiStopCongestion}
                          data-level={timing.byStop.get(stop.contentId).level}
                        >
                          오늘 {timing.byStop.get(stop.contentId).label}
                        </span>
                      )}
                    </div>
                    {stop.address && <p className={styles.aiStopAddress}>{stop.address}</p>}
                    {stop.reason && <p className={styles.aiStopReason}>{stop.reason}</p>}
                  </div>

                  <Link to={stopLink(stop).to} className={styles.aiStopLink}>
                    {stopLink(stop).label}
                  </Link>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </section>
  )
}

export default AiPlanResult
