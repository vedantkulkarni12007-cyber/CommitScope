import React from 'react'
import styles from './SectionHeader.module.css'
import { SketchUnderline } from './SketchDecorations'

export default function SectionHeader({
  title,
  id,
  count,
  description,
  underlineColor = 'var(--accent-red)',
  className = '',
  action = null,
}) {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.row}>
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
        {count !== undefined && <span className={styles.countTag}>{count}</span>}
        {action && <div style={{ marginLeft: 'auto' }}>{action}</div>}
      </div>

      <div className={styles.underlineWrapper}>
        <SketchUnderline color={underlineColor} width={Math.max(90, title.length * 9)} />
      </div>

      {description && <p className={styles.description}>{description}</p>}
    </div>
  )
}
