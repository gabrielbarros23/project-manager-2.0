import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import styles from './State.module.css'

export function Loading({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className={styles.state} role="status">
      <Loader2 className={styles.spin} size={20} />
      <span>{label}</span>
    </div>
  )
}

export function ErrorMessage({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'Algo deu errado.'
  return <div className="form-error">{message}</div>
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className={styles.state}>
      <strong>{title}</strong>
      {children && <span className="muted">{children}</span>}
    </div>
  )
}
