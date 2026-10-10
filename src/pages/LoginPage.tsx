import { useState } from "react";
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
  const navigate = useNavigate();
  async function login(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Informe um e-mail válido para entrar na demonstração.");
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
              E-mail demonstrativo
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="off"
                aria-invalid={!!error}
                aria-describedby="login-help"
              />
            </label>
            <small id="login-help" className="field-help">
              Use o e-mail preenchido ou outro e-mail fictício válido.
            </small>
            {error && <ErrorNotice message={error} />}
            <button className="button primary login-submit" disabled={busy}>
              {busy ? "Entrando…" : "Entrar na demonstração"}
              <ArrowRight size={18} />
            </button>
          </form>
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
