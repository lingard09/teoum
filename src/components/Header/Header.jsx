import { NavLink } from 'react-router-dom'
import Icon from '../Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import avatar from '../../assets/images/avatar.png'
import logoMark from '../../assets/icons/logo.png'
import { cx } from '../../utils/cx.js'
import styles from './Header.module.css'

const NAV_LINKS = [
  { label: '모아보기', to: '/' },
  { label: '체험하기', to: '/experiences' },
  { label: '계획하기', to: '/plan' },
  { label: '머무르기', to: '/stays' },
  { label: '둘러보기', to: '/map' },
]

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <NavLink to="/" className={styles.brand}>
            <span className={styles.brandMark}>
              <img src={logoMark} alt="" className={styles.brandMarkImage} />
            </span>
            <span className={styles.brandText}>
              <span className={styles.brandTitle}>다시, 터움</span>
              <span className={styles.brandSubtitle}>TEOUM</span>
            </span>
          </NavLink>

          <nav className={styles.nav} aria-label="주요 메뉴">
            {NAV_LINKS.map((link) =>
              link.to ? (
                <NavLink
                  key={link.label}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) => cx(styles.navLink, isActive && styles.navLinkActive)}
                >
                  {link.label}
                </NavLink>
              ) : (
                <span key={link.label} className={styles.navLink}>
                  {link.label}
                </span>
              ),
            )}
          </nav>
        </div>

        <div className={styles.right}>
          <button type="button" className={styles.languageButton}>
            <Icon {...icons.language} />
            <span>KR (한국어)</span>
          </button>

          <span className={styles.divider} aria-hidden="true" />

          <NavLink to="/mypage" className={styles.userButton}>
            <span className={styles.avatar}>
              <img src={avatar} alt="" />
            </span>
            <span>광숙이</span>
          </NavLink>
        </div>
      </div>
    </header>
  )
}

export default Header
