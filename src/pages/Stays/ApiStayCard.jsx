import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import { fetchStayDetail, fetchStayOverview } from '../../api/stayApi.js'
import { cx } from '../../utils/cx.js'
import styles from './StayCard.module.css'

/**
 * TourAPI 숙박 데이터로 그리는 카드.
 *
 * 큐레이션 카드(StayCard)와 달리 평점·가격·감성 문구가 없다 — TourAPI가 주지
 * 않는 값이라 지어내지 않고, 대신 실제로 오는 값(객실 타입, 체크인/아웃,
 * 편의시설, 소개문구)을 보여준다.
 */
function ApiStayCard({ stay, saved, onToggleSave }) {
  const [detail, setDetail] = useState(null)
  const [overview, setOverview] = useState(null)

  useEffect(() => {
    let alive = true
    fetchStayDetail(stay.contentId).then((d) => {
      if (alive) setDetail(d)
    })
    fetchStayOverview(stay.contentId).then((o) => {
      if (alive) setOverview(o)
    })
    return () => {
      alive = false
    }
  }, [stay.contentId])

  const checkLabel =
    detail?.checkIn && detail?.checkOut ? `체크인 ${detail.checkIn} · 퇴실 ${detail.checkOut}` : null

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img src={stay.image} alt="" />
        <div className={styles.badges}>
          {detail?.roomType && <span className={cx(styles.badge, styles.dark)}>{detail.roomType}</span>}
          <span className={styles.badge}>TourAPI 등록 숙소</span>
        </div>
        <button
          type="button"
          className={cx(styles.saveButton, saved && styles.saveButtonActive)}
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? `${stay.name} 관심 한옥 보관 해제` : `${stay.name} 관심 한옥 보관`}
        >
          <Icon {...icons.stayHeart} />
        </button>
        <div className={styles.locationTag}>
          <Icon {...icons.stayLocationPin} />
          <span>{stay.location}</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.top}>
          <div className={styles.subtitleRow}>
            <span className={styles.subtitle}>
              {detail?.roomCount ? `객실 ${detail.roomCount}` : '한옥 숙소'}
            </span>
          </div>
          <h3 className={styles.title}>
            <span>{stay.name}</span>
          </h3>
          <p className={styles.description}>
            <span>{overview ?? '한국관광공사 TourAPI에 등록된 한옥 숙소입니다.'}</span>
          </p>
          <div className={styles.amenities}>
            {checkLabel && <span className={styles.amenity}>{checkLabel}</span>}
            {detail?.amenities.map((item) => (
              <span key={item} className={styles.amenity}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            {/* TourAPI는 요금을 제공하지 않는다. 지어내는 대신 문의 전화를 노출한다. */}
            <span className={styles.priceLabel}>문의</span>
            <span className={styles.apiTel}>{detail?.tel || stay.tel || '정보 없음'}</span>
          </div>
          <div className={styles.cardActions}>
            <Link to={`/experiences/${stay.contentId}`} className={styles.detailButton}>
              상세보기
            </Link>
            <Link to={`/stays/reserve?contentId=${stay.contentId}`} className={styles.reserveButton}>
              여정에 담기
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export default ApiStayCard
