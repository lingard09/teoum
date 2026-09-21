import { useState } from 'react'
import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import { cx } from '../../utils/cx.js'
import styles from './BookingCalendar.module.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function buildMonthGrid(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inMonth: false })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, inMonth: true, key: toDateKey(year, month, day) })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - firstWeekday - daysInMonth + 1, inMonth: false })
  }
  return cells
}

function BookingCalendar({ selectedDate, onSelectDate, closedDates, bookingWindowLabel }) {
  const [initialYear, initialMonth] = selectedDate.split('-').map(Number)
  const [viewDate, setViewDate] = useState(new Date(initialYear, initialMonth - 1, 1))

  const cells = buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth())

  function changeMonth(delta) {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1))
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.monthLabel}>
            {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
          </span>
          <span className={styles.windowTag}>{bookingWindowLabel}</span>
        </div>
        <div className={styles.monthNav}>
          <button type="button" className={styles.navButton} onClick={() => changeMonth(-1)} aria-label="이전 달">
            <Icon {...icons.bookingCalendarPrev} />
          </button>
          <button type="button" className={styles.navButton} onClick={() => changeMonth(1)} aria-label="다음 달">
            <Icon {...icons.bookingCalendarNext} />
          </button>
        </div>
      </div>

      <div className={styles.weekdays}>
        {WEEKDAYS.map((w, i) => (
          <span key={w} className={cx(styles.weekday, i === 0 && styles.sunday, i === 6 && styles.saturday)}>
            {w}
          </span>
        ))}
      </div>

      <div className={styles.grid}>
        {cells.map((cell, i) => {
          if (!cell.inMonth) {
            return (
              <div key={i} className={styles.dayMuted}>
                {cell.day}
              </div>
            )
          }
          const isClosed = closedDates.includes(cell.key)
          const isSelected = cell.key === selectedDate
          // 예약을 받지 않으므로 "잔여" 같은 좌석 상태는 쓰지 않는다.
          // TourAPI에 그런 값이 없어서, 붙이면 지어낸 값이 된다.
          return (
            <button
              key={cell.key}
              type="button"
              className={cx(styles.day, isClosed && styles.dayClosed, isSelected && styles.daySelected)}
              disabled={isClosed}
              onClick={() => onSelectDate(cell.key)}
            >
              <span className={styles.dayNumber}>{cell.day}</span>
              {isSelected && <span className={styles.dayStatus}>선택됨</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BookingCalendar
