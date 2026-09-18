import { useOutletContext } from 'react-router-dom'
import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import styles from './ScrapsTab.module.css'

function ScrapsTab() {
  const { scraps, unscrap } = useOutletContext()

  return (
    <section className={styles.section} aria-labelledby="scraps-heading">
      <h2 id="scraps-heading" className={styles.heading}>
        스크랩한 한옥 &amp; 체험지
      </h2>

      {scraps.length === 0 ? (
        <p className={styles.empty}>아직 스크랩한 곳이 없습니다.</p>
      ) : (
        <ul className={styles.grid}>
          {scraps.map((scrap) => (
            <li key={scrap.id} className={styles.card}>
              <div className={styles.media}>
                <img src={scrap.image} alt={scrap.title} />
                <button
                  type="button"
                  className={styles.bookmark}
                  aria-label={`${scrap.title} 스크랩 해제`}
                  onClick={() => unscrap(scrap.id)}
                >
                  <Icon {...icons.bookmark} />
                </button>
                <span className={styles.location}>{scrap.location}</span>
              </div>

              <div className={styles.body}>
                <h4 className={styles.title}>{scrap.title}</h4>
                <p className={styles.description}>{scrap.description}</p>
                <div className={styles.footer}>
                  <span className={styles.date}>스크랩 일자: {scrap.scrapedAt}</span>
                  <button type="button" className={styles.addButton}>
                    여정에 추가 +
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ScrapsTab
