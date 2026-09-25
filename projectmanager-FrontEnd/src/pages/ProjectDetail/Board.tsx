import { useState } from 'react'
import { Calendar, Plus } from 'lucide-react'
import { useUpdateTask } from '../../api/tasks'
import { AvatarStack } from '../../components/Avatar'
import { TaskFormModal } from '../../components/TaskFormModal'
import { formatDate, isOverdue, priorityBadge, priorityLabel, statusLabel } from '../../lib/format'
import type { ProjectDetail, Task, TaskStatus } from '../../lib/types'
import styles from './Board.module.css'

const columns: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE']

type BoardProps = {
  project: ProjectDetail
  currentUserId: number
  canManage: boolean
}

export function Board({ project, currentUserId, canManage }: BoardProps) {
  const [search, setSearch] = useState('')
  const [onlyMine, setOnlyMine] = useState(false)
  const [creating, setCreating] = useState(false)
  const [openTaskId, setOpenTaskId] = useState<number>()

  const query = search.trim().toLowerCase()
  const visible = project.tasks.filter(
    (task) =>
      (!query || task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)) &&
      (!onlyMine || task.signedTo.some((member) => member.userId === currentUserId)),
  )
  // o modal lê a tarefa do cache do projeto para refletir as atualizações sem reabrir
  const openTask = project.tasks.find((task) => task.id === openTaskId)

  return (
    <>
      <div className={styles.toolbar}>
        <input
          className={`input ${styles.search}`}
          placeholder="Buscar tarefas"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <label className={styles.toggle}>
          <input type="checkbox" checked={onlyMine} onChange={(event) => setOnlyMine(event.target.checked)} />
          Somente minhas
        </label>
        {canManage && (
          <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
            <Plus size={16} /> Nova tarefa
          </button>
        )}
      </div>

      <div className={styles.board}>
        {columns.map((status) => {
          const tasks = visible.filter((task) => task.status === status)

          return (
            <section key={status} className={styles.column}>
              <header className={styles.columnHeader}>
                <h3>{statusLabel[status]}</h3>
                <span className="badge badge-gray">{tasks.length}</span>
              </header>

              <div className={styles.cards}>
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    project={project}
                    canManage={canManage}
                    onOpen={() => setOpenTaskId(task.id)}
                  />
                ))}
                {tasks.length === 0 && <p className={`muted ${styles.empty}`}>Nenhuma tarefa</p>}
              </div>
            </section>
          )
        })}
      </div>

      {creating && <TaskFormModal projectId={project.id} members={project.members} onClose={() => setCreating(false)} />}

      {openTask && (
        <TaskFormModal
          key={openTask.id}
          projectId={project.id}
          members={project.members}
          task={openTask}
          readOnly={!canManage}
          onClose={() => setOpenTaskId(undefined)}
        />
      )}
    </>
  )
}

type TaskCardProps = {
  task: Task
  project: ProjectDetail
  canManage: boolean
  onOpen: () => void
}

function TaskCard({ task, project, canManage, onOpen }: TaskCardProps) {
  const update = useUpdateTask(task)
  const assignees = project.members
    .filter((member) => task.signedTo.some((signed) => signed.userId === member.userId))
    .map((member) => member.user)

  return (
    <article className={`card ${styles.card}`}>
      <button type="button" className={styles.cardBody} onClick={onOpen}>
        <strong>{task.title}</strong>
        <span className={`muted ${styles.description}`}>{task.description}</span>
      </button>

      <div className={styles.meta}>
        <span className={`badge ${priorityBadge[task.priority]}`}>{priorityLabel[task.priority]}</span>
        <span className={`${styles.due} ${isOverdue(task.dueDate, task.status) ? styles.overdue : ''}`}>
          <Calendar size={13} />
          {formatDate(task.dueDate)}
        </span>
      </div>

      <div className={styles.footer}>
        <AvatarStack users={assignees} />
        {canManage && (
          <select
            className={`select ${styles.status}`}
            value={task.status}
            disabled={update.isPending}
            onChange={(event) => update.mutate({ status: event.target.value as TaskStatus })}
            aria-label={`Status de ${task.title}`}
          >
            {columns.map((value) => (
              <option key={value} value={value}>
                {statusLabel[value]}
              </option>
            ))}
          </select>
        )}
      </div>

      {update.error && <p className={styles.error}>{update.error.message}</p>}
    </article>
  )
}
