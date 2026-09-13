import Button from '../../components/Button/Button.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import Tag from '../../components/Tag/Tag.jsx'
import { cx } from '../../utils/cx.js'
import styles from './ReservationCard.module.css'

function ReservationCard({ reservation }) {
  const { id, category, image, location, title, details, detailsLayout, actionSize, actions } =
    reservation
  const isGrid = detailsLayout === 'grid'

  return (
    <article className={cx(styles.card, isGrid ? styles.gridCard : styles.listCard)}>
      <div className={styles.corner} aria-hidden="true" />

      <header className={styles.header}>
        <Tag tone={category.tone} icon={<Icon {...category.icon} />}>
          {category.label}
        </Tag>
        <span className={styles.number}>예약번호 {id}</span>
      </header>

      <div className={styles.body}>
        <div className={styles.thumb}>
          <img src={image} alt={title} />
        </div>

        <div className={styles.info}>
          <div>
            <p className={styles.location}>{location}</p>
            <h3 className={styles.title}>{title}</h3>
          </div>

          <div className={styles.bottom}>
            <dl className={isGrid ? styles.detailsGrid : styles.detailsList}>
              {details.map((detail) => (
                <div key={detail.label} className={styles.detail}>
                  <dt>{detail.label}:</dt>
                  <dd>
                    {detail.value}
                    {detail.icon && <Icon {...detail.icon} />}
                  </dd>
                </div>
              ))}
            </dl>

            <div className={styles.actions}>
              {actions.map((action) => (
                <Button key={action.label} variant={action.variant} size={actionSize}>
                  {action.icon && <Icon {...action.icon} />}
                  {action.label}
                  {action.trailingIcon && <Icon {...action.trailingIcon} />}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default ReservationCard
