import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { loadMyPage, removeScrap } from '../../api/mypageApi.js'
import { cx } from '../../utils/cx.js'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import ProfileHero from './ProfileHero.jsx'
import styles from './MyPage.module.css'

function MyPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let alive = true
    loadMyPage().then((result) => {
      if (alive) setData(result)
    })
    return () => {
      alive = false
    }
  }, [])

  // 낙관적 업데이트: 화면에서 먼저 지우고, 삭제가 실패하면 서버 상태를 다시 읽어 되돌린다.
  const unscrap = useCallback(async (scrapId) => {
    setData((prev) => ({ ...prev, scraps: prev.scraps.filter((s) => s.id !== scrapId) }))
    try {
      await removeScrap(scrapId)
    } catch (err) {
      console.warn('[MyPage] 스크랩 해제 실패, 목록을 다시 불러옵니다.', err)
      setData(await loadMyPage())
    }
  }, [])

  if (!data) {
    return (
      <>
        <Header />
        <main className={styles.page}>
          <div className={styles.container}>
            <p className={styles.loading}>여정 보관함을 불러오는 중…</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const tabs = [
    { to: 'upcoming', label: '다가오는 여정', count: data.reservations.length },
    { to: 'courses', label: '저장된 AI 여행 코스' },
    { to: 'scraps', label: '관심 스크랩', count: data.scraps.length },
  ]

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.container}>
          {data.profile && <ProfileHero profile={data.profile} />}

          {data.source === 'unavailable' && (
            <p className={styles.notice}>
              보관함을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </p>
          )}

          <nav className={styles.tabs} aria-label="나의 여정 보관함">
            {tabs.map((tab) => (
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

          <Outlet context={{ ...data, unscrap }} />
        </div>
      </main>
      <Footer />
    </>
  )
}

export default MyPage
