import { cx } from '../../utils/cx.js'
import styles from './Button.module.css'

// variant: 'light' | 'cream' | 'dark' | 'green', size: 'md' | 'lg'
function Button({ variant = 'light', size = 'md', className, children, ...rest }) {
  return (
    <button
      type="button"
      className={cx(styles.button, styles[variant], size === 'lg' && styles.lg, className)}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
