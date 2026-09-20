import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import { cx } from '../../utils/cx.js'
import {
  contentTypeLabel,
  fetchBookingInfo,
  fetchDetailCommon,
  fetchExperienceDetail,
  stripOverviewHtml,
  toHttpsUrl,
} from '../../api/tourApiDetail.js'
import {
  steps,
  experienceSummary,
  step1,
  step2,
  step3,
  discount,
  materialFeeLabel,
  paymentMethods,
  cancellationPolicy,
  guaranteeNote,
} from '../../data/booking.js'
import BookingCalendar from './BookingCalendar.jsx'
import styles from './BookingPage.module.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
// 결제 대상은 목록(체험하기/머무르기)에서 누른 실제 항목이다. 카드가 넘겨준
// contentId로 TourAPI 상세를 조회해 이름·사진·주소·소개글을 채운다.
//
// 주소로 직접 들어온 경우처럼 contentId가 없으면 아래 키워드로 대표 장소 하나를
// 보여준다. 요금·정원·환불규정은 TourAPI에 없는 값이라 booking.js의 시나리오
// 데이터를 그대로 쓴다(실제 결제 연동이 아닌 데모 플로우).
const FALLBACK_KEYWORD = '북촌한옥마을'

function formatDateLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return `${m}월 ${d}일(${WEEKDAYS[date.getDay()]})`
}

function BookingPage() {
  const [searchParams] = useSearchParams()
  const contentId = searchParams.get('contentId')

  const [selectedDate, setSelectedDate] = useState(step1.defaultSelectedDate)
  const [selectedSlotId, setSelectedSlotId] = useState(step1.defaultSlotId)
  const [counts, setCounts] = useState(() =>
    Object.fromEntries(step2.participants.map((p) => [p.id, p.defaultCount])),
  )
  const [name, setName] = useState(step3.defaultName)
  const [phone, setPhone] = useState(step3.defaultPhone)
  const [note, setNote] = useState('')
  const [paymentMethodId, setPaymentMethodId] = useState(null)
  const [policyOpen, setPolicyOpen] = useState(true)
  const [tourInfo, setTourInfo] = useState(null)
  const [tourStatus, setTourStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false

    async function loadTourInfo() {
      setTourStatus('loading')
      try {
        // contentId가 있으면 그 항목을 그대로 조회하고, 없으면 대표 장소로 대체한다.
        const detail = contentId
          ? await fetchDetailCommon(contentId)
          : await fetchExperienceDetail(FALLBACK_KEYWORD)
        if (cancelled) return
        if (!detail?.title) {
          setTourStatus('fallback')
          return
        }
        // 요약 배지는 항목 종류에 따라 다른 필드를 쓴다(숙소=체크인/객실,
        // 체험=이용시간/휴무/프로그램). TourAPI에 없는 값은 넣지 않는다.
        const info = await fetchBookingInfo(detail.contentid, detail.contenttypeid)
        if (cancelled) return

        setTourInfo({
          title: detail.title,
          address: [detail.addr1, detail.addr2].filter(Boolean).join(' '),
          image: toHttpsUrl(detail.firstimage),
          overview: stripOverviewHtml(detail.overview),
          typeLabel: contentTypeLabel(detail.contenttypeid),
          info,
        })
        setTourStatus('live')
      } catch (err) {
        if (cancelled) return
        console.error('TourAPI 연동 실패, mock 데이터로 대체합니다:', err)
        setTourStatus('fallback')
      }
    }

    loadTourInfo()
    return () => {
      cancelled = true
    }
  }, [contentId])

  function changeCount(id, delta) {
    setCounts((prev) => ({ ...prev, [id]: Math.max(0, prev[id] + delta) }))
  }

  const displaySummary = {
    image: tourInfo?.image || experienceSummary.image,
    address: tourInfo?.address || experienceSummary.tags[0]?.label,
    title: tourInfo?.title ? [tourInfo.title] : experienceSummary.title,
    description: tourInfo?.overview ? [tourInfo.overview] : experienceSummary.description,
  }

  const subtotal = useMemo(
    () => step2.participants.reduce((sum, p) => sum + p.price * counts[p.id], 0),
    [counts],
  )
  const total = Math.max(0, subtotal - discount.amount)
  const adultCount = counts.adult ?? 0

  return (
    <div className={styles.page}>
      <Header />

      <main>
        <div className={styles.container}>
          <nav className={styles.stepTracker} aria-label="예약 진행 단계">
            {steps.map((step, i) => (
              <div key={step.n} className={styles.stepItem}>
                {i > 0 && <span className={styles.stepDivider} aria-hidden="true" />}
                <span className={cx(styles.stepBadge, step.n <= 2 ? styles.stepBadgeActive : styles.stepBadgePending)}>
                  {step.n}
                </span>
                <span className={cx(styles.stepLabel, step.n > 2 && styles.stepLabelPending)}>{step.label}</span>
              </div>
            ))}
          </nav>

          <div className={styles.grid}>
            <div className={styles.left}>
              <section className={styles.summaryCard}>
                <div className={styles.summaryImage}>
                  <img src={displaySummary.image} alt="" />
                  <span className={styles.summaryBadge}>
                    <Icon {...experienceSummary.badge.icon} />
                    {tourInfo?.typeLabel ?? experienceSummary.badge.label}
                  </span>
                </div>
                <div className={styles.summaryBody}>
                  <div className={styles.summaryTop}>
                    <span className={cx(styles.tourStatus, styles[`tourStatus_${tourStatus}`])}>
                      {tourStatus === 'loading' && '실시간 관광정보 불러오는 중…'}
                      {tourStatus === 'live' && `TourAPI 실시간 연동 · ${displaySummary.title[0]}`}
                      {tourStatus === 'fallback' && 'TourAPI 연동 실패 · 예시 정보 표시 중'}
                    </span>
                    <div className={styles.summaryTags}>
                      <span className={cx(styles.summaryTag, styles.sand)}>{displaySummary.address}</span>
                      {!tourInfo && (
                        <span className={cx(styles.summaryTag, styles.mint)}>
                          {experienceSummary.tags[1]?.label}
                        </span>
                      )}
                    </div>
                    <h1 className={styles.summaryTitle}>
                      {displaySummary.title.map((line, i) => (
                        <span key={i}>{line}</span>
                      ))}
                    </h1>
                    <p className={cx(styles.summaryDescription, tourInfo && styles.summaryDescriptionLive)}>
                      {displaySummary.description.map((line, i) => (
                        <span key={i}>{line}</span>
                      ))}
                    </p>
                  </div>
                  <div className={styles.summaryInfoRow}>
                    {tourInfo?.info?.length
                      ? tourInfo.info.map((label) => (
                          <span key={label} className={styles.summaryInfoItem}>
                            {label}
                          </span>
                        ))
                      : experienceSummary.info.map((item) => (
                      <span key={item.label} className={styles.summaryInfoItem}>
                        <Icon {...item.icon} />
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              <section className={styles.stepCard}>
                <div className={styles.stepCardHeader}>
                  <div className={styles.stepCardHeading}>
                    <span className={styles.stepNumber}>1</span>
                    <div>
                      <h2 className={styles.stepTitle}>{step1.title}</h2>
                      <p className={styles.stepDescription}>{step1.description}</p>
                    </div>
                  </div>
                  <span className={styles.monthChip}>
                    {selectedDate.slice(0, 4)}년 {Number(selectedDate.slice(5, 7))}월
                  </span>
                </div>

                <BookingCalendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  closedDates={step1.closedDates}
                  bookingWindowLabel={step1.bookingWindowLabel}
                />

                <div className={styles.slotsSection}>
                  <div className={styles.slotsHeader}>
                    <span className={styles.slotsHeading}>{step1.timeSlotHeading(formatDateLabel(selectedDate))}</span>
                    <span className={styles.slotsNote}>{step1.arrivalNote}</span>
                  </div>
                  <div className={styles.slots}>
                    {step1.timeSlots.map((slot) => {
                      const soldOut = slot.status === 'soldout'
                      const selected = slot.id === selectedSlotId
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          className={cx(styles.slot, selected && styles.slotSelected, soldOut && styles.slotSoldOut)}
                          disabled={soldOut}
                          onClick={() => setSelectedSlotId(slot.id)}
                        >
                          <span className={styles.slotTime}>{slot.time}</span>
                          <span className={styles.slotSeats}>
                            <span className={styles.slotDot} />
                            {selected ? `선택됨 (${slot.seatsLabel})` : slot.seatsLabel}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </section>

              <section className={styles.stepCard}>
                <div className={styles.stepCardHeading}>
                  <span className={styles.stepNumber}>2</span>
                  <div>
                    <h2 className={styles.stepTitle}>{step2.title}</h2>
                    <p className={styles.stepDescription}>{step2.description}</p>
                  </div>
                </div>

                <div className={styles.participants}>
                  {step2.participants.map((p) => (
                    <div key={p.id} className={styles.participantRow}>
                      <div>
                        <div className={styles.participantLabelRow}>
                          <span className={styles.participantLabel}>{p.label}</span>
                          {p.tag && <span className={styles.participantTag}>{p.tag}</span>}
                        </div>
                        <p className={styles.participantDescription}>{p.description}</p>
                        <p className={styles.participantPrice}>
                          <span className={styles.participantPriceValue}>{p.price.toLocaleString()}원</span>
                          <span className={styles.participantPriceUnit}> / 1인</span>
                        </p>
                      </div>
                      <div className={styles.counter}>
                        <button
                          type="button"
                          className={styles.counterButton}
                          onClick={() => changeCount(p.id, -1)}
                          aria-label={`${p.label} 인원 감소`}
                        >
                          <Icon {...icons.bookingCounterMinus} />
                        </button>
                        <span className={styles.counterValue}>{counts[p.id]}</span>
                        <button
                          type="button"
                          className={styles.counterButton}
                          onClick={() => changeCount(p.id, 1)}
                          aria-label={`${p.label} 인원 증가`}
                        >
                          <Icon {...icons.bookingCounterPlus} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.stepCard}>
                <div className={styles.stepCardHeading}>
                  <span className={styles.stepNumber}>3</span>
                  <div>
                    <h2 className={styles.stepTitle}>{step3.title}</h2>
                    <p className={styles.stepDescription}>{step3.description}</p>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>
                      예약자 성명 <span className={styles.required}>*</span>
                    </span>
                    <input
                      type="text"
                      className={styles.fieldInput}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>
                      연락처 (휴대폰 번호) <span className={styles.required}>*</span>
                    </span>
                    <input
                      type="tel"
                      className={styles.fieldInput}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </label>
                  <label className={cx(styles.field, styles.fieldWide)}>
                    <span className={styles.fieldLabelRow}>
                      <span className={styles.fieldLabel}>{step3.noteLabel}</span>
                      <span className={styles.fieldHint}>{step3.noteHint}</span>
                    </span>
                    <textarea
                      className={styles.fieldTextarea}
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={step3.notePlaceholder}
                    />
                  </label>
                </div>
              </section>
            </div>

            <aside className={styles.right}>
              <div className={styles.summaryPanel}>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>결제 예정 내역</h2>
                  <Icon {...icons.bookingReceipt} />
                </div>

                <div className={styles.priceLines}>
                  <div className={styles.priceLine}>
                    <div>
                      <p className={styles.priceLineLabel}>기본 참가비 (성인)</p>
                      <p className={styles.priceLineSub}>
                        {step2.participants[0].price.toLocaleString()}원 × {adultCount}인
                      </p>
                    </div>
                    <span className={styles.priceLineValue}>{subtotal.toLocaleString()}원</span>
                  </div>
                  <div className={styles.priceLine}>
                    <div className={styles.discountLabelRow}>
                      <p className={styles.discountLabel}>{discount.label}</p>
                      <span className={styles.discountTag}>{discount.tag}</span>
                    </div>
                    <span className={styles.discountValue}>-{discount.amount.toLocaleString()}원</span>
                  </div>
                  <div className={styles.priceLine}>
                    <p className={styles.priceLineLabel}>{materialFeeLabel}</p>
                    <span className={styles.freeValue}>0원 (전액 무료)</span>
                  </div>
                </div>

                <div className={styles.totalDivider} />

                <div className={styles.totalRow}>
                  <div>
                    <p className={styles.totalLabel}>최종 결제 금액</p>
                    <p className={styles.totalSub}>부가세 및 안심보험료 포함</p>
                  </div>
                  <p className={styles.totalValue}>
                    {total.toLocaleString()}
                    <Icon {...icons.bookingWon} />
                  </p>
                </div>

                <div className={styles.paymentSection}>
                  <p className={styles.paymentHeading}>간편 결제 수단 선택</p>
                  <div className={styles.paymentGrid}>
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        className={cx(styles.paymentButton, paymentMethodId === method.id && styles.paymentButtonActive)}
                        style={{ background: method.bg }}
                        onClick={() => setPaymentMethodId(method.id)}
                      >
                        {method.logo ? (
                          <img src={method.logo} alt="" className={styles.paymentLogo} />
                        ) : (
                          <Icon {...method.icon} />
                        )}
                        <span style={{ color: method.color }}>{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button type="button" className={styles.ctaButton}>
                  <Icon {...icons.bookingLock} />
                  {total.toLocaleString()}원 결제하고 예약 확정하기
                </button>

                <div className={styles.policy}>
                  <button
                    type="button"
                    className={styles.policyToggle}
                    onClick={() => setPolicyOpen((v) => !v)}
                    aria-expanded={policyOpen}
                  >
                    <span className={styles.policyToggleLabel}>
                      <Icon {...icons.bookingInfo} />
                      {cancellationPolicy.title}
                    </span>
                    <span className={cx(styles.policyChevron, policyOpen && styles.policyChevronOpen)}>
                      <Icon {...icons.bookingChevronToggle} />
                    </span>
                  </button>
                  {policyOpen && (
                    <div className={styles.policyBody}>
                      {cancellationPolicy.rows.map((row) => (
                        <div key={row.label} className={styles.policyRow}>
                          <span className={styles.policyRowLabel}>{row.label}</span>
                          <span className={cx(styles.policyRowValue, styles[`policy_${row.tone}`])}>{row.value}</span>
                        </div>
                      ))}
                      <p className={styles.policyFootnote}>{cancellationPolicy.footnote}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.guaranteeNote}>
                <Icon {...icons.bookingAward} />
                <p>
                  {guaranteeNote.before}
                  <strong>{guaranteeNote.emphasis}</strong>
                  {guaranteeNote.after}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default BookingPage
