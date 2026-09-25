import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout.tsx'
import { Login } from './pages/Login/Login.tsx'
import { SignUp } from './pages/SignUp/SignUp.tsx'
import { Dashboard } from './pages/Dashboard/Dashboard.tsx'
import { Projects } from './pages/Projects/Projects.tsx'
import { ProjectDetail } from './pages/ProjectDetail/ProjectDetail.tsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
