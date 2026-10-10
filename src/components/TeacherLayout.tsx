import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  FileCheck2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Send,
  Settings2,
  X,
} from "lucide-react";
import { demoApi } from "../services/demoApi";
import { initials } from "../services/format";
import type { Teacher } from "../types";

const menu = [
  { to: "/", label: "Visão geral", icon: LayoutDashboard },
  { to: "/avaliacoes", label: "Avaliações", icon: FileText },
  { to: "/materiais", label: "Materiais", icon: BookOpen },
  { to: "/aplicacoes", label: "Aplicações", icon: Send },
  { to: "/resultados", label: "Resultados", icon: FileCheck2 },
  { to: "/conta", label: "Conta", icon: Settings2 },
];
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="Lousa — início">
      <span className="brand-icon">
        <FileCheck2 size={23} strokeWidth={1.7} />
      </span>
      {!compact && <span>Lousa</span>}
    </Link>
  );
}
export default function TeacherLayout() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    demoApi
      .getTeacher()
      .then(setTeacher)
      .catch(() => {});
  }, []);
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  const active = menu.find((item) =>
    item.to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(item.to),
  );
  function logout() {
    localStorage.removeItem("ao.teacher.session");
    navigate("/login", { replace: true });
  }
  return (
    <div className="workspace">
      <a href="#main-content" className="skip-link">
        Ir para o conteúdo
      </a>
      {menuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Fechar navegação"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={`sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <Brand />
          <button
            className="icon-button mobile-close"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace-label">ESPAÇO DO PROFESSOR</div>
        <nav aria-label="Menu principal">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <item.icon size={20} strokeWidth={1.7} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon">
              <GraduationCap size={21} />
            </span>
            <strong>Aprender começa aqui.</strong>
            <p>Uma boa avaliação abre espaço para novas descobertas.</p>
            <Link to="/aplicacoes">
              Criar uma aplicação <ArrowUpRight size={15} />
            </Link>
          </div>
          <Link to="/participar" className="student-access">
            Acesso do aluno <ArrowUpRight size={16} />
          </Link>
          <div className="sidebar-version">
            <span className="status-dot" /> Ambiente de demonstração
          </div>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb">
              Seu espaço<span>/</span>
              <strong>{active?.label ?? "Avaliações"}</strong>
            </span>
          </div>
          <div className="topbar-right">
            <span className="demo-label">
              <span className="status-dot" />
              Demonstração
            </span>
            <Link to="/conta" className="profile-link">
              <span className="avatar">
                {initials(teacher?.name ?? "Marina Costa")}
              </span>
              <span className="profile-text">
                <strong>{teacher?.name ?? "Professor"}</strong>
                <small>Conta do professor</small>
              </span>
              <ChevronDown size={15} />
            </Link>
            <button
              className="icon-button logout-button"
              aria-label="Sair da demonstração"
              title="Sair"
              onClick={logout}
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <main id="main-content" className="main-content">
          <Outlet />
        </main>
        <footer className="workspace-footer">
          Lousa{" "}
          <span>Feito para ensinar, aprender e acompanhar.</span>
          <span>Dados fictícios · armazenamento neste navegador</span>
        </footer>
      </div>
    </div>
  );
}
