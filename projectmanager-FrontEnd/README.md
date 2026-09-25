# ProjectManager — Front-end

Interface em React para a [API do ProjectManager](../projectmanager-BackEnd) (NestJS + Prisma + PostgreSQL).

## Stack

React 19, TypeScript, Vite, React Router, TanStack Query e CSS Modules.

## Funcionalidades

- Cadastro, login e logout (JWT em cookie httpOnly)
- Dashboard com resumo dos projetos e das tarefas atribuídas ao usuário
- Projetos: criar, buscar, filtrar por cargo, editar e excluir
- Quadro de tarefas (A fazer / Em andamento / Concluída): criar, editar, mudar status, atribuir responsáveis e excluir
- Membros: convidar, alterar cargo (ADMIN/MEMBER) e remover
- Permissões refletidas na interface: só OWNER/ADMIN alteram tarefas e membros; só o OWNER altera cargos e exclui o projeto

## Como rodar

Suba o back-end (`docker compose up` em `projectmanager-BackEnd`, API na porta 3333) e depois:

```bash
npm install
npm run dev
```

Acesse http://localhost:5173. Em desenvolvimento o Vite encaminha `/api/*` para o back-end, então o cookie de sessão trafega no mesmo origin e não é preciso CORS. Para apontar para outra porta, copie `.env.example` para `.env` e ajuste `API_PROXY_TARGET`.

## Hospedagem

O front chama sempre `/api/...`. Em produção sirva o build (`npm run build`) e configure um proxy reverso que encaminhe `/api` para a API removendo o prefixo (nginx, ou `rewrites` na Vercel/Netlify). Manter tudo no mesmo domínio evita problemas com o cookie `sameSite: 'lax'`.

## Estrutura

```
src/
  api/          chamadas à API + hooks do React Query (auth, projects, tasks, users)
  components/   componentes reutilizáveis (layout, modais, avatar, cards)
  lib/          tipos, formatadores e hooks utilitários
  pages/        Login, SignUp, Dashboard, Projects, ProjectDetail
  index.css     design tokens (cores, tipografia) e classes base (botões, inputs, badges)
```
