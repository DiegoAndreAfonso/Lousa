import {
  Component,
  Suspense,
  lazy,
  useLayoutEffect,
  type ReactNode,
} from "react";
import {
  Link,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  useLocation,
} from "react-router-dom";
import { ArrowLeft, FileQuestion } from "lucide-react";
import TeacherLayout from "./components/TeacherLayout";
import PublicLayout from "./components/PublicLayout";
import { Loading } from "./components/Feedback";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const RecoverAccessPage = lazy(() => import("./pages/RecoverAccessPage"));
const AssessmentsPage = lazy(() => import("./pages/AssessmentsPage"));
const AssessmentEditorPage = lazy(() => import("./pages/AssessmentEditorPage"));
const MaterialsPage = lazy(() => import("./pages/MaterialsPage"));
const ApplicationsPage = lazy(() => import("./pages/ApplicationsPage"));
const ResultsPage = lazy(() => import("./pages/ResultsPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const ParticipatePage = lazy(() => import("./pages/ParticipatePage"));
const StudentPage = lazy(() => import("./pages/StudentPage"));

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
function page(element: ReactNode) {
  return (
    <Suspense fallback={<Loading label="Carregando página…" />}>
      {element}
    </Suspense>
  );
}

function RootLayout() {
  const location = useLocation();
  useLayoutEffect(() => {
    if (location.pathname !== "/login") return;
    try {
      localStorage.removeItem("ao.teacher.session");
    } catch {
      /* A tela de entrada informa problemas no armazenamento. */
    }
  }, [location.pathname]);
  return (
    <AppBoundary>
      <Outlet />
    </AppBoundary>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route path="/login" element={page(<LoginPage />)} />
      <Route path="/cadastro" element={page(<SignupPage />)} />
      <Route path="/recuperar-acesso" element={page(<RecoverAccessPage />)} />
      <Route path="/participar" element={page(<ParticipatePage />)} />
      <Route path="/p/:codigo" element={page(<StudentPage />)} />
      <Route element={<DemoTeacherAccess />}>
        <Route element={<TeacherLayout />}>
          <Route index element={page(<DashboardPage />)} />
          <Route path="avaliacoes" element={page(<AssessmentsPage />)} />
          <Route
            path="avaliacoes/nova"
            element={page(<AssessmentEditorPage />)}
          />
          <Route
            path="avaliacoes/:id"
            element={page(<AssessmentEditorPage />)}
          />
          <Route path="materiais" element={page(<MaterialsPage />)} />
          <Route path="aplicacoes" element={page(<ApplicationsPage />)} />
          <Route path="resultados" element={page(<ResultsPage />)} />
          <Route path="conta" element={page(<AccountPage />)} />
        </Route>
      </Route>
      <Route
        path="*"
        element={
          <PublicLayout>
            <div className="card student-unavailable">
              <FileQuestion size={32} />
              <h1>Esta página não foi encontrada.</h1>
              <p>Confira o endereço ou acesse uma atividade com seu código.</p>
              <Link className="button primary" to="/participar">
                <ArrowLeft size={16} /> Acessar uma atividade
              </Link>
            </div>
          </PublicLayout>
        }
      />
    </Route>,
  ),
);

export default function App() {
  return <RouterProvider router={router} />;
}
