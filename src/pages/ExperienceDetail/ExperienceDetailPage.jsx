import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import { fetchExperiencePage } from '../../api/experienceApi.js'
import styles from './ExperienceDetailPage.module.css'

/** 체험 상세. 모든 값이 TourAPI 실데이터이고, 없는 항목은 아예 그리지 않는다. */
function ExperienceDetailPage() {
  const { contentId } = useParams()
  const [detail, setDetail] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let alive = true
    fetchExperiencePage(contentId).then((d) => {
      if (!alive) return
      setDetail(d)
      setStatus(d ? 'ready' : 'failed')
    })
    return () => {
      alive = false
    }
  }, [contentId])

  const facts = detail
    ? [
        detail.useTime && { label: '이용 시간', value: detail.useTime },
        detail.restDate && { label: '휴무일', value: detail.restDate },
        detail.parking && { label: '주차', value: detail.parking },
        detail.tel && { label: '문의', value: detail.tel },
      ].filter(Boolean)
    : []

  return (
    <>
      <Header />

      <main className={styles.page}>
        {status === 'loading' && <p className={styles.state}>체험 정보를 불러오는 중…</p>}

        {status === 'failed' && (
          <p className={styles.state}>
            체험 정보를 불러오지 못했습니다. <Link to="/experiences">목록으로 돌아가기</Link>
          </p>
        )}

        {status === 'ready' && (
          <>
            <header className={styles.hero}>
              {detail.image && <img className={styles.heroImage} src={detail.image} alt="" />}
              <span className={styles.heroShade} aria-hidden="true" />

              <div className={styles.heroBody}>
                <div className={styles.badges}>
                  {detail.isHeritage && <span className={styles.badgeMint}>국가유산 지정</span>}
                  <span className={styles.badge}>TourAPI 등록 체험</span>
                </div>
                <h1 className={styles.title}>{detail.title}</h1>
                {detail.address && <p className={styles.address}>{detail.address}</p>}
              </div>
            </header>

            <div className={styles.container}>
              <div className={styles.main}>
                {detail.overview && (
                  <section className={styles.block}>
                    <h2 className={styles.blockTitle}>소개</h2>
                    <p className={styles.overview}>{detail.overview}</p>
                  </section>
                )}

                {detail.programs.length > 0 && (
                  <section className={styles.block}>
                    <h2 className={styles.blockTitle}>체험 프로그램</h2>
                    <ul className={styles.programs}>
                      {detail.programs.map((program) => (
                        <li key={program}>{program}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {detail.gallery.length > 0 && (
                  <section className={styles.block}>
                    <h2 className={styles.blockTitle}>사진</h2>
                    <div className={styles.gallery}>
                      {detail.gallery.map((url) => (
                        <img key={url} src={url} alt="" loading="lazy" />
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className={styles.side}>
                {facts.length > 0 && (
                  <dl className={styles.facts}>
                    {facts.map((fact) => (
                      <div key={fact.label} className={styles.fact}>
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <Link to={`/stays/reserve?contentId=${detail.contentId}`} className={styles.reserve}>
                  예약 진행하기
                </Link>

                {detail.homepage && (
                  <a
                    className={styles.homepage}
                    href={detail.homepage}
                    target="_blank"
                    rel="noreferrer"
                  >
                    공식 홈페이지
                  </a>
                )}

                <Link to="/experiences" className={styles.backLink}>
                  ← 체험 목록으로
                </Link>
              </aside>
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  )
}

export default ExperienceDetailPage
