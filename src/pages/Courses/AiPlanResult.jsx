import { useState } from 'react'
import { Link } from 'react-router-dom'
import { saveAiCourse } from '../../api/mypageApi.js'
import styles from './CoursesPage.module.css'

/**
 * AI가 짠 코스 결과.
 *
 * 여기 나오는 장소는 전부 TourAPI 후보에서 고른 것이다. 서버가 후보에 없는
 * contentId를 걸러내므로 지어낸 장소는 표시되지 않는다.
 */
function AiPlanResult({ state, onRetry }) {
  // 저장은 마이페이지의 "저장된 AI 여행 코스" 탭으로 들어간다.
  const [saveState, setSaveState] = useState('idle')

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
                    </div>
                    {stop.address && <p className={styles.aiStopAddress}>{stop.address}</p>}
                    {stop.reason && <p className={styles.aiStopReason}>{stop.reason}</p>}
                  </div>

                  <Link to={`/stays/reserve?contentId=${stop.contentId}`} className={styles.aiStopLink}>
                    예약
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
