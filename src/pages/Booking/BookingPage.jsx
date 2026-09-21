import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import { cx } from '../../utils/cx.js'
import {
  contentTypeLabel,
  fetchBookingInfo,
  fetchDetailCommon,
  stripOverviewHtml,
  toHttpsUrl,
} from '../../api/tourApiDetail.js'
import { saveReservation } from '../../api/mypageApi.js'
import BookingCalendar from './BookingCalendar.jsx'
import styles from './BookingPage.module.css'

/**
 * 숙소 방문 계획을 보관함에 담는 화면.
 *
 * 예전에는 결제 플로우였는데, 요금·할인·결제수단·환불규정이 전부 지어낸 값이었다.
 * TourAPI는 예약·요금을 제공하지 않으므로 사실로 채울 수가 없다. 게다가 장소와
 * 무관하게 고정된 데모 문구("북촌 무형문화재 명인 자개 소반 만들기")가 기본값이라,
 * 숙소를 예약해도 그 문구가 화면과 마이페이지에까지 따라 들어갔다.
 *
 * 그래서 결제를 걷어내고, 실제로 사실인 것만 남겼다.
 *   - 장소 정보: TourAPI 실데이터 (이름·사진·주소·소개·체크인/퇴실/객실/주차)
 *   - 사용자가 고르는 값: 방문 예정일, 인원, 메모
 * 지어낸 금액이나 정책은 화면에도 저장 데이터에도 넣지 않는다.
 */

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

// 이 페이지는 숙박 전용이다. 체험·관광지가 들어오면 상세로 돌려보낸다.
const STAY_CONTENT_TYPE_ID = '32'

const STEPS = [
  { n: 1, label: '방문일 선택' },
  { n: 2, label: '인원' },
  { n: 3, label: '메모' },
]

function toDateValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

/** 기본 방문일은 일주일 뒤. 고정 날짜를 박아두면 지난 날짜가 보인다. */
function defaultVisitDate() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return toDateValue(d)
}

function formatDateLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${m}월 ${d}일(${WEEKDAYS[new Date(y, m - 1, d).getDay()]})`
}

function BookingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const contentId = searchParams.get('contentId')

  const [place, setPlace] = useState(null)
  const [fetchStatus, setFetchStatus] = useState('loading')
  // contentId가 아예 없으면 조회할 것도 없다. 이펙트에서 상태를 바꾸는 대신
  // 렌더 중에 판정한다(불필요한 재렌더를 만들지 않는다).
  const status = contentId ? fetchStatus : 'failed'
  const [visitDate, setVisitDate] = useState(defaultVisitDate)
  const [people, setPeople] = useState(2)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // contentId 없이 들어오면 보여줄 장소가 없다. 예전에는 대표 장소를 끼워
    // 넣었는데, 고르지도 않은 곳이 예약 대상으로 뜨는 게 더 나빴다.
    if (!contentId) return undefined

    let cancelled = false

    ;(async () => {
      try {
        const detail = await fetchDetailCommon(contentId)
        if (cancelled) return
        if (!detail?.title) {
          setFetchStatus('failed')
          return
        }
        if (String(detail.contenttypeid) !== STAY_CONTENT_TYPE_ID) {
          navigate(`/experiences/${detail.contentid}`, { replace: true })
          return
        }

        const info = await fetchBookingInfo(detail.contentid, detail.contenttypeid)
        if (cancelled) return

        setPlace({
          title: detail.title,
          address: [detail.addr1, detail.addr2].filter(Boolean).join(' ') || null,
          image: toHttpsUrl(detail.firstimage) || null,
          overview: stripOverviewHtml(detail.overview) || null,
          typeLabel: contentTypeLabel(detail.contenttypeid),
          info: info ?? [],
        })
        setFetchStatus('ready')
      } catch (err) {
        if (cancelled) return
        console.warn('[BookingPage] 숙소 정보 조회 실패', err)
        setFetchStatus('failed')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [contentId, navigate])

  async function handleSave() {
    setSaving(true)
    try {
      await saveReservation({
        contentId,
        title: place.title,
        location: place.address,
        image: place.image,
        typeLabel: place.typeLabel,
        dateLabel: formatDateLabel(visitDate),
        peopleLabel: `${people}명`,
        note: note.trim() || null,
      })
      navigate('/mypage/upcoming')
    } catch (err) {
      console.warn('[BookingPage] 여정 저장 실패', err)
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <Header />

      <main>
        <div className={styles.container}>
          {status === 'loading' && <p className={styles.tourStatus}>숙소 정보를 불러오는 중…</p>}

          {status === 'failed' && (
            <p className={styles.tourStatus}>
              숙소 정보를 불러오지 못했습니다. <Link to="/stays">숙소 목록으로 돌아가기</Link>
            </p>
          )}

          {status === 'ready' && (
            <>
              <nav className={styles.stepTracker} aria-label="여정 담기 단계">
                {STEPS.map((step, i) => (
                  <div key={step.n} className={styles.stepItem}>
                    {i > 0 && <span className={styles.stepDivider} aria-hidden="true" />}
                    <span className={cx(styles.stepBadge, styles.stepBadgeActive)}>{step.n}</span>
                    <span className={styles.stepLabel}>{step.label}</span>
                  </div>
                ))}
              </nav>

              <div className={styles.grid}>
                <div className={styles.left}>
                  <section className={styles.summaryCard}>
                    {place.image && (
                      <div className={styles.summaryImage}>
                        <img src={place.image} alt="" />
                        <span className={styles.summaryBadge}>{place.typeLabel}</span>
                      </div>
                    )}
                    <div className={styles.summaryBody}>
                      <div className={styles.summaryTop}>
                        {place.address && (
                          <div className={styles.summaryTags}>
                            <span className={cx(styles.summaryTag, styles.sand)}>{place.address}</span>
                          </div>
                        )}
                        <h1 className={styles.summaryTitle}>
                          <span>{place.title}</span>
                        </h1>
                        {place.overview && (
                          <p className={cx(styles.summaryDescription, styles.summaryDescriptionLive)}>
                            <span>{place.overview}</span>
                          </p>
                        )}
                      </div>
                      {place.info.length > 0 && (
                        <div className={styles.summaryInfoRow}>
                          {place.info.map((label) => (
                            <span key={label} className={styles.summaryInfoItem}>
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  <section className={styles.stepCard}>
                    <div className={styles.stepCardHeading}>
                      <span className={styles.stepNumber}>1</span>
                      <div>
                        <h2 className={styles.stepTitle}>방문 예정일</h2>
                        <p className={styles.stepDescription}>
                          보관함에 담아둘 날짜입니다. 실제 예약은 숙소에 직접 문의해 주세요.
                        </p>
                      </div>
                    </div>
                    <BookingCalendar
                      selectedDate={visitDate}
                      onSelectDate={setVisitDate}
                      closedDates={[]}
                      bookingWindowLabel="방문 예정일"
                    />
                  </section>

                  <section className={styles.stepCard}>
                    <div className={styles.stepCardHeading}>
                      <span className={styles.stepNumber}>2</span>
                      <div>
                        <h2 className={styles.stepTitle}>인원</h2>
                        <p className={styles.stepDescription}>
                          함께 가는 인원입니다. 요금은 숙소마다 달라 여기서 계산하지 않습니다.
                        </p>
                      </div>
                    </div>
                    <div className={styles.participants}>
                      <div className={styles.participantRow}>
                        <div>
                          <p className={styles.participantLabel}>총 인원</p>
                          <p className={styles.participantDescription}>최소 1명</p>
                        </div>
                        <div className={styles.counter}>
                          <button
                            type="button"
                            className={styles.counterButton}
                            onClick={() => setPeople((n) => Math.max(1, n - 1))}
                            aria-label="인원 줄이기"
                          >
                            −
                          </button>
                          <span className={styles.counterValue}>{people}</span>
                          <button
                            type="button"
                            className={styles.counterButton}
                            onClick={() => setPeople((n) => Math.min(20, n + 1))}
                            aria-label="인원 늘리기"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className={styles.stepCard}>
                    <div className={styles.stepCardHeading}>
                      <span className={styles.stepNumber}>3</span>
                      <div>
                        <h2 className={styles.stepTitle}>메모</h2>
                        <p className={styles.stepDescription}>
                          기억해 둘 것이 있으면 적어두세요. 보관함에만 저장됩니다.
                        </p>
                      </div>
                    </div>
                    <div className={styles.formGrid}>
                      <label className={cx(styles.field, styles.fieldWide)}>
                        <span className={styles.fieldLabel}>메모 (선택)</span>
                        <textarea
                          className={styles.fieldTextarea}
                          rows={3}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="예: 늦은 체크인 가능한지 문의하기"
                        />
                      </label>
                    </div>
                  </section>
                </div>

                <aside className={styles.right}>
                  <div className={styles.summaryPanel}>
                    <div className={styles.panelHeader}>
                      <h2 className={styles.panelTitle}>담을 내용</h2>
                    </div>

                    <div className={styles.policyBody}>
                      <div className={styles.policyRow}>
                        <span className={styles.policyRowLabel}>숙소</span>
                        <span className={styles.policyRowValue}>{place.title}</span>
                      </div>
                      <div className={styles.policyRow}>
                        <span className={styles.policyRowLabel}>방문 예정일</span>
                        <span className={styles.policyRowValue}>{formatDateLabel(visitDate)}</span>
                      </div>
                      <div className={styles.policyRow}>
                        <span className={styles.policyRowLabel}>인원</span>
                        <span className={styles.policyRowValue}>{people}명</span>
                      </div>
                    </div>

                    <p className={styles.policyFootnote}>
                      * 이 서비스는 결제를 대행하지 않습니다. 요금과 예약 가능 여부는 숙소에 직접
                      확인해 주세요.
                    </p>

                    <button
                      type="button"
                      className={styles.ctaButton}
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? '담는 중…' : '내 여정에 담기'}
                    </button>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default BookingPage
