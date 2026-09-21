import { Link, useOutletContext } from 'react-router-dom'
import styles from './UpcomingTab.module.css'

/**
 * 다가오는 여정. 머무르기에서 담아둔 방문 계획이 쌓인다.
 * 장소 정보는 TourAPI 값이고, 날짜·인원·메모는 사용자가 고른 값이다.
 * 결제를 대행하지 않으므로 금액은 두지 않는다.
 */
function UpcomingTab() {
  const { reservations, cancelReservation } = useOutletContext()

  if (reservations.length === 0) {
    return (
      <p className={styles.empty}>
        예정된 여정이 없습니다. <Link to="/stays">머무르기</Link>에서 숙소를 골라
        방문 계획을 담아 보세요.
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
              <span className={styles.savedAt}>담은 날 {reservation.savedAt}</span>
            </div>

            <h3 className={styles.title}>{reservation.title}</h3>
            {reservation.location && <p className={styles.location}>{reservation.location}</p>}

            <dl className={styles.details}>
              {reservation.dateLabel && (
                <div>
                  <dt>일정</dt>
                  <dd>
                    {reservation.dateLabel}
                  </dd>
                </div>
              )}
              {reservation.peopleLabel && (
                <div>
                  <dt>인원</dt>
                  <dd>{reservation.peopleLabel}</dd>
                </div>
              )}
              {reservation.note && (
                <div>
                  <dt>메모</dt>
                  <dd>{reservation.note}</dd>
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
              여정에서 빼기
            </button>
          </div>
        </article>
      ))}
    </section>
  )
}

export default UpcomingTab
