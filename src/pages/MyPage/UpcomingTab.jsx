import { reservations } from '../../data/mypage.js'
import ReservationCard from './ReservationCard.jsx'
import styles from './UpcomingTab.module.css'

function UpcomingTab() {
  return (
    <section className={styles.list} aria-label="다가오는 여정">
      {reservations.map((reservation) => (
        <ReservationCard key={reservation.id} reservation={reservation} />
      ))}
    </section>
  )
}

export default UpcomingTab
