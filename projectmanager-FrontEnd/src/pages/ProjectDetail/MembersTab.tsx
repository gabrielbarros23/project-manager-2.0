import { useState } from 'react'
import { UserMinus, UserPlus } from 'lucide-react'
import { useAddMember, useChangeRole, useRemoveMember } from '../../api/projects'
import { useUsers } from '../../api/users'
import { Avatar } from '../../components/Avatar'
import { ConfirmModal } from '../../components/ConfirmModal'
import { Modal } from '../../components/Modal'
import { Empty, ErrorMessage, Loading } from '../../components/State'
import { roleBadge, roleLabel } from '../../lib/format'
import type { ProjectDetail, ProjectMember, ProjectRole } from '../../lib/types'
import page from '../page.module.css'
import styles from './MembersTab.module.css'

/** OWNER não pode ser atribuído a outra pessoa (o back-end recusa), então só oferecemos estes. */
const assignableRoles: ProjectRole[] = ['ADMIN', 'MEMBER']

type MembersTabProps = {
  project: ProjectDetail
  currentUserId: number
  myRole: ProjectRole
}

export function MembersTab({ project, currentUserId, myRole }: MembersTabProps) {
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<ProjectMember>()
  const changeRole = useChangeRole(project.id)
  const removeMember = useRemoveMember(project.id)

  const isOwner = myRole === 'OWNER'
  const canManage = isOwner || myRole === 'ADMIN'

  /** Dono remove qualquer um (menos ele mesmo); admin remove apenas membros comuns. */
  const canRemove = (member: ProjectMember) =>
    member.role !== 'OWNER' && (isOwner || (canManage && member.role === 'MEMBER'))

  return (
    <>
      <div className={page.sectionHeader}>
        <h2>Membros ({project.members.length})</h2>
        {canManage && (
          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
            <UserPlus size={16} /> Convidar membro
          </button>
        )}
      </div>

      {changeRole.error && <ErrorMessage error={changeRole.error} />}

      <div className={`card ${styles.list}`}>
        {project.members.map((member) => (
          <div key={member.userId} className={styles.row}>
            <Avatar id={member.user.id} name={member.user.name} size={36} />

            <div className={styles.identity}>
              <strong>
                {member.user.name} {member.userId === currentUserId && <span className="muted">(você)</span>}
              </strong>
              <span className="muted">{member.user.email}</span>
            </div>

            {isOwner && member.role !== 'OWNER' ? (
              <select
                className={`select ${styles.role}`}
                value={member.role}
                disabled={changeRole.isPending}
                onChange={(event) => changeRole.mutate({ memberId: member.userId, role: event.target.value as ProjectRole })}
                aria-label={`Cargo de ${member.user.name}`}
              >
                {assignableRoles.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel[role]}
                  </option>
                ))}
              </select>
            ) : (
              <span className={`badge ${roleBadge[member.role]}`}>{roleLabel[member.role]}</span>
            )}

            <button
              type="button"
              className="btn btn-ghost"
              style={{ visibility: canRemove(member) ? 'visible' : 'hidden' }}
              onClick={() => setRemoving(member)}
              aria-label={`Remover ${member.user.name}`}
              title="Remover do projeto"
            >
              <UserMinus size={16} />
            </button>
          </div>
        ))}
      </div>

      {adding && <AddMemberModal project={project} onClose={() => setAdding(false)} />}

      {removing && (
        <ConfirmModal
          title="Remover membro"
          message={`Remover ${removing.user.name} do projeto? Ele perderá o acesso às tarefas.`}
          confirmLabel="Remover"
          pending={removeMember.isPending}
          error={removeMember.error}
          onClose={() => setRemoving(undefined)}
          onConfirm={() => removeMember.mutate(removing.userId, { onSuccess: () => setRemoving(undefined) })}
        />
      )}
    </>
  )
}

function AddMemberModal({ project, onClose }: { project: ProjectDetail; onClose: () => void }) {
  const users = useUsers()
  const addMember = useAddMember(project.id)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<ProjectRole>('MEMBER')

  const memberIds = new Set(project.members.map((member) => member.userId))
  const query = search.trim().toLowerCase()
  const candidates = (users.data ?? []).filter(
    (user) =>
      !memberIds.has(user.id) && (!query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)),
  )

  return (
    <Modal title="Convidar membro" onClose={onClose}>
      <div className={styles.addControls}>
        <input
          className="input"
          placeholder="Buscar por nome ou email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          autoFocus
        />
        <select className="select" value={role} onChange={(event) => setRole(event.target.value as ProjectRole)} aria-label="Cargo">
          {assignableRoles.map((value) => (
            <option key={value} value={value}>
              {roleLabel[value]}
            </option>
          ))}
        </select>
      </div>

      {addMember.error && <ErrorMessage error={addMember.error} />}
      {users.isPending && <Loading />}
      {users.error && <ErrorMessage error={users.error} />}
      {users.data && candidates.length === 0 && <Empty title="Nenhum usuário disponível" />}

      <ul className={styles.candidates}>
        {candidates.slice(0, 20).map((user) => (
          <li key={user.id}>
            <Avatar id={user.id} name={user.name} size={32} />
            <div className={styles.identity}>
              <strong>{user.name}</strong>
              <span className="muted">{user.email}</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={addMember.isPending}
              onClick={() => addMember.mutate({ memberId: user.id, role })}
            >
              Adicionar
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
