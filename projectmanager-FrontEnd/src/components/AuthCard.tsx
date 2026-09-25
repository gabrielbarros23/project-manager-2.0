import type { ReactNode } from 'react'
import { Box } from 'lucide-react'
import styles from './AuthCard.module.css'

type AuthCardProps = {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

/** Moldura compartilhada por Login e Cadastro. */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <section className={styles.page}>
      <div className={`card ${styles.card}`}>
        <div className={styles.brand}>
          <Box size={28} />
          <span>ProjectManager</span>
        </div>

        <div className={styles.heading}>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {children}

        <p className={styles.footer}>{footer}</p>
      </div>
    </section>
  )
}
