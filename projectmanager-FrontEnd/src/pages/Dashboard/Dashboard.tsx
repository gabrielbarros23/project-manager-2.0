import { Link } from 'react-router-dom'
import { CheckCircle2, CircleDashed, FolderKanban, Loader } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCurrentUser } from '../../api/auth'
import { useProjects } from '../../api/projects'
import { useEffect } from 'react'
import { useTasks } from '../../api/tasks'
import { ProjectCard } from '../../components/ProjectCard'
import { Empty, ErrorMessage, Loading } from '../../components/State'
import { formatDate, isOverdue, priorityBadge, priorityLabel, statusLabel } from '../../lib/format'
import page from '../page.module.css'
import styles from './Dashboard.module.css'

function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: ReactNode; tone: string }) {
  return (
    <div className={`card ${styles.stat}`}>
      <div>
        <p className="muted">{label}</p>
        <strong className={styles.statValue}>{value}</strong>
      </div>
      <span className={styles.statIcon} style={{ background: `var(--${tone}-soft)`, color: `var(--${tone})` }}>
        {icon}
      </span>
    </div>
  )
}

export function Dashboard() {
  const user = useCurrentUser()
  const projects = useProjects({ take: 100 })
  const myTasks = useTasks({ signedTo: [user.id], take: 100 })

  const allTasks = projects.data?.flatMap((project) => project.tasks) ?? []
  const count = (status: string) => allTasks.filter((task) => task.status === status).length

  const projectNames = new Map(projects.data?.map((project) => [project.id, project.title]))
  const pendingTasks = (myTasks.data ?? [])
    .filter((task) => task.status !== 'DONE')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 6)


  useEffect(() => {
    console.log(user)
  },[user])

  return (
    <>
      <div className={page.header}>
        <div>
          <h1>Olá, {user.name.split(' ')[0]}!</h1>
          <p className="muted">Aqui está um resumo do seu trabalho hoje.</p>
        </div>
        <Link to="/projects" className="btn btn-primary">
          Ver projetos
        </Link>
      </div>

      {projects.error && <ErrorMessage error={projects.error} />}

      <div className={styles.stats}>
        <StatCard label="Projetos" value={projects.data?.length ?? 0} icon={<FolderKanban size={20} />} tone="primary" />
        <StatCard label="A fazer" value={count('TODO')} icon={<CircleDashed size={20} />} tone="warning" />
        <StatCard label="Em andamento" value={count('IN_PROGRESS')} icon={<Loader size={20} />} tone="primary" />
        <StatCard label="Concluídas" value={count('DONE')} icon={<CheckCircle2 size={20} />} tone="success" />
      </div>

      <div className={styles.columns}>
        <section>
          <div className={page.sectionHeader}>
            <h2>Projetos recentes</h2>
            <Link to="/projects">Ver todos</Link>
          </div>

          {projects.isPending && <Loading />}
          {projects.data?.length === 0 && (
            <div className="card">
              <Empty title="Você ainda não tem projetos">
                Crie o primeiro em <Link to="/projects">Projetos</Link>.
              </Empty>
            </div>
          )}
          <div className={styles.projectGrid}>
            {projects.data?.slice(0, 4).map((project) => (
              <ProjectCard key={project.id} project={project} currentUserId={user.id} />
            ))}
          </div>
        </section>

        <section>
          <div className={page.sectionHeader}>
            <h2>Minhas tarefas</h2>
          </div>

          <div className="card">
            {myTasks.isPending && <Loading />}
            {myTasks.error && <ErrorMessage error={myTasks.error} />}
            {myTasks.data && pendingTasks.length === 0 && <Empty title="Nada pendente para você 🎉" />}

            <ul className={styles.taskList}>
              {pendingTasks.map((task) => (
                <li key={task.id}>
                  <Link to={`/projects/${task.projectId}`} className={styles.task}>
                    <div>
                      <strong>{task.title}</strong>
                      <p className="muted">
                        {projectNames.get(task.projectId) ?? 'Projeto'} · {statusLabel[task.status]}
                      </p>
                    </div>
                    <div className={styles.taskMeta}>
                      <span className={`badge ${priorityBadge[task.priority]}`}>{priorityLabel[task.priority]}</span>
                      <span className={isOverdue(task.dueDate, task.status) ? styles.overdue : 'muted'}>
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  )
}
