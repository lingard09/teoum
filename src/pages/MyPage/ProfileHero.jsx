import Icon from '../../components/Icon/Icon.jsx'
import Tag from '../../components/Tag/Tag.jsx'
import { icons } from '../../assets/icons/index.js'
import styles from './ProfileHero.module.css'

function ProfileHero({ profile }) {
  return (
    <section className={styles.hero} aria-label="여행자 프로필">
      <div className={styles.blobMint} aria-hidden="true" />
      <div className={styles.blobPeach} aria-hidden="true" />

      <div className={styles.identity}>
        <div className={styles.avatar}>
          <div className={styles.avatarCrop}>
            <img src={profile.avatar} alt={`${profile.name} 님 프로필`} />
          </div>
          <span className={styles.badge}>
            <Icon {...icons.badge} />
          </span>
        </div>

        <div className={styles.info}>
          <div className={styles.tags}>
            <Tag tone="mint" className={styles.levelTag}>
              {profile.levelLabel}
            </Tag>
            <Tag tone="sand">{profile.memberLabel}</Tag>
          </div>
          <p className={styles.nameRow}>
            <strong className={styles.name}>{profile.name} 님</strong>
            <span className={styles.journey}>여정 기록 {profile.journeyCount}회차</span>
          </p>
          <p className={styles.summary}>{profile.summary}</p>
        </div>
      </div>
    </section>
  )
}

export default ProfileHero
