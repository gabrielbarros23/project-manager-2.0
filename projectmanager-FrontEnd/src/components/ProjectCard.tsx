import { Link } from 'react-router-dom'
import { CheckCircle2, Users } from 'lucide-react'
import { roleBadge, roleLabel } from '../lib/format'
import type { ProjectSummary } from '../lib/types'
import { AvatarStack } from './Avatar'
import styles from './ProjectCard.module.css'

export function ProjectCard({ project, currentUserId }: { project: ProjectSummary; currentUserId: number }) {
  const done = project.tasks.filter((task) => task.status === 'DONE').length
  const total = project.tasks.length
  const progress = total === 0 ? 0 : Math.round((done / total) * 100)
  const myRole = project.members.find((member) => member.userId === currentUserId)?.role

  return (
    <Link to={`/projects/${project.id}`} className={`card ${styles.card}`}>
      <div className={styles.top}>
        <h3>{project.title}</h3>
        {myRole && <span className={`badge ${roleBadge[myRole]}`}>{roleLabel[myRole]}</span>}
      </div>

      <p className={`muted ${styles.description}`}>{project.description}</p>

      <div className={styles.progress}>
        <div className={styles.progressMeta}>
          <span className={styles.metaItem}>
            <CheckCircle2 size={14} />
            {done}/{total} tarefas
          </span>
          <span>{progress}%</span>
        </div>
        <div className={styles.bar}>
          <div className={styles.barFill} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={styles.bottom}>
        <AvatarStack users={project.members.map((member) => member.user)} />
        <span className={`muted ${styles.metaItem}`}>
          <Users size={14} />
          {project.members.length}
        </span>
      </div>
    </Link>
  )
}
