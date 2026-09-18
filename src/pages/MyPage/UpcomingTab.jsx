import { useOutletContext } from 'react-router-dom'
import ReservationCard from './ReservationCard.jsx'
import styles from './UpcomingTab.module.css'

function UpcomingTab() {
  const { reservations } = useOutletContext()

  if (reservations.length === 0) {
    return <p className={styles.empty}>예정된 여정이 없습니다.</p>
  }

  return (
    <section className={styles.list} aria-label="다가오는 여정">
      {reservations.map((reservation) => (
        <ReservationCard key={reservation.id} reservation={reservation} />
      ))}
    </section>
  )
}

export default UpcomingTab
