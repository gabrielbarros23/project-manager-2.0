import { useState, type FormEvent } from 'react'
import { useCreateProject, useUpdateProject } from '../api/projects'
import type { ProjectInput } from '../api/projects'
import { Modal } from './Modal'
import { ErrorMessage } from './State'

type ProjectFormModalProps = {
  /** Sem `project`, o modal cria um novo; com ele, edita. */
  project?: { id: number } & ProjectInput
  onClose: () => void
  onSaved?: (projectId: number) => void
}

export function ProjectFormModal({ project, onClose, onSaved }: ProjectFormModalProps) {
  const [title, setTitle] = useState(project?.title ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const create = useCreateProject()
  const update = useUpdateProject(project?.id ?? 0)
  const mutation = project ? update : create

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const input = { title, description }

    if (project) {
      update.mutate(input, {
        onSuccess: () => {
          onSaved?.(project.id)
          onClose()
        },
      })
    } else {
      create.mutate(input, {
        onSuccess: (created) => {
          onSaved?.(created.id)
          onClose()
        },
      })
    }
  }

  return (
    <Modal
      title={project ? 'Editar projeto' : 'Novo projeto'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="project-form" className="btn btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field">
          <label htmlFor="project-title">Nome</label>
          <input
            id="project-title"
            className="input"
            required
            minLength={3}
            maxLength={50}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="project-description">Descrição</label>
          <textarea
            id="project-description"
            className="textarea"
            required
            minLength={3}
            maxLength={200}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <span className="field-hint">{description.length}/200</span>
        </div>

        {mutation.error && <ErrorMessage error={mutation.error} />}
      </form>
    </Modal>
  )
}
