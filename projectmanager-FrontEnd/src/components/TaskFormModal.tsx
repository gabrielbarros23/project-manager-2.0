import { useState, type FormEvent } from 'react'
import { useCreateTask, useDeleteTask, useUpdateTask } from '../api/tasks'
import { priorityLabel, statusLabel, toDateInput } from '../lib/format'
import type { ProjectMember, Task, TaskPriority, TaskStatus } from '../lib/types'
import { Avatar } from './Avatar'
import { ConfirmModal } from './ConfirmModal'
import { Modal } from './Modal'
import { ErrorMessage } from './State'
import styles from './TaskFormModal.module.css'

type TaskFormModalProps = {
  projectId: number
  members: ProjectMember[]
  /** Sem `task`, cria uma nova; com ela, edita. */
  task?: Task
  /** Membros comuns só visualizam: o back-end só deixa OWNER/ADMIN alterar tarefas. */
  readOnly?: boolean
  onClose: () => void
}

/** `useUpdateTask` precisa de uma tarefa; na criação passamos um placeholder que nunca é usado. */
const emptyTask: Task = {
  id: 0,
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: new Date().toISOString(),
  projectId: 0,
  signedTo: [],
  createdAt: '',
  updatedAt: '',
}

export function TaskFormModal({ projectId, members, task, readOnly = false, onClose }: TaskFormModalProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'MEDIUM')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'TODO')
  const [dueDate, setDueDate] = useState(toDateInput(task?.dueDate ?? new Date().toISOString()))
  const [assignees, setAssignees] = useState<number[]>(task?.signedTo.map((member) => member.userId) ?? [])
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const create = useCreateTask(projectId)
  const update = useUpdateTask(task ?? emptyTask)
  const remove = useDeleteTask()
  const mutation = task ? update : create

  function toggleAssignee(userId: number) {
    setAssignees((current) => (current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const data = { title, description, priority, status, dueDate }

    if (task) {
      update.mutate({ ...data, signedTo: assignees }, { onSuccess: onClose })
    } else {
      create.mutate({ ...data, signedTo: assignees }, { onSuccess: onClose })
    }
  }

  return (
    <>
      <Modal
        title={task ? (readOnly ? 'Detalhes da tarefa' : 'Editar tarefa') : 'Nova tarefa'}
        onClose={onClose}
        footer={
          <>
            {task && !readOnly && (
              <button type="button" className={`btn btn-ghost ${styles.delete}`} onClick={() => setConfirmingDelete(true)}>
                Excluir
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {readOnly ? 'Fechar' : 'Cancelar'}
            </button>
            {!readOnly && (
              <button type="submit" form="task-form" className="btn btn-primary" disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            )}
          </>
        }
      >
        <form id="task-form" onSubmit={handleSubmit} className={styles.form}>
          <fieldset disabled={readOnly} className={styles.fieldset}>
            <div className="field">
              <label htmlFor="task-title">Título</label>
              <input
                id="task-title"
                className="input"
                required
                minLength={3}
                maxLength={50}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="task-description">Descrição</label>
              <textarea
                id="task-description"
                className="textarea"
                required
                minLength={3}
                maxLength={200}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className={styles.row}>
              <div className="field">
                <label htmlFor="task-priority">Prioridade</label>
                <select
                  id="task-priority"
                  className="select"
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as TaskPriority)}
                >
                  {(Object.keys(priorityLabel) as TaskPriority[]).map((value) => (
                    <option key={value} value={value}>
                      {priorityLabel[value]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="task-status">Status</label>
                <select
                  id="task-status"
                  className="select"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as TaskStatus)}
                >
                  {(Object.keys(statusLabel) as TaskStatus[]).map((value) => (
                    <option key={value} value={value}>
                      {statusLabel[value]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="task-due">Vencimento</label>
                <input
                  id="task-due"
                  className="input"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <span className="label">Responsáveis</span>
              <div className={styles.assignees}>
                {members.map((member) => (
                  <label key={member.userId} className={styles.assignee}>
                    <input
                      type="checkbox"
                      checked={assignees.includes(member.userId)}
                      onChange={() => toggleAssignee(member.userId)}
                    />
                    <Avatar id={member.user.id} name={member.user.name} size={24} />
                    {member.user.name}
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          {mutation.error && <ErrorMessage error={mutation.error} />}
        </form>
      </Modal>

      {confirmingDelete && task && (
        <ConfirmModal
          title="Excluir tarefa"
          message={`Tem certeza que deseja excluir "${task.title}"? Essa ação não pode ser desfeita.`}
          pending={remove.isPending}
          error={remove.error}
          onClose={() => setConfirmingDelete(false)}
          onConfirm={() => remove.mutate(task.id, { onSuccess: onClose })}
        />
      )}
    </>
  )
}
