import { initials } from '../lib/format'
import styles from './Avatar.module.css'

const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6']

type AvatarProps = {
  name: string
  /** usado para escolher sempre a mesma cor para a mesma pessoa */
  id: number
  size?: number
}

export function Avatar({ name, id, size = 28 }: AvatarProps) {
  return (
    <span
      className={styles.avatar}
      title={name}
      style={{ width: size, height: size, fontSize: size * 0.4, background: colors[id % colors.length] }}
    >
      {initials(name)}
    </span>
  )
}

export function AvatarStack({ users, max = 4 }: { users: { id: number; name: string }[]; max?: number }) {
  const visible = users.slice(0, max)
  const hidden = users.length - visible.length

  return (
    <span className={styles.stack}>
      {visible.map((user) => (
        <Avatar key={user.id} id={user.id} name={user.name} />
      ))}
      {hidden > 0 && <span className={styles.more}>+{hidden}</span>}
    </span>
  )
}
