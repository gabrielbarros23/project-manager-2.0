import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useCurrentUser } from '../../api/auth'
import { useProjects } from '../../api/projects'
import { ProjectCard } from '../../components/ProjectCard'
import { ProjectFormModal } from '../../components/ProjectFormModal'
import { Empty, ErrorMessage, Loading } from '../../components/State'
import { roleLabel } from '../../lib/format'
import { useDebounced } from '../../lib/hooks'
import type { ProjectRole } from '../../lib/types'
import page from '../page.module.css'

const PAGE_SIZE = 9

export function Projects() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<ProjectRole | ''>('')
  const [pageIndex, setPageIndex] = useState(0)
  const [creating, setCreating] = useState(false)
  const debouncedSearch = useDebounced(search)

  const projects = useProjects({
    search: debouncedSearch,
    roleFilter: role || undefined,
    take: PAGE_SIZE,
    skip: pageIndex * PAGE_SIZE,
  })

  // a API não devolve o total; se veio uma página cheia, assumimos que pode haver a próxima
  const hasNext = (projects.data?.length ?? 0) === PAGE_SIZE

  return (
    <>
      <div className={page.header}>
        <div>
          <h1>Projetos</h1>
          <p className="muted">Projetos dos quais você faz parte.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
          <Plus size={16} /> Novo projeto
        </button>
      </div>

      <div className={page.toolbar}>
        <div className={page.search} style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--gray-500)' }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Buscar por nome ou descrição"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPageIndex(0)
            }}
          />
        </div>

        <select
          className={`select ${page.filter}`}
          value={role}
          onChange={(event) => {
            setRole(event.target.value as ProjectRole | '')
            setPageIndex(0)
          }}
          aria-label="Filtrar por cargo"
        >
          <option value="">Todos os cargos</option>
          {(Object.keys(roleLabel) as ProjectRole[]).map((value) => (
            <option key={value} value={value}>
              {roleLabel[value]}
            </option>
          ))}
        </select>
      </div>

      {projects.isPending && <Loading />}
      {projects.error && <ErrorMessage error={projects.error} />}

      {projects.data && projects.data.length === 0 && (
        <Empty title="Nenhum projeto encontrado">Crie um projeto ou ajuste os filtros.</Empty>
      )}

      {projects.data && projects.data.length > 0 && (
        <div className={page.grid}>
          {projects.data.map((project) => (
            <ProjectCard key={project.id} project={project} currentUserId={user.id} />
          ))}
        </div>
      )}

      {(pageIndex > 0 || hasNext) && (
        <div className={page.pagination}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((index) => index - 1)}
          >
            Anterior
          </button>
          <span className="muted">Página {pageIndex + 1}</span>
          <button type="button" className="btn btn-secondary" disabled={!hasNext} onClick={() => setPageIndex((index) => index + 1)}>
            Próxima
          </button>
        </div>
      )}

      {creating && (
        <ProjectFormModal onClose={() => setCreating(false)} onSaved={(projectId) => navigate(`/projects/${projectId}`)} />
      )}
    </>
  )
}
