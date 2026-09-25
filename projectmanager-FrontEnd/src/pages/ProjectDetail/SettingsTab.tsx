import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDeleteProject } from '../../api/projects'
import { ConfirmModal } from '../../components/ConfirmModal'
import { ProjectFormModal } from '../../components/ProjectFormModal'
import type { ProjectDetail, ProjectRole } from '../../lib/types'
import styles from './SettingsTab.module.css'

export function SettingsTab({ project, myRole }: { project: ProjectDetail; myRole: ProjectRole }) {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const remove = useDeleteProject(project.id)

  const isOwner = myRole === 'OWNER'
  const canEdit = isOwner || myRole === 'ADMIN'

  return (
    <div className={styles.sections}>
      <section className={`card ${styles.section}`}>
        <div>
          <h3>Informações do projeto</h3>
          <p className="muted">Nome e descrição exibidos para todos os membros.</p>
        </div>
        <button type="button" className="btn btn-secondary" disabled={!canEdit} onClick={() => setEditing(true)}>
          Editar
        </button>
      </section>

      <section className={`card ${styles.section} ${styles.danger}`}>
        <div>
          <h3>Excluir projeto</h3>
          <p className="muted">Remove o projeto, suas tarefas e os vínculos dos membros. Só o dono pode fazer isso.</p>
        </div>
        <button type="button" className="btn btn-danger" disabled={!isOwner} onClick={() => setDeleting(true)}>
          Excluir
        </button>
      </section>

      {editing && <ProjectFormModal project={project} onClose={() => setEditing(false)} />}

      {deleting && (
        <ConfirmModal
          title="Excluir projeto"
          message={`Tem certeza que deseja excluir "${project.title}"? Todas as tarefas serão apagadas e isso não pode ser desfeito.`}
          pending={remove.isPending}
          error={remove.error}
          onClose={() => setDeleting(false)}
          onConfirm={() => remove.mutate(undefined, { onSuccess: () => navigate('/projects', { replace: true }) })}
        />
      )}
    </div>
  )
}
