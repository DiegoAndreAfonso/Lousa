import type { ReactNode } from "react";
import { FileCheck2, Leaf, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/login.css";

export default function AuthDemoLayout({ children }: { children: ReactNode }) {
  return (
    <main className="login-page auth-page">
      <section className="login-story">
        <Link to="/login" className="login-brand" aria-label="Lousa — entrar">
          <span className="brand-icon">
            <FileCheck2 size={24} />
          </span>
          <span>Lousa</span>
        </Link>
        <div className="login-story-content">
          <span className="login-eyebrow">
            <Leaf size={16} /> MAIS ESPAÇO PARA APRENDER
          </span>
          <h1>
            Um espaço para
            <br />o seu ensino.
          </h1>
          <p>
            Organize atividades, acompanhe resultados e encontre os próximos
            passos para cada turma.
          </p>
          <div className="auth-story-note">
            <FileCheck2 size={25} />
            <div>
              <strong>Explore com dados fictícios.</strong>
              <p>
                Você pode experimentar o cadastro e personalizar o perfil desta
                demonstração.
              </p>
            </div>
          </div>
        </div>
        <p className="login-story-footer">
          Da primeira pergunta à próxima descoberta.
        </p>
      </section>
      <section className="login-form-area">
        <div className="login-form auth-form">
          <Link to="/login" className="auth-back">
            <ArrowLeft size={16} /> Voltar para entrar
          </Link>
          <span className="badge green">DEMONSTRAÇÃO INTERATIVA</span>
          {children}
        </div>
      </section>
    </main>
  );
}
