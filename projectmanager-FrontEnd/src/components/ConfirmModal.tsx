import { Modal } from './Modal'
import { ErrorMessage } from './State'

type ConfirmModalProps = {
  title: string
  message: string
  confirmLabel?: string
  pending?: boolean
  error?: unknown
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({ title, message, confirmLabel = 'Excluir', pending, error, onConfirm, onClose }: ConfirmModalProps) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={pending}>
            {pending ? 'Aguarde...' : confirmLabel}
          </button>
        </>
      }
    >
      <p>{message}</p>
      {error ? <ErrorMessage error={error} /> : null}
    </Modal>
  )
}
