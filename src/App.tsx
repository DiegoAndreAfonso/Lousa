import { Component, type ReactNode } from "react";
import { Link, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ArrowLeft, FileQuestion } from "lucide-react";
import TeacherLayout from "./components/TeacherLayout";
import PublicLayout from "./components/PublicLayout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import AssessmentsPage from "./pages/AssessmentsPage";
import AssessmentEditorPage from "./pages/AssessmentEditorPage";
import MaterialsPage from "./pages/MaterialsPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ResultsPage from "./pages/ResultsPage";
import AccountPage from "./pages/AccountPage";
import ParticipatePage from "./pages/ParticipatePage";
import StudentPage from "./pages/StudentPage";

function DemoTeacherAccess() {
  let loggedIn = false;
  try {
    loggedIn = localStorage.getItem("ao.teacher.session") === "demo";
  } catch {
    /* Login apresentará o problema de armazenamento. */
  }
  return loggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}
class AppBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <PublicLayout>
        <div className="card student-unavailable">
          <FileQuestion size={32} />
          <h1>Precisamos tentar novamente.</h1>
          <p>
            Não foi possível carregar esta página. Seus dados já salvos
            permanecem neste navegador.
          </p>
          <button
            className="button primary"
            onClick={() => window.location.reload()}
          >
            Recarregar página
          </button>
        </div>
      </PublicLayout>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  return (
    <AppBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/participar" element={<ParticipatePage />} />
        <Route path="/p/:codigo" element={<StudentPage />} />
        <Route element={<DemoTeacherAccess />}>
          <Route element={<TeacherLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="avaliacoes" element={<AssessmentsPage />} />
            <Route path="avaliacoes/nova" element={<AssessmentEditorPage />} />
            <Route path="avaliacoes/:id" element={<AssessmentEditorPage />} />
            <Route path="materiais" element={<MaterialsPage />} />
            <Route path="aplicacoes" element={<ApplicationsPage />} />
            <Route path="resultados" element={<ResultsPage />} />
            <Route path="conta" element={<AccountPage />} />
          </Route>
        </Route>
        <Route
          path="*"
          element={
            <PublicLayout>
              <div className="card student-unavailable">
                <FileQuestion size={32} />
                <h1>Esta página não foi encontrada.</h1>
                <p>
                  Confira o endereço ou acesse uma atividade com seu código.
                </p>
                <Link className="button primary" to="/participar">
                  <ArrowLeft size={16} /> Acessar uma atividade
                </Link>
              </div>
            </PublicLayout>
          }
        />
      </Routes>
    </AppBoundary>
  );
}
