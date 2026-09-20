import Icon from '../../components/Icon/Icon.jsx'
import Tag from '../../components/Tag/Tag.jsx'
import { icons } from '../../assets/icons/index.js'
import avatar from '../../assets/images/avatar.png'
import styles from './ProfileHero.module.css'

/**
 * 보관함 요약.
 *
 * 등급·스탬프 같은 값은 만들지 않는다. 실제 활동(담은 스크랩·저장한 코스·예약)
 * 개수만 보여준다. 익명 계정이라 이름 대신 "나의 보관함"으로 부른다.
 */
function ProfileHero({ counts }) {
  const stats = [
    { label: '다가오는 여정', value: counts.reservations },
    { label: '저장된 AI 코스', value: counts.courses },
    { label: '관심 스크랩', value: counts.scraps },
  ]
  const total = stats.reduce((sum, s) => sum + s.value, 0)

  return (
    <section className={styles.hero} aria-label="보관함 요약">
      <div className={styles.blobMint} aria-hidden="true" />
      <div className={styles.blobPeach} aria-hidden="true" />

      <div className={styles.identity}>
        <div className={styles.avatar}>
          <div className={styles.avatarCrop}>
            <img src={avatar} alt="" />
          </div>
          <span className={styles.badge}>
            <Icon {...icons.badge} />
          </span>
        </div>

        <div className={styles.info}>
          <div className={styles.tags}>
            <Tag tone="mint" className={styles.levelTag}>
              한국관광공사 TourAPI 연동
            </Tag>
            <Tag tone="sand">이 브라우저에 저장됨</Tag>
          </div>
          <p className={styles.nameRow}>
            <strong className={styles.name}>나의 보관함</strong>
            <span className={styles.journey}>담은 항목 {total}개</span>
          </p>

          <dl className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

export default ProfileHero
