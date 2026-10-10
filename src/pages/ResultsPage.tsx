import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  ArrowLeft,
  ArrowUpRight,
  ClipboardCheck,
  Clock3,
  Users,
  FileText,
  MessageSquare,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  LoaderCircle,
  CalendarDays,
  CircleHelp,
} from "lucide-react";
import {
  getAttempt,
  gradeAttempt,
  listApplications,
  listAttempts,
  setResultsReleased,
} from "../services/demoApi";
import type { Application, Attempt } from "../types";
import {
  attemptState,
  errorMessage,
  formatDate,
  formatPoints,
} from "./managementUtils";
import "../styles/management.css";

type Notice = { kind: "success" | "error"; text: string };

export default function ResultsPage() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("attempt") || "";
  const [applications, setApplications] = useState<Application[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<Attempt | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [gradeErrors, setGradeErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [dirty, setDirty] = useState(false);
  const applicationFilter = params.get("application") || "all";

  async function load() {
    setLoading(true);
    setLoadError("");
    try {
      const [nextApplications, nextAttempts] = await Promise.all([
        listApplications(),
        listAttempts(),
      ]);
      setApplications(nextApplications);
      setAttempts(nextAttempts);
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    let cancelled = false;
    setNotice(null);
    setDetailError("");
    setDirty(false);
    setGradeErrors({});
    if (!selectedId) {
      setSelected(null);
      setDetailLoading(false);
      return;
    }
    setDetailLoading(true);
    setSelected(null);
    getAttempt(selectedId)
      .then((attempt) => {
        if (cancelled) return;
        setSelected(attempt);
        setFeedback(attempt.feedback || "");
        setGrades(
          Object.fromEntries(
            Object.entries(attempt.answers)
              .filter(([, answer]) => answer.pointsAwarded !== undefined)
              .map(([id, answer]) => [id, String(answer.pointsAwarded)]),
          ),
        );
      })
      .catch((error: unknown) => {
        if (!cancelled) setDetailError(errorMessage(error));
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const selectedApplication = applications.find(
    (application) => application.id === selected?.applicationId,
  );
  const questions = selectedApplication?.snapshot.questions || [];
  const totalPoints = questions.reduce(
    (sum, question) => sum + question.points,
    0,
  );
  const editable =
    !!selected &&
    (selected.status === "submitted" || selected.status === "expired");
  const pendingCount = attempts.filter(
    (attempt) =>
      ["submitted", "expired"].includes(attempt.status) &&
      attempt.correctionStatus === "pending",
  ).length;
  const correctedCount = attempts.filter(
    (attempt) => attempt.correctionStatus === "graded",
  ).length;
  const filtered = useMemo(
    () =>
      attempts
        .filter((attempt) => {
          const application = applications.find(
            (item) => item.id === attempt.applicationId,
          );
          const text =
            `${attempt.name} ${attempt.email || ""} ${attempt.identifier} ${application?.snapshot.title || ""}`.toLocaleLowerCase(
              "pt-BR",
            );
          const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "pending"
              ? ["submitted", "expired"].includes(attempt.status) &&
                attempt.correctionStatus === "pending"
              : statusFilter === "graded"
                ? attempt.correctionStatus === "graded"
                : attempt.status === statusFilter);
          return (
            text.includes(search.toLocaleLowerCase("pt-BR")) &&
            matchesStatus &&
            (applicationFilter === "all" ||
              attempt.applicationId === applicationFilter)
          );
        })
        .sort(
          (a, b) =>
            new Date(b.endedAt || b.startedAt).getTime() -
            new Date(a.endedAt || a.startedAt).getTime(),
        ),
    [attempts, applications, search, statusFilter, applicationFilter],
  );

  function selectAttempt(id: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (id) next.set("attempt", id);
      else next.delete("attempt");
      return next;
    });
  }

  function updateAttempt(attempt: Attempt) {
    setSelected(attempt);
    setAttempts((previous) =>
      previous.map((item) => (item.id === attempt.id ? attempt : item)),
    );
  }

  async function saveCorrection() {
    if (!selected || !editable || !selectedApplication) return;
    const validation: Record<string, string> = {};
    const numericGrades: Record<string, number> = {};
    for (const question of questions.filter((item) => item.type === "open")) {
      const value =
        grades[question.id] ??
        (!selected.answers[question.id]?.value.trim() ? "0" : "");
      const number = Number(value);
      if (
        value === undefined ||
        !value.trim() ||
        !Number.isFinite(number) ||
        number < 0 ||
        number > question.points
      )
        validation[question.id] =
          `Informe uma nota entre 0 e ${formatPoints(question.points)}.`;
      else numericGrades[question.id] = number;
    }
    setGradeErrors(validation);
    if (Object.keys(validation).length) {
      document.getElementById(`grade-${Object.keys(validation)[0]}`)?.focus();
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const attempt = await gradeAttempt(selected.id, numericGrades, feedback);
      updateAttempt(attempt);
      setFeedback(attempt.feedback);
      setDirty(false);
      setNotice({
        kind: "success",
        text: "Correção salva. Você pode liberar o resultado para o aluno.",
      });
    } catch (error) {
      setNotice({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  async function toggleRelease() {
    if (
      !selected ||
      selected.correctionStatus !== "graded" ||
      !editable ||
      dirty
    )
      return;
    setBusy(true);
    setNotice(null);
    try {
      const attempt = await setResultsReleased(
        selected.id,
        !selected.resultsReleased,
      );
      updateAttempt(attempt);
      setNotice({
        kind: "success",
        text: attempt.resultsReleased
          ? "Resultado liberado. O aluno já pode consultar a nota e o feedback na confirmação da tentativa."
          : "Resultado ocultado para o aluno.",
      });
    } catch (error) {
      setNotice({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  }

  if (selectedId) {
    return (
      <div className="mg-page">
        <button className="mg-back-link" onClick={() => selectAttempt("")}>
          <ArrowLeft size={17} />
          Voltar para resultados
        </button>
        {detailLoading || loading ? (
          <div className="card empty-state" role="status">
            <LoaderCircle className="mg-spin" size={26} />
            <p>Carregando respostas…</p>
          </div>
        ) : detailError || loadError || !selected || !selectedApplication ? (
          <div className="card empty-state">
            <CircleHelp size={30} />
            <h1>Participação indisponível</h1>
            <p>
              {detailError ||
                loadError ||
                "Não encontramos esta participação nos dados de demonstração."}
            </p>
            <button
              className="button secondary"
              onClick={() => selectAttempt("")}
            >
              Ver todas as participações
            </button>
          </div>
        ) : (
          <>
            <div className="page-heading">
              <div>
                <p className="eyebrow">RESPOSTAS DO ALUNO</p>
                <h1>{selected.name}</h1>
                <p className="muted">
                  {selectedApplication.snapshot.title} ·{" "}
                  {selectedApplication.snapshot.subject}
                </p>
              </div>
              <span className={`badge ${attemptState(selected).color}`}>
                {attemptState(selected).text}
              </span>
            </div>
            {notice && (
              <div
                className={`notice ${notice.kind}`}
                role={notice.kind === "error" ? "alert" : "status"}
              >
                {notice.text}
              </div>
            )}
            <div className="card mg-attempt-meta">
              <div>
                <span className="mg-detail-label">
                  Identificador da tentativa
                </span>
                <strong className="mg-mono">{selected.identifier}</strong>
                {selected.email && <small>{selected.email}</small>}
              </div>
              <div>
                <span className="mg-detail-label">Início</span>
                <strong>{formatDate(selected.startedAt)}</strong>
              </div>
              <div>
                <span className="mg-detail-label">
                  {selected.endedAt ? "Finalização" : "Prazo da tentativa"}
                </span>
                <strong>
                  {formatDate(selected.endedAt || selected.deadlineAt)}
                </strong>
                {selected.status === "expired" && (
                  <small>Finalizada por tempo esgotado</small>
                )}
                {selected.status === "abandoned" && (
                  <small>Desistência confirmada</small>
                )}
              </div>
              <div className="mg-score-block">
                <span className="mg-detail-label">Pontuação</span>
                <strong>
                  {selected.score === null ? "—" : formatPoints(selected.score)}{" "}
                  <small>/ {formatPoints(totalPoints)}</small>
                </strong>
              </div>
            </div>
            {!editable && (
              <div className="notice info">
                {selected.status === "in_progress"
                  ? "O aluno ainda está respondendo. A correção ficará disponível depois da entrega ou do encerramento do prazo."
                  : "Esta tentativa foi encerrada por desistência. As respostas salvas podem ser consultadas; não há correção ou liberação de nota."}
              </div>
            )}
            <div className="mg-correction-layout">
              <section
                className="mg-answers-list"
                aria-label="Respostas da avaliação"
              >
                {questions.map((question, index) => {
                  const answer = selected.answers[question.id];
                  const automaticPoints =
                    question.type !== "open"
                      ? (answer?.pointsAwarded ??
                        (answer?.value === question.correctAnswer
                          ? question.points
                          : 0))
                      : null;
                  return (
                    <article className="card mg-answer-card" key={question.id}>
                      <header>
                        <span className="mg-question-number">{index + 1}</span>
                        <div>
                          <span className="mg-detail-label">
                            {question.type === "single"
                              ? "ALTERNATIVA ÚNICA"
                              : question.type === "boolean"
                                ? "VERDADEIRO OU FALSO"
                                : "RESPOSTA ABERTA"}
                          </span>
                          <p>{question.prompt}</p>
                        </div>
                        <span className="mg-question-points">
                          {formatPoints(question.points)}{" "}
                          {question.points === 1 ? "ponto" : "pontos"}
                        </span>
                      </header>
                      {question.type === "open" ? (
                        <>
                          <div
                            className={`mg-written-answer ${!answer?.value.trim() ? "mg-unanswered" : ""}`}
                          >
                            <span className="mg-detail-label">
                              Resposta do aluno
                            </span>
                            <p>
                              {answer?.value.trim()
                                ? answer.value
                                : "Questão não respondida."}
                            </p>
                          </div>
                          {editable && (
                            <div className="mg-grade-row">
                              <label
                                className="field"
                                htmlFor={`grade-${question.id}`}
                              >
                                Nota atribuída
                                <div className="mg-grade-input">
                                  <input
                                    id={`grade-${question.id}`}
                                    type="number"
                                    min="0"
                                    max={question.points}
                                    step="any"
                                    value={
                                      grades[question.id] ??
                                      (!answer?.value.trim() ? "0" : "")
                                    }
                                    disabled={!answer?.value.trim()}
                                    onChange={(event) => {
                                      setGrades((previous) => ({
                                        ...previous,
                                        [question.id]: event.target.value,
                                      }));
                                      setGradeErrors((previous) => ({
                                        ...previous,
                                        [question.id]: "",
                                      }));
                                      setDirty(true);
                                    }}
                                    aria-invalid={!!gradeErrors[question.id]}
                                    aria-describedby={
                                      gradeErrors[question.id]
                                        ? `grade-error-${question.id}`
                                        : undefined
                                    }
                                  />
                                  <span>/ {formatPoints(question.points)}</span>
                                </div>
                                {gradeErrors[question.id] && (
                                  <span
                                    id={`grade-error-${question.id}`}
                                    className="mg-field-error"
                                  >
                                    {gradeErrors[question.id]}
                                  </span>
                                )}
                              </label>
                              <span className="muted">
                                {answer?.value.trim()
                                  ? "Correção manual"
                                  : "Sem resposta · zero ponto"}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="mg-answer-options">
                            {question.options.map((option) => (
                              <div
                                className={`mg-answer-option ${answer?.value === option ? "mg-option-chosen" : ""} ${option === question.correctAnswer ? "mg-option-correct" : ""}`}
                                key={option}
                              >
                                <span className="mg-radio-dot">
                                  {answer?.value === option && <span />}
                                </span>
                                <span>{option}</span>
                                {option === question.correctAnswer && (
                                  <span className="mg-option-label">
                                    <CheckCircle2 size={14} />
                                    Gabarito
                                  </span>
                                )}
                                {answer?.value === option && (
                                  <span className="mg-option-label">
                                    Resposta
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                          {!answer?.value.trim() && (
                            <p className="mg-unanswered-label">
                              Questão não respondida.
                            </p>
                          )}
                          <div className="mg-auto-score">
                            <CheckCircle2 size={15} />
                            <span>Pontuação automática</span>
                            <strong>
                              {formatPoints(automaticPoints || 0)} /{" "}
                              {formatPoints(question.points)}
                            </strong>
                          </div>
                        </>
                      )}
                    </article>
                  );
                })}
              </section>
              <aside className="mg-correction-aside">
                <section className="card mg-feedback-card">
                  <h2>
                    <MessageSquare size={19} />
                    Feedback
                  </h2>
                  <p className="muted">
                    Oriente o aluno com um comentário sobre esta entrega.
                  </p>
                  <label className="field">
                    <span className="mg-sr-only">Feedback para o aluno</span>
                    <textarea
                      rows={7}
                      value={feedback}
                      readOnly={!editable}
                      placeholder={
                        editable
                          ? "O que foi bem? O que pode melhorar?"
                          : "Nenhum feedback registrado."
                      }
                      onChange={(event) => {
                        setFeedback(event.target.value);
                        setDirty(true);
                      }}
                    />
                  </label>
                  {editable && (
                    <button
                      className="button primary mg-full-width"
                      disabled={busy}
                      onClick={() => void saveCorrection()}
                    >
                      {busy ? (
                        <LoaderCircle size={17} className="mg-spin" />
                      ) : (
                        <Save size={17} />
                      )}
                      {busy ? "Salvando…" : "Salvar correção"}
                    </button>
                  )}
                  {dirty && (
                    <p className="mg-field-help">
                      Você tem alterações ainda não salvas.
                    </p>
                  )}
                </section>
                <section className="card mg-release-card">
                  <span
                    className={`mg-release-icon ${selected.resultsReleased ? "mg-released" : ""}`}
                  >
                    {selected.resultsReleased ? (
                      <Eye size={22} />
                    ) : (
                      <EyeOff size={22} />
                    )}
                  </span>
                  <h2>
                    {selected.resultsReleased
                      ? "Resultado liberado"
                      : "Resultado ainda oculto"}
                  </h2>
                  <p className="muted">
                    {selected.resultsReleased
                      ? "O aluno pode consultar a nota e o feedback da tentativa."
                      : "A nota e o feedback ficam disponíveis para o aluno depois da liberação."}
                  </p>
                  {editable && (
                    <button
                      className={`button ${selected.resultsReleased ? "secondary" : "primary"} mg-full-width`}
                      disabled={
                        busy || selected.correctionStatus !== "graded" || dirty
                      }
                      onClick={() => void toggleRelease()}
                    >
                      {selected.resultsReleased ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                      {selected.resultsReleased
                        ? "Ocultar resultado"
                        : "Liberar resultado"}
                    </button>
                  )}
                  {editable && selected.correctionStatus !== "graded" && (
                    <p className="mg-field-help">
                      Salve a correção antes de liberar.
                    </p>
                  )}
                  {editable &&
                    selected.correctionStatus === "graded" &&
                    dirty && (
                      <p className="mg-field-help">
                        Salve as alterações antes de mudar a liberação.
                      </p>
                    )}
                </section>
              </aside>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="mg-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CADA ENTREGA, UM NOVO APRENDIZADO</p>
          <h1>Resultados</h1>
          <p className="muted">
            Acompanhe as participações, corrija respostas e compartilhe o
            feedback.
          </p>
        </div>
      </div>
      {loadError ? (
        <div className="notice error" role="alert">
          {loadError}
          <button
            className="button secondary small"
            onClick={() => void load()}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <div className="mg-summary-row">
            <div className="card mg-summary">
              <span className="mg-summary-icon mg-icon-blue">
                <Users size={19} />
              </span>
              <div>
                <strong>{attempts.length}</strong>
                <span>Participações</span>
              </div>
            </div>
            <div className="card mg-summary">
              <span className="mg-summary-icon mg-icon-amber">
                <Clock3 size={19} />
              </span>
              <div>
                <strong>{pendingCount}</strong>
                <span>Pendentes de correção</span>
              </div>
            </div>
            <div className="card mg-summary">
              <span className="mg-summary-icon">
                <ClipboardCheck size={19} />
              </span>
              <div>
                <strong>{correctedCount}</strong>
                <span>Corrigidas</span>
              </div>
            </div>
          </div>
          <div className="card mg-list-panel">
            <div className="mg-toolbar mg-results-toolbar">
              <label className="mg-search">
                <Search size={18} />
                <input
                  className="search-input"
                  aria-label="Pesquisar participações"
                  placeholder="Buscar aluno, e-mail ou identificador"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <label className="mg-filter">
                <span className="mg-sr-only">Filtrar por aplicação</span>
                <select
                  value={applicationFilter}
                  onChange={(event) =>
                    setParams((previous) => {
                      const next = new URLSearchParams(previous);
                      if (event.target.value === "all")
                        next.delete("application");
                      else next.set("application", event.target.value);
                      return next;
                    })
                  }
                >
                  <option value="all">Todas as aplicações</option>
                  {applications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {application.snapshot.title} · {application.code}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mg-filter">
                <span className="mg-sr-only">Filtrar por situação</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="all">Todas as situações</option>
                  <option value="pending">Aguardando correção</option>
                  <option value="graded">Corrigidas</option>
                  <option value="in_progress">Em andamento</option>
                  <option value="abandoned">Desistências</option>
                  <option value="expired">Tempo esgotado</option>
                </select>
              </label>
            </div>
            {loading ? (
              <div className="empty-state" role="status">
                <LoaderCircle className="mg-spin" size={26} />
                <p>Carregando participações…</p>
              </div>
            ) : !filtered.length ? (
              <div className="empty-state">
                <ClipboardCheck size={32} />
                <h3>
                  {attempts.length
                    ? "Nenhuma participação encontrada"
                    : "As entregas aparecerão aqui"}
                </h3>
                <p>
                  {attempts.length
                    ? "Revise a pesquisa e os filtros selecionados."
                    : "Compartilhe uma aplicação. Cada aluno receberá um identificador próprio de tentativa."}
                </p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table mg-results-table">
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Avaliação</th>
                      <th>Situação</th>
                      <th>Horário</th>
                      <th>Pontuação</th>
                      <th>
                        <span className="mg-sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((attempt) => {
                      const application = applications.find(
                        (item) => item.id === attempt.applicationId,
                      );
                      const state = attemptState(attempt);
                      const total =
                        application?.snapshot.questions.reduce(
                          (sum, question) => sum + question.points,
                          0,
                        ) || 0;
                      return (
                        <tr key={attempt.id}>
                          <td>
                            <div className="mg-student-cell">
                              <span className="mg-avatar-small">
                                {attempt.name
                                  .split(" ")
                                  .filter(Boolean)
                                  .map((name) => name[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </span>
                              <div>
                                <strong>{attempt.name}</strong>
                                <span>
                                  {attempt.email || attempt.identifier}
                                </span>
                                {attempt.email && (
                                  <small>{attempt.identifier}</small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="mg-table-title">
                              {application?.snapshot.title ||
                                "Aplicação indisponível"}
                            </span>
                            <span className="mg-table-secondary">
                              {application?.snapshot.subject || "—"}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${state.color}`}>
                              {state.text}
                            </span>
                            {attempt.status === "expired" && (
                              <span className="mg-table-secondary">
                                Tempo esgotado
                              </span>
                            )}
                            {attempt.resultsReleased && (
                              <span className="mg-table-secondary mg-visible-result">
                                <Eye size={12} />
                                Liberado ao aluno
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="mg-table-date">
                              <CalendarDays size={13} />
                              {formatDate(attempt.endedAt || attempt.startedAt)}
                            </span>
                            <span className="mg-table-secondary">
                              {attempt.endedAt
                                ? "Finalização"
                                : "Início da tentativa"}
                            </span>
                          </td>
                          <td>
                            <strong className="mg-table-score">
                              {attempt.score === null
                                ? "—"
                                : `${formatPoints(attempt.score)} / ${formatPoints(total)}`}
                            </strong>
                          </td>
                          <td>
                            <button
                              className="button ghost small"
                              onClick={() => selectAttempt(attempt.id)}
                              aria-label={`Abrir respostas de ${attempt.name}, tentativa ${attempt.identifier}`}
                            >
                              Abrir <ArrowUpRight size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <p className="mg-footnote">
            <FileText size={14} />
            Cada participação possui um identificador próprio, inclusive quando
            alunos informam nomes iguais.
          </p>
        </>
      )}
    </div>
  );
}
