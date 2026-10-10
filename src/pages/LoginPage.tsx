import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  FileCheck2,
  GraduationCap,
  Leaf,
} from "lucide-react";
import { demoApi } from "../services/demoApi";
import { messageOf } from "../services/format";
import { ErrorNotice } from "../components/Feedback";
import "../styles/login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("marina@exemplo.com");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const emailInput = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    try {
      localStorage.removeItem("ao.teacher.session");
    } catch {
      setError(
        "O navegador não permite acessar os dados locais. Verifique as permissões para entrar na demonstração.",
      );
    }
  }, []);
  async function login(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Informe um e-mail válido para entrar na demonstração.");
      emailInput.current?.focus();
      return;
    }
    setBusy(true);
    try {
      await demoApi.login(email.trim());
      localStorage.setItem("ao.teacher.session", "demo");
      navigate("/");
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-brand">
          <span className="brand-icon">
            <FileCheck2 size={24} />
          </span>
          <span>Lousa</span>
        </div>
        <div className="login-story-content">
          <span className="login-eyebrow">
            <Leaf size={16} /> MAIS ESPAÇO PARA APRENDER
          </span>
          <h1>
            Seu ensino.
            <br />
            Novas possibilidades.
          </h1>
          <p>
            Prepare atividades, acompanhe descobertas e transforme respostas em
            próximos passos.
          </p>
          <div className="login-illustration" aria-hidden="true">
            <div className="illustration-orbit" />
            <div className="illustration-paper">
              <span className="paper-icon">
                <BookOpen size={31} />
              </span>
              <div className="paper-line long" />
              <div className="paper-line" />
              <div className="paper-answer">
                <span>
                  <Check size={14} />
                </span>
                <div className="paper-line" />
              </div>
              <div className="paper-answer">
                <span />
                <div className="paper-line" />
              </div>
              <div className="paper-answer">
                <span />
                <div className="paper-line" />
              </div>
            </div>
            <span className="illustration-bubble">
              <GraduationCap size={28} />
            </span>
            <div className="illustration-note">
              <Check size={16} /> Aprendizagem em movimento
            </div>
          </div>
        </div>
        <p className="login-story-footer">
          Da primeira pergunta à próxima descoberta.
        </p>
      </section>
      <section className="login-form-area">
        <div className="login-form">
          <span className="badge green">DEMONSTRAÇÃO INTERATIVA</span>
          <h2>Bem-vindo ao seu espaço.</h2>
          <p className="muted">
            Explore o painel do professor com atividades, materiais e resultados
            de exemplo.
          </p>
          <form onSubmit={login} noValidate>
            <label className="field">
              <span id="login-email-label">E-mail demonstrativo</span>
              <input
                ref={emailInput}
                type="email"
                required
                maxLength={254}
                disabled={busy}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                autoComplete="off"
                aria-labelledby="login-email-label"
                aria-invalid={!!error}
                aria-describedby={`login-help${error ? " login-error" : ""}`}
              />
            </label>
            <small id="login-help" className="field-help">
              Use o e-mail preenchido ou outro e-mail fictício válido.
            </small>
            {error && (
              <div id="login-error">
                <ErrorNotice message={error} />
              </div>
            )}
            <button className="button primary login-submit" disabled={busy}>
              {busy ? "Entrando…" : "Entrar na demonstração"}
              <ArrowRight size={18} />
            </button>
          </form>
          <div className="login-account-links">
            <Link to="/cadastro">Criar perfil demonstrativo</Link>
            <Link to="/recuperar-acesso">Recuperar acesso</Link>
          </div>
          <div className="login-demo-info">
            <FileCheck2 size={20} />
            <p>
              Este é um ambiente de teste. O acesso é simulado e os dados ficam
              neste navegador.
            </p>
          </div>
          <div className="login-student">
            <span>Vai responder uma atividade?</span>
            <Link to="/participar">
              Acessar como aluno <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
