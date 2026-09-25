import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useLogin, useMe } from '../../api/auth'
import { AuthCard } from '../../components/AuthCard'
import { ErrorMessage } from '../../components/State'

export function Login() {
  const { data: user } = useMe()
  const login = useLogin()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const destination = (location.state as { from?: string } | null)?.from ?? '/'

  if (user) return <Navigate to={destination} replace />

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    login.mutate({ email, password }, { onSuccess: () => navigate(destination, { replace: true }) })
  }


  return (
    <AuthCard
      title="Bem-vindo de volta!"
      subtitle="Faça login para continuar"
      footer={
        <>
          Não tem uma conta? <Link to="/signup">Cadastre-se</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            className="input"
            type="password"
            placeholder="Digite sua senha"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {login.error && <ErrorMessage error={login.error} />}

        <button type="submit" className="btn btn-primary btn-block" disabled={login.isPending}>
          {login.isPending ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </AuthCard>
  )
}
