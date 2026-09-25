import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Box, LogOut } from 'lucide-react'
import { useLogout, useMe } from '../api/auth'
import { Avatar } from './Avatar'
import { Loading } from './State'
import styles from './AppLayout.module.css'

/** Casca das rotas autenticadas: barra superior + conteúdo. Sem sessão, manda para /login. */
export function AppLayout() {
  const { data: user, isPending } = useMe()
  const logout = useLogout()
  const location = useLocation()

  if (isPending) return <Loading />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link to="/" className={styles.brand}>
            <Box size={22} />
            ProjectManager
          </Link>

          <nav className={styles.nav}>
            <NavLink to="/" end className={({ isActive }) => (isActive ? styles.active : undefined)}>
              Dashboard
            </NavLink>
            <NavLink to="/projects" className={({ isActive }) => (isActive ? styles.active : undefined)}>
              Projetos
            </NavLink>
          </nav>

          <div className={styles.user}>
            <Avatar id={user.id} name={user.name} size={30} />
            <span className={styles.userName}>{user.name}</span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              aria-label="Sair"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
