import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useMe, useSignUp } from '../../api/auth'
import { AuthCard } from '../../components/AuthCard'
import { ErrorMessage } from '../../components/State'

export function SignUp() {
  const { data: user } = useMe()
  const signUp = useSignUp()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const mismatch = confirmation !== '' && password !== confirmation

  if (user) return <Navigate to="/" replace />

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (mismatch) return
    signUp.mutate({ name, email, password }, { onSuccess: () => navigate('/', { replace: true }) })
  }

  return (
    <AuthCard
      title="Crie sua conta"
      subtitle="Comece agora a organizar seus projetos"
      footer={
        <>
          Já tem uma conta? <Link to="/login">Faça login</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field">
          <label htmlFor="name">Nome completo</label>
          <input
            id="name"
            className="input"
            placeholder="Seu nome"
            autoComplete="name"
            required
            minLength={3}
            maxLength={50}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            className="input"
            type="password"
            placeholder="Crie uma senha"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <span className="field-hint">Mínimo de 8 caracteres, com maiúscula, minúscula, número e símbolo.</span>
        </div>

        <div className="field">
          <label htmlFor="confirmation">Confirme sua senha</label>
          <input
            id="confirmation"
            className="input"
            type="password"
            placeholder="Repita a senha"
            autoComplete="new-password"
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
          {mismatch && <span className="field-hint" style={{ color: 'var(--error)' }}>As senhas não coincidem.</span>}
        </div>

        {signUp.error && <ErrorMessage error={signUp.error} />}

        <button type="submit" className="btn btn-primary btn-block" disabled={signUp.isPending || mismatch}>
          {signUp.isPending ? 'Criando conta...' : 'Cadastrar'}
        </button>
      </form>
    </AuthCard>
  )
}
