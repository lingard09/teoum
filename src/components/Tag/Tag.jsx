import { cx } from '../../utils/cx.js'
import styles from './Tag.module.css'

// tone: 'mint' | 'sand' | 'peach'
function Tag({ tone = 'sand', icon, className, children }) {
  return (
    <span className={cx(styles.tag, styles[tone], icon && styles.withIcon, className)}>
      {icon}
      {children}
    </span>
  )
}

export default Tag
