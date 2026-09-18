import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { icons } from '../../assets/icons/index.js'
import { plan } from '../../data/aiPlan.js'
import { cx } from '../../utils/cx.js'
import styles from './PlannerPage.module.css'

const TAG_TONES = { sand: styles.tagSand, mint: styles.tagMint }

function PlannerPage() {
  const navigate = useNavigate()

  return (
    <>
      <Header />

      <header className={styles.topBar}>
        <div className={styles.topInner}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>{plan.title}</h1>
            <p className={styles.subtitle}>{plan.subtitle}</p>
          </div>

          <div className={styles.topActions}>
            <div className={styles.conditions}>
              {plan.conditions.map((condition, index) => (
                <div key={condition.label} className={styles.condition}>
                  {index > 0 && <span className={styles.conditionDivider} aria-hidden="true" />}
                  <Icon {...icons[condition.iconKey]} />
                  <span>{condition.label}</span>
                </div>
              ))}
            </div>

            {/* 조건을 다시 고르려면 큐레이션 목록의 필터로 돌아간다. */}
            <button type="button" className={styles.changeButton} onClick={() => navigate('/plan')}>
              <Icon {...icons.planRefresh} />
              조건 변경
            </button>
          </div>
        </div>
      </header>

      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTitleRow}>
              <h2 className={styles.sectionTitle}>핵심 추천 코스</h2>
              <span className={styles.countBadge}>{plan.summary.countLabel}</span>
            </div>
            <div className={styles.sectionMeta}>
              <span className={styles.metaItem}>
                <Icon {...icons.planWeather} />
                {plan.summary.weather}
              </span>
              <span className={styles.metaDivider} aria-hidden="true">
                |
              </span>
              <span className={styles.metaItem}>
                <Icon {...icons.planWalk} />
                {plan.summary.walk}
              </span>
            </div>
          </div>

          <ol className={styles.steps}>
            {plan.steps.map((step, index) => (
              <li key={step.time} className={styles.step}>
                <span className={cx(styles.stepNumber, step.last && styles.stepNumberLast)}>
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className={styles.stepBody}>
                  <div className={styles.stepHeading}>
                    <span className={styles.stepTime}>{step.time}</span>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    {step.tag && (
                      <span className={cx(styles.tag, TAG_TONES[step.tag.tone])}>
                        {step.tag.label}
                      </span>
                    )}
                  </div>
                  <p className={styles.stepDesc}>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <section className={styles.routeCard} aria-label={plan.route.heading}>
            <div className={styles.routeHead}>
              <span className={styles.routeTitle}>
                <Icon {...icons.planMap} />
                {plan.route.heading}
              </span>
              <span className={styles.routeArea}>{plan.route.areaLabel}</span>
            </div>

            <div className={styles.routeMap}>
              <img src={plan.route.image} alt="" />
              <span className={styles.routeOverlay} aria-hidden="true" />
              <span className={styles.routePath}>{plan.route.pathLabel}</span>
            </div>
          </section>

          <section className={styles.saveBar}>
            <div className={styles.saveText}>
              <Icon {...icons.planBookmark} />
              <p>
                <span className={styles.saveTitle}>{plan.cta.title}</span>
                <span className={styles.saveDesc}>{plan.cta.description}</span>
              </p>
            </div>

            <div className={styles.saveActions}>
              <button type="button" className={styles.saveButton}>
                <Icon {...icons.planSave} />
                일정 저장
              </button>
              <button type="button" className={styles.kakaoButton}>
                <Icon {...icons.planKakao} />
                카카오톡 공유
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default PlannerPage
