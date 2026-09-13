import { NavLink, Outlet } from 'react-router-dom'
import { profile, reservations, scraps } from '../../data/mypage.js'
import { cx } from '../../utils/cx.js'
import ProfileHero from './ProfileHero.jsx'
import styles from './MyPage.module.css'

const TABS = [
  { to: 'upcoming', label: '다가오는 여정', count: reservations.length },
  { to: 'courses', label: '저장된 AI 여행 코스' },
  { to: 'scraps', label: '관심 스크랩', count: scraps.length },
]

function MyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <ProfileHero profile={profile} />

        <nav className={styles.tabs} aria-label="나의 여정 보관함">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) => cx(styles.tab, isActive && styles.active)}
            >
              {tab.label}
              {tab.count != null && <span className={styles.count}>{tab.count}</span>}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </div>
    </main>
  )
}

export default MyPage
