import Icon from '../Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import logoMark from '../../assets/icons/logo.png'
import styles from './Footer.module.css'

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandRow}>
          <span className={styles.brandMark}>
            <img src={logoMark} alt="" className={styles.brandMarkImage} />
          </span>
          <span className={styles.brandTitle}>다시, 터움</span>
        </div>

        <p className={styles.description}>
          한국 고유의 정취가 깃든 전국 한옥마을의 전통 가옥, 골목길 문화 자원, 장인 체험을 AI 기반으로 섬세하게 엮어 품격 있는
          쉼과 여행을 선사합니다.
        </p>

        <div className={styles.badge}>
          <Icon {...icons.checkCircle} />
          <span>한국관광공사 TourAPI 공공데이터 연계 공식 서비스</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
