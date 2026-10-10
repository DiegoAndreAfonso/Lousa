import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  BookOpen,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  FlaskConical,
  LoaderCircle,
  LockKeyhole,
  Monitor,
  CalendarDays,
  Pencil,
} from "lucide-react";
import { getTeacher, updateTeacher } from "../services/demoApi";
import type { Teacher } from "../types";
import { errorMessage } from "./managementUtils";
import { useUnsavedChanges } from "../services/useUnsavedChanges";
import UnsavedChangesDialog from "../components/UnsavedChangesDialog";
import {
  focusProfileError,
  profileFields,
  validateProfile,
  type ProfileErrors,
  type ProfileInput,
} from "./profileForm";
import "../styles/management.css";

export default function AccountPage() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileInput>({
    name: "",
    email: "",
    subject: "",
    institution: "",
  });
  const [fieldErrors, setFieldErrors] = useState<ProfileErrors>({});
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const dirty =
    editing &&
    !!teacher &&
    profileFields.some((field) => draft[field.name] !== teacher[field.name]);
  const blocker = useUnsavedChanges(dirty);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setTeacher(await getTeacher());
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    if (editing) document.getElementById("profile-name")?.focus();
  }, [editing]);

  function editProfile() {
    if (!teacher) return;
    setDraft({
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject,
      institution: teacher.institution,
    });
    setFieldErrors({});
    setSaveError("");
    setSuccess("");
    setEditing(true);
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const next = validateProfile(draft);
    setFieldErrors(next);
    setSaveError("");
    if (Object.keys(next).length) {
      focusProfileError(event.currentTarget, next);
      return;
    }
    setSaving(true);
    try {
      const updated = await updateTeacher(draft);
      setTeacher(updated);
      window.dispatchEvent(
        new CustomEvent("lousa:teacher-updated", { detail: updated }),
      );
      setEditing(false);
      setSuccess("Perfil demonstrativo salvo neste navegador.");
    } catch (cause) {
      setSaveError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mg-page mg-account-page">
      <UnsavedChangesDialog
        blocker={blocker}
        description="As alterações do perfil ainda não foram salvas. Volte à edição para salvar ou saia e mantenha o perfil anterior."
      />
      <div className="page-heading">
        <div>
          <p className="eyebrow">SEU ESPAÇO DE ENSINO</p>
          <h1>Conta</h1>
          <p className="muted">
            Seu perfil e os detalhes do ambiente de demonstração.
          </p>
        </div>
      </div>
      {loading ? (
        <div className="card empty-state" role="status">
          <LoaderCircle size={26} className="mg-spin" />
          <p>Carregando sua conta…</p>
        </div>
      ) : error ? (
        <div className="notice error" role="alert">
          {error}
          <button
            className="button secondary small"
            onClick={() => void load()}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        teacher && (
          <div className="mg-account-grid">
            <section className="card mg-profile-card">
              <div className="mg-card-heading">
                <h2>Perfil do professor</h2>
                <span className="badge gray">Dados fictícios</span>
              </div>
              {success && (
                <p className="notice success" role="status">
                  {success}
                </p>
              )}
              {editing ? (
                <form
                  className="mg-profile-edit"
                  onSubmit={saveProfile}
                  noValidate
                >
                  <p id="profile-demo-help" className="muted">
                    Personalize o perfil com dados fictícios. As mudanças ficam
                    neste navegador.
                  </p>
                  {profileFields.map((field) => (
                    <label
                      className="field"
                      key={field.name}
                      htmlFor={`profile-${field.name}`}
                    >
                      <span id={`profile-${field.name}-label`}>
                        {field.label}
                      </span>
                      <input
                        id={`profile-${field.name}`}
                        name={field.name}
                        type={field.name === "email" ? "email" : "text"}
                        required
                        maxLength={field.maxLength}
                        value={draft[field.name]}
                        disabled={saving}
                        autoComplete="off"
                        aria-labelledby={`profile-${field.name}-label`}
                        aria-invalid={!!fieldErrors[field.name]}
                        aria-describedby={
                          fieldErrors[field.name]
                            ? `profile-${field.name}-error`
                            : "profile-demo-help"
                        }
                        onChange={(event) => {
                          setDraft((current) => ({
                            ...current,
                            [field.name]: event.target.value,
                          }));
                          setFieldErrors((current) => ({
                            ...current,
                            [field.name]: undefined,
                          }));
                        }}
                      />
                      {fieldErrors[field.name] && (
                        <small
                          id={`profile-${field.name}-error`}
                          className="field-error"
                        >
                          {fieldErrors[field.name]}
                        </small>
                      )}
                    </label>
                  ))}
                  {saveError && (
                    <p className="notice error" role="alert">
                      {saveError}
                    </p>
                  )}
                  <div className="mg-profile-actions">
                    <button className="button primary" disabled={saving}>
                      {saving ? "Salvando…" : "Salvar perfil"}
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      disabled={saving}
                      onClick={() => {
                        setEditing(false);
                        setSaveError("");
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="mg-profile-identity">
                    <span className="mg-avatar-large">
                      {teacher.name
                        .split(" ")
                        .filter(Boolean)
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>
                    <h3>{teacher.name}</h3>
                    <p className="muted">Professor · {teacher.subject}</p>
                  </div>
                  <dl className="mg-profile-fields">
                    <div>
                      <dt>
                        <UserRound size={17} />
                        Nome completo
                      </dt>
                      <dd>{teacher.name}</dd>
                    </div>
                    <div>
                      <dt>
                        <Mail size={17} />
                        E-mail
                      </dt>
                      <dd>{teacher.email}</dd>
                    </div>
                    <div>
                      <dt>
                        <BookOpen size={17} />
                        Disciplina
                      </dt>
                      <dd>{teacher.subject}</dd>
                    </div>
                    <div>
                      <dt>
                        <Building2 size={17} />
                        Instituição
                      </dt>
                      <dd>{teacher.institution}</dd>
                    </div>
                  </dl>
                  <p className="mg-profile-note">
                    <FlaskConical size={15} />
                    Este perfil faz parte dos dados de exemplo da plataforma.
                  </p>
                  <button
                    className="button secondary mg-profile-edit-button"
                    onClick={editProfile}
                  >
                    <Pencil size={16} /> Editar perfil
                  </button>
                </>
              )}
            </section>
            <div className="mg-account-right">
              <section className="card mg-subscription-card">
                <div className="mg-card-heading">
                  <h2>Assinatura</h2>
                  <span className="badge green">Demonstrativa</span>
                </div>
                <div className="mg-subscription-header">
                  <span className="mg-subscription-icon">
                    <Leaf size={26} />
                  </span>
                  <div>
                    <h3>Espaço do professor</h3>
                    <p className="muted">
                      Recursos disponíveis para explorar a plataforma.
                    </p>
                  </div>
                </div>
                <ul className="mg-feature-list">
                  <li>
                    <CheckCircle2 size={17} />
                    Criação e organização de avaliações
                  </li>
                  <li>
                    <CheckCircle2 size={17} />
                    Compartilhamento de materiais e aplicações
                  </li>
                  <li>
                    <CheckCircle2 size={17} />
                    Correção de respostas e feedback individual
                  </li>
                  <li>
                    <CheckCircle2 size={17} />
                    Controle de acesso por nome ou e-mail
                  </li>
                </ul>
                <div className="mg-subscription-info">
                  <CalendarDays size={18} />
                  <p>
                    <strong>Sem cobranças nesta demonstração</strong>
                    <span>
                      O estado da assinatura é fictício. Contratação e gestão de
                      pagamentos serão integradas em uma etapa futura.
                    </span>
                  </p>
                </div>
              </section>
              <section className="card mg-demo-info-card">
                <h2>
                  <ShieldCheck size={20} />
                  Sobre este ambiente
                </h2>
                <p>
                  Os dados são salvos neste navegador. Você pode percorrer os
                  fluxos do professor e do aluno com serviços simulados.
                </p>
                <div className="mg-demo-info-item">
                  <LockKeyhole size={17} />
                  <span>
                    A identificação, as permissões e os prazos serão validados
                    pelo backend na versão de produção.
                  </span>
                </div>
                <div className="mg-demo-info-item">
                  <Monitor size={17} />
                  <span>
                    A integração com o aplicativo é uma simulação. Windows 11 e
                    Linux Mint são os sistemas previstos para uma etapa futura.
                  </span>
                </div>
              </section>
            </div>
          </div>
        )
      )}
    </div>
  );
}
