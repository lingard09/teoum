import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import { fetchExperienceDetail, fetchExperienceOverview } from '../../api/experienceApi.js'
import styles from './ExperienceCard.module.css'

/**
 * TourAPI 관광지/문화시설 데이터로 그리는 체험 카드.
 *
 * 큐레이션 카드와 레이아웃은 같지만 요금·소요시간·평점 자리가 다르다 —
 * TourAPI가 주지 않는 값이라 지어내지 않고, 실제로 오는 체험 프로그램 안내와
 * 이용시간·휴무일·문의처를 대신 보여준다.
 */
function ApiExperienceCard({ experience }) {
  const [detail, setDetail] = useState(null)
  const [overview, setOverview] = useState(null)

  useEffect(() => {
    let alive = true
    fetchExperienceDetail(experience.contentId).then((d) => {
      if (!alive) return
      setDetail(d)
      // 체험 프로그램이 등록돼 있지 않은 곳만 소개문구를 추가로 불러온다.
      if (!d || d.programs.length === 0) {
        fetchExperienceOverview(experience.contentId).then((o) => {
          if (alive) setOverview(o)
        })
      }
    })
    return () => {
      alive = false
    }
  }, [experience.contentId])

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img src={experience.image} alt="" />
        <div className={styles.gradient} />
        <div className={styles.badges}>
          {detail?.isHeritage && (
            <span className={styles.badge} style={{ background: '#c4e7db', color: '#002019' }}>
              국가유산 지정
            </span>
          )}
          <span className={styles.badge} style={{ background: '#efe7dc', color: '#311908' }}>
            TourAPI 등록 체험
          </span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.top}>
          <div className={styles.meta}>
            <Icon {...icons.locationPin} />
            <span>{experience.location}</span>
            {detail?.useTime && (
              <>
                <span>·</span>
                <Icon {...icons.durationClock} />
                <span>{detail.useTime}</span>
              </>
            )}
          </div>

          <h3 className={styles.title}>
            <span>{experience.name}</span>
          </h3>

          {detail?.programs.length > 0 ? (
            <ul className={styles.programs}>
              {detail.programs.map((program) => (
                <li key={program}>{program}</li>
              ))}
            </ul>
          ) : (
            <p className={styles.description}>
              <span>{overview ?? '한국관광공사 TourAPI에 등록된 체험 시설입니다.'}</span>
            </p>
          )}
        </div>

        <div className={styles.footer}>
          {/* 요금·평점 자리에 실제로 있는 값(휴무일·문의처)을 넣는다. */}
          <span className={styles.apiNote}>
            {detail?.restDate ? `휴무 ${detail.restDate}` : '휴무 정보 없음'}
          </span>
          <span className={styles.apiTel}>{detail?.tel || experience.tel || '문의처 없음'}</span>
        </div>

        {/* 체험은 예약·결제를 다루지 않는다. 상세정보로만 이어진다. */}
        <Link to={`/experiences/${experience.contentId}`} className={styles.apiDetailButton}>
          상세정보 보기
        </Link>
      </div>
    </article>
  )
}

export default ApiExperienceCard
