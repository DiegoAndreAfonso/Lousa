import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Eye,
  FileText,
  Link2,
  Plus,
  Save,
  X,
} from "lucide-react";
import { demoApi, newId } from "../services/demoApi";
import ContentDialog from "../components/ContentDialog";
import QuestionEditor from "../components/QuestionEditor";
import type {
  Assessment,
  Material,
  PublicAssessment,
  Question,
} from "../types";
import "../styles/content.css";

function blankQuestion(): Question {
  return {
    id: newId("question"),
    type: "single",
    prompt: "",
    options: ["", "", "", ""],
    correctAnswer: null,
    points: 1,
  };
}
function blankAssessment(): Assessment {
  const now = new Date().toISOString();
  return {
    id: newId("assessment"),
    title: "",
    subject: "",
    description: "",
    instructions: "",
    questions: [blankQuestion()],
    materialIds: [],
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}
function validate(draft: Assessment): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!draft.title.trim()) errors.title = "Informe um título para a avaliação.";
  if (!draft.subject.trim()) errors.subject = "Informe a disciplina.";
  if (draft.questions.length === 0)
    errors.questions = "Adicione pelo menos uma questão.";
  draft.questions.forEach((question) => {
    if (!question.prompt.trim())
      errors[question.id] = "Escreva o enunciado desta questão.";
    else if (
      !Number.isFinite(question.points) ||
      question.points <= 0 ||
      question.points > 10000
    )
      errors[question.id] = "A pontuação deve ser maior que zero e até 10.000.";
    else if (question.type === "single") {
      if (
        question.options.length < 2 ||
        question.options.some((option) => !option.trim())
      )
        errors[question.id] =
          "Preencha todas as alternativas. São necessárias pelo menos duas.";
      else if (
        new Set(
          question.options.map((option) =>
            option.trim().toLocaleLowerCase("pt-BR"),
          ),
        ).size !== question.options.length
      )
        errors[question.id] = "As alternativas devem ter textos diferentes.";
      else if (
        !question.correctAnswer ||
        !question.options.includes(question.correctAnswer)
      )
        errors[question.id] = "Marque a alternativa correta.";
    } else if (
      question.type === "boolean" &&
      !["Verdadeiro", "Falso"].includes(question.correctAnswer || "")
    )
      errors[question.id] = "Selecione Verdadeiro ou Falso para o gabarito.";
  });
  return errors;
}

function StudentPreview({
  assessment,
  materials,
  onClose,
}: {
  assessment: PublicAssessment;
  materials: Material[];
  onClose: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  return (
    <ContentDialog
      labelledBy="preview-title"
      className="preview-modal"
      onClose={onClose}
    >
      <div className="preview-header">
        <span className="badge green">
          <Eye size={14} /> Visualização do aluno
        </span>
        <button
          autoFocus
          className="icon-button"
          onClick={onClose}
          aria-label="Fechar visualização"
        >
          <X size={21} />
        </button>
      </div>
      <span className="eyebrow">{assessment.subject || "DISCIPLINA"}</span>
      <h2 id="preview-title">{assessment.title || "Avaliação sem título"}</h2>
      <p className="muted">
        {assessment.questions.length} questões ·{" "}
        {assessment.questions
          .reduce((sum, question) => sum + question.points, 0)
          .toLocaleString("pt-BR")}{" "}
        pontos
      </p>
      {assessment.description && <p>{assessment.description}</p>}
      {assessment.instructions && (
        <div className="preview-instructions">
          <h3>Instruções</h3>
          <p>{assessment.instructions}</p>
        </div>
      )}
      {materials.length > 0 && (
        <div className="preview-instructions">
          <h3>Materiais de apoio</h3>
          {materials.map((material) => (
            <p key={material.id}>
              {material.type === "link" ? (
                <Link2 size={15} />
              ) : (
                <FileText size={15} />
              )}{" "}
              {material.title}
            </p>
          ))}
        </div>
      )}
      <div className="preview-questions">
        {assessment.questions.map((question, index) => (
          <fieldset key={question.id}>
            <legend>
              <span className="question-number">{index + 1}</span>
              <strong>{question.prompt || "Enunciado da questão"}</strong>
              <span className="muted">
                {question.points} {question.points === 1 ? "ponto" : "pontos"}
              </span>
            </legend>
            {question.type === "open" ? (
              <label className="field">
                <span>Sua resposta</span>
                <textarea
                  rows={4}
                  placeholder="Escreva sua resposta..."
                  value={answers[question.id] || ""}
                  onChange={(event) =>
                    setAnswers({
                      ...answers,
                      [question.id]: event.target.value,
                    })
                  }
                />
              </label>
            ) : (
              (question.type === "boolean"
                ? ["Verdadeiro", "Falso"]
                : question.options
              ).map((option, optionIndex) => (
                <label className="preview-option" key={optionIndex}>
                  <input
                    type="radio"
                    name={`preview-${question.id}`}
                    checked={answers[question.id] === String(optionIndex)}
                    onChange={() =>
                      setAnswers({
                        ...answers,
                        [question.id]: String(optionIndex),
                      })
                    }
                  />
                  <span>{option || `Alternativa ${optionIndex + 1}`}</span>
                </label>
              ))
            )}
          </fieldset>
        ))}
      </div>
      <p className="notice info">
        Esta é uma prévia. As respostas preenchidas aqui não são salvas como
        participação.
      </p>
      <button className="button primary" onClick={onClose}>
        Voltar ao editor
      </button>
    </ContentDialog>
  );
}

export default function AssessmentEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const justCreated = Boolean(
    (location.state as { saved?: boolean } | null)?.saved,
  );
  const editing = Boolean(id && id !== "nova");
  const [draft, setDraft] = useState<Assessment>(blankAssessment);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setLoadError("");
    setNotice(null);
    setErrors({});
    Promise.all([demoApi.listAssessments(), demoApi.listMaterials()])
      .then(([all, available]) => {
        if (!alive) return;
        setMaterials(available);
        if (editing) {
          const assessment = all.find((item) => item.id === id);
          if (!assessment) setLoadError("Esta avaliação não foi encontrada.");
          else {
            setDraft(structuredClone(assessment));
            if (justCreated)
              setNotice({
                type: "success",
                text: "Avaliação criada e salva neste navegador. Ela já pode ser usada em uma aplicação.",
              });
          }
        } else setDraft(blankAssessment());
      })
      .catch(() => {
        if (alive)
          setLoadError(
            "Não foi possível carregar o editor. Tente recarregar a página.",
          );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id, editing, justCreated]);
  function patch(value: Partial<Assessment>) {
    setDraft((current) => ({ ...current, ...value }));
    setNotice(null);
  }
  function updateQuestion(question: Question) {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((item) =>
        item.id === question.id ? question : item,
      ),
    }));
    setNotice(null);
    setErrors((current) => ({ ...current, [question.id]: "" }));
  }
  function moveQuestion(index: number, direction: -1 | 1) {
    const questions = [...draft.questions];
    [questions[index], questions[index + direction]] = [
      questions[index + direction],
      questions[index],
    ];
    patch({ questions });
  }
  async function save() {
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    setNotice(null);
    if (Object.keys(nextErrors).length) {
      setNotice({
        type: "error",
        text: "Confira os campos destacados antes de salvar a avaliação.",
      });
      return;
    }
    setSaving(true);
    const next: Assessment = {
      ...draft,
      title: draft.title.trim(),
      subject: draft.subject.trim(),
      description: draft.description.trim(),
      instructions: draft.instructions.trim(),
      updatedAt: new Date().toISOString(),
      questions: draft.questions.map((question) => ({
        ...question,
        prompt: question.prompt.trim(),
        options: question.options.map((option) => option.trim()),
        correctAnswer:
          question.type === "open"
            ? null
            : question.correctAnswer?.trim() || null,
      })),
    };
    try {
      const saved = await demoApi.saveAssessment(next);
      setDraft(saved);
      if (!editing)
        navigate(`/avaliacoes/${saved.id}`, {
          replace: true,
          state: { saved: true },
        });
      else
        setNotice({
          type: "success",
          text: "Avaliação salva neste navegador. As aplicações já publicadas preservam sua versão original.",
        });
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar. Seus campos continuam no editor; tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  }
  const totalPoints = draft.questions.reduce(
    (sum, question) =>
      sum + (Number.isFinite(question.points) ? question.points : 0),
    0,
  );
  const publicPreview: PublicAssessment = {
    id: draft.id,
    title: draft.title,
    subject: draft.subject,
    description: draft.description,
    instructions: draft.instructions,
    materialIds: draft.materialIds,
    questions: draft.questions.map((question) => ({
      id: question.id,
      type: question.type,
      prompt: question.prompt,
      options: [...question.options],
      points: question.points,
    })),
  };
  if (loading)
    return (
      <div className="card empty-state" role="status">
        Carregando o editor de avaliação...
      </div>
    );
  if (loadError)
    return (
      <div className="card empty-state">
        <FileText size={34} />
        <h1>Avaliação indisponível</h1>
        <p className="field-error" role="alert">
          {loadError}
        </p>
        <Link className="button primary" to="/avaliacoes">
          Voltar às avaliações
        </Link>
      </div>
    );
  return (
    <div className="content-page">
      <Link to="/avaliacoes" className="content-back">
        <ArrowLeft size={16} /> Avaliações
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">BANCO DE AVALIAÇÕES</span>
          <h1>{editing ? "Editar avaliação" : "Nova avaliação"}</h1>
          <p className="muted">
            Prepare as questões e os materiais para a sua turma.
          </p>
        </div>
        <div className="content-heading-actions">
          <button className="button secondary" onClick={() => setPreview(true)}>
            <Eye size={17} /> Visualizar como aluno
          </button>
          <button
            className="button primary"
            disabled={saving}
            onClick={() => void save()}
          >
            <Save size={17} />
            {saving ? "Salvando..." : "Salvar avaliação"}
          </button>
        </div>
      </div>
      {draft.archived && (
        <div className="notice info">
          Esta avaliação está arquivada. Para usar uma nova versão, faça uma
          cópia na lista de avaliações.
        </div>
      )}
      {notice && (
        <div
          className={`notice ${notice.type}`}
          role={notice.type === "error" ? "alert" : "status"}
        >
          {notice.text}
        </div>
      )}
      <div className="assessment-editor-layout">
        <div className="assessment-editor-main">
          <section className="card editor-details">
            <div className="content-section-title">
              <span className="section-icon">
                <BookOpen size={20} />
              </span>
              <div>
                <h2>Informações da avaliação</h2>
                <p className="muted">Uma boa organização começa por aqui.</p>
              </div>
            </div>
            <div className="form-grid">
              <label className="field">
                <span>
                  Título <span className="required">*</span>
                </span>
                <input
                  maxLength={160}
                  placeholder="Ex.: Ecossistemas e biodiversidade"
                  value={draft.title}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={errors.title ? "title-error" : undefined}
                  onChange={(event) => patch({ title: event.target.value })}
                />
                {errors.title && (
                  <small className="field-error" id="title-error">
                    {errors.title}
                  </small>
                )}
              </label>
              <label className="field">
                <span>
                  Disciplina <span className="required">*</span>
                </span>
                <input
                  maxLength={80}
                  placeholder="Ex.: Ciências"
                  value={draft.subject}
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={
                    errors.subject ? "subject-error" : undefined
                  }
                  onChange={(event) => patch({ subject: event.target.value })}
                />
                {errors.subject && (
                  <small className="field-error" id="subject-error">
                    {errors.subject}
                  </small>
                )}
              </label>
            </div>
            <label className="field">
              <span>Descrição</span>
              <textarea
                maxLength={2000}
                rows={2}
                placeholder="Conte brevemente o que será trabalhado."
                value={draft.description}
                onChange={(event) => patch({ description: event.target.value })}
              />
            </label>
            <label className="field">
              <span>Instruções para o aluno</span>
              <textarea
                maxLength={6000}
                rows={3}
                placeholder="Oriente o aluno sobre como responder à avaliação."
                value={draft.instructions}
                onChange={(event) =>
                  patch({ instructions: event.target.value })
                }
              />
            </label>
          </section>
          <div className="questions-heading">
            <div>
              <h2>
                Questões{" "}
                <span className="badge gray">{draft.questions.length}</span>
              </h2>
              <p className="muted">
                Defina o enunciado, a pontuação e o gabarito.
              </p>
            </div>
            <button
              className="button secondary small"
              disabled={draft.questions.length >= 100}
              onClick={() =>
                patch({ questions: [...draft.questions, blankQuestion()] })
              }
            >
              <Plus size={16} /> Adicionar questão
            </button>
          </div>
          {errors.questions && (
            <p className="field-error" role="alert">
              {errors.questions}
            </p>
          )}
          {draft.questions.length === 0 && (
            <div className="card empty-state">
              <h3>Adicione sua primeira questão</h3>
              <p className="muted">
                Escolha entre alternativa única, verdadeiro ou falso e resposta
                aberta.
              </p>
            </div>
          )}
          {draft.questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              index={index}
              total={draft.questions.length}
              error={errors[question.id]}
              onChange={updateQuestion}
              onMove={(direction) => moveQuestion(index, direction)}
              onRemove={() => setRemoveTarget(question.id)}
            />
          ))}
          <button
            className="add-question-area"
            disabled={draft.questions.length >= 100}
            onClick={() =>
              patch({ questions: [...draft.questions, blankQuestion()] })
            }
          >
            <Plus size={20} /> Adicionar uma questão
          </button>
        </div>
        <aside className="editor-sidebar">
          <section className="card editor-summary">
            <h2>Resumo da avaliação</h2>
            <dl>
              <div>
                <dt>Questões</dt>
                <dd>{draft.questions.length}</dd>
              </div>
              <div>
                <dt>Pontuação total</dt>
                <dd>{totalPoints.toLocaleString("pt-BR")}</dd>
              </div>
              <div>
                <dt>Correção manual</dt>
                <dd>
                  {
                    draft.questions.filter(
                      (question) => question.type === "open",
                    ).length
                  }
                </dd>
              </div>
            </dl>
            <div className="editor-tip">
              <Check size={18} />
              <p>
                Ao publicar uma aplicação, uma cópia desta avaliação será
                preservada.
              </p>
            </div>
            <Link className="button secondary" to="/aplicacoes">
              Ir para aplicações
            </Link>
          </section>
          <section className="card editor-materials">
            <div className="content-section-title">
              <FileText size={19} />
              <h2>Materiais de apoio</h2>
            </div>
            <p className="muted">Selecione o que o aluno poderá consultar.</p>
            {materials.length === 0 ? (
              <p className="muted">Você ainda não cadastrou materiais.</p>
            ) : (
              materials.map((material) => (
                <label className="material-checkbox" key={material.id}>
                  <input
                    type="checkbox"
                    checked={draft.materialIds.includes(material.id)}
                    onChange={(event) =>
                      patch({
                        materialIds: event.target.checked
                          ? [...draft.materialIds, material.id]
                          : draft.materialIds.filter(
                              (value) => value !== material.id,
                            ),
                      })
                    }
                  />
                  <span>
                    <strong>{material.title}</strong>
                    <small>
                      {material.type === "file"
                        ? "Arquivo · salvo neste navegador"
                        : "Link"}{" "}
                      · {material.subject}
                    </small>
                  </span>
                </label>
              ))
            )}
            <Link to="/materiais" className="button ghost small">
              <Plus size={15} /> Gerenciar materiais
            </Link>
          </section>
          <p className="editor-local-note muted">
            Demonstração: as alterações são salvas neste navegador.
          </p>
        </aside>
      </div>
      {preview && (
        <StudentPreview
          assessment={publicPreview}
          materials={materials.filter((material) =>
            draft.materialIds.includes(material.id),
          )}
          onClose={() => setPreview(false)}
        />
      )}
      {removeTarget && (
        <ContentDialog
          labelledBy="remove-question-title"
          onClose={() => setRemoveTarget(null)}
        >
          <h2 id="remove-question-title">Remover questão?</h2>
          <p className="muted">
            A questão será removida desta avaliação. As aplicações publicadas
            serão preservadas.
          </p>
          <div className="content-modal-actions">
            <button
              autoFocus
              className="button secondary"
              onClick={() => setRemoveTarget(null)}
            >
              Cancelar
            </button>
            <button
              className="button danger"
              onClick={() => {
                patch({
                  questions: draft.questions.filter(
                    (question) => question.id !== removeTarget,
                  ),
                });
                setRemoveTarget(null);
              }}
            >
              Remover questão
            </button>
          </div>
        </ContentDialog>
      )}
    </div>
  );
}
