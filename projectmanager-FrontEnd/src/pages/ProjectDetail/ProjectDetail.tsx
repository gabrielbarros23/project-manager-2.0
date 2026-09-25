import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCurrentUser } from '../../api/auth'
import { useProject } from '../../api/projects'
import { ErrorMessage, Loading } from '../../components/State'
import { roleBadge, roleLabel } from '../../lib/format'
import { Board } from './Board'
import { MembersTab } from './MembersTab'
import { SettingsTab } from './SettingsTab'
import styles from './ProjectDetail.module.css'

const tabs = [
  { id: 'board', label: 'Tarefas' },
  { id: 'members', label: 'Membros' },
  { id: 'settings', label: 'Configurações' },
] as const

type TabId = (typeof tabs)[number]['id']

export function ProjectDetail() {
  const { projectId } = useParams()
  const id = Number(projectId)
  const user = useCurrentUser()
  const project = useProject(id)
  const [searchParams, setSearchParams] = useSearchParams()

  const requestedTab = searchParams.get('tab')
  const tab: TabId = tabs.some((item) => item.id === requestedTab) ? (requestedTab as TabId) : 'board'

  if (project.isPending) return <Loading />

  if (project.error || !project.data) {
    return (
      <>
        <ErrorMessage error={project.error ?? new Error('Projeto não encontrado.')} />
        <p style={{ marginTop: 16 }}>
          <Link to="/projects">Voltar para os projetos</Link>
        </p>
      </>
    )
  }

  const data = project.data
  const myRole = data.members.find((member) => member.userId === user.id)?.role ?? 'MEMBER'
  const canManage = myRole === 'OWNER' || myRole === 'ADMIN'

  return (
    <>
      <Link to="/projects" className={styles.back}>
        <ArrowLeft size={16} /> Projetos
      </Link>

      <div className={styles.header}>
        <div>
          <h1>{data.title}</h1>
          <p className="muted">{data.description}</p>
        </div>
        <span className={`badge ${roleBadge[myRole]}`}>Seu cargo: {roleLabel[myRole]}</span>
      </div>

      <div className={styles.tabs} role="tablist">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? styles.tabActive : undefined}
            onClick={() => setSearchParams(item.id === 'board' ? {} : { tab: item.id }, { replace: true })}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'board' && <Board project={data} currentUserId={user.id} canManage={canManage} />}
      {tab === 'members' && <MembersTab project={data} currentUserId={user.id} myRole={myRole} />}
      {tab === 'settings' && <SettingsTab project={data} myRole={myRole} />}
    </>
  )
}
