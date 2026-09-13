import { Fragment } from 'react'
import Icon from '../../components/Icon/Icon.jsx'
import Tag from '../../components/Tag/Tag.jsx'
import { icons } from '../../assets/icons/index.js'
import { cx } from '../../utils/cx.js'
import styles from './DayTimeline.module.css'

const TIME_TONES = {
  default: undefined,
  green: styles.toneGreen,
  dark: styles.toneDark,
}

function DayTimeline({ day }) {
  return (
    <article className={styles.card}>
      <header className={styles.dayHeader}>
        <div className={styles.dayTitleGroup}>
          <span className={styles.dayPill}>{day.label}</span>
          <h3 className={styles.dayTitle}>{day.title}</h3>
        </div>
        <p className={styles.dayStats}>
          {day.stats.map((stat, index) => (
            <Fragment key={stat}>
              {index > 0 && <span aria-hidden="true">·</span>}
              <span>{stat}</span>
            </Fragment>
          ))}
        </p>
      </header>

      <ol className={styles.timeline}>
        <li className={styles.spine} aria-hidden="true" />

        {day.waypoints.map((waypoint) => (
          <li key={waypoint.time} className={styles.item}>
            <div className={styles.waypoint}>
              <div className={cx(styles.time, TIME_TONES[waypoint.tone])}>
                <span className={styles.timeKind}>{waypoint.kind}</span>
                <span className={styles.timeValue}>{waypoint.time}</span>
              </div>

              <div className={styles.stop}>
                <div className={styles.stopInfo}>
                  <div className={styles.stopTags}>
                    <Tag tone={waypoint.tag.tone}>{waypoint.tag.label}</Tag>
                    <span className={styles.stopSub}>{waypoint.subLabel}</span>
                  </div>
                  <h4 className={styles.stopTitle}>{waypoint.title}</h4>
                  <p className={styles.stopDesc}>{waypoint.description}</p>
                  <p className={styles.meta}>
                    {waypoint.meta.map((item, index) => (
                      <Fragment key={item.text}>
                        {index > 0 && <span className={styles.metaDot}>·</span>}
                        <Icon {...item.icon} />
                        <span>{item.text}</span>
                      </Fragment>
                    ))}
                  </p>
                </div>
                <div className={styles.stopImage}>
                  <img src={waypoint.image} alt={waypoint.title} />
                </div>
              </div>
            </div>

            {waypoint.transit && (
              <p className={styles.transit}>
                <Icon {...icons.walk} />
                {waypoint.transit}
              </p>
            )}
          </li>
        ))}
      </ol>
    </article>
  )
}

export default DayTimeline
