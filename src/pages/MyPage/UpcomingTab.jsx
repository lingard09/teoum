import { Link, useOutletContext } from 'react-router-dom'
import styles from './UpcomingTab.module.css'

/**
 * 다가오는 여정. 예약 화면에서 확정한 내역이 그대로 쌓인다.
 * 장소 정보는 TourAPI 값이고, 일정·인원은 사용자가 고른 값이다.
 */
function UpcomingTab() {
  const { reservations, cancelReservation } = useOutletContext()

  if (reservations.length === 0) {
    return (
      <p className={styles.empty}>
        예정된 여정이 없습니다. <Link to="/stays">머무르기</Link>나{' '}
        <Link to="/experiences">체험하기</Link>에서 예약을 진행해 보세요.
      </p>
    )
  }

  return (
    <section className={styles.list} aria-label="다가오는 여정">
      {reservations.map((reservation) => (
        <article key={reservation.id} className={styles.card}>
          {reservation.image && (
            <img className={styles.image} src={reservation.image} alt="" />
          )}

          <div className={styles.body}>
            <div className={styles.head}>
              {reservation.typeLabel && (
                <span className={styles.typeBadge}>{reservation.typeLabel}</span>
              )}
              <span className={styles.savedAt}>예약 {reservation.savedAt}</span>
            </div>

            <h3 className={styles.title}>{reservation.title}</h3>
            {reservation.location && <p className={styles.location}>{reservation.location}</p>}

            <dl className={styles.details}>
              {reservation.dateLabel && (
                <div>
                  <dt>일정</dt>
                  <dd>
                    {reservation.dateLabel}
                    {reservation.slotLabel ? ` · ${reservation.slotLabel}` : ''}
                  </dd>
                </div>
              )}
              {reservation.peopleLabel && (
                <div>
                  <dt>인원</dt>
                  <dd>{reservation.peopleLabel}</dd>
                </div>
              )}
              {reservation.totalLabel && (
                <div>
                  <dt>결제 금액</dt>
                  <dd>{reservation.totalLabel}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className={styles.actions}>
            {reservation.contentId && (
              <Link to={`/experiences/${reservation.contentId}`} className={styles.detailLink}>
                장소 상세
              </Link>
            )}
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => cancelReservation(reservation.id)}
            >
              예약 취소
            </button>
          </div>
        </article>
      ))}
    </section>
  )
}

export default UpcomingTab
