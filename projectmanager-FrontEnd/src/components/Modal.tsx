import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import styles from './Modal.module.css'

type ModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ title, onClose, children, footer }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
    >
      <div className={styles.header}>
        <h2>{title}</h2>
        <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Fechar">
          <X size={18} />
        </button>
      </div>
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </dialog>
  )
}
