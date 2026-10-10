import type { Blocker } from "react-router-dom";
import ContentDialog from "./ContentDialog";

export default function UnsavedChangesDialog({
  blocker,
  description = "Há alterações que ainda não foram confirmadas. Você pode continuar editando para salvá-las antes de sair.",
}: {
  blocker: Blocker;
  description?: string;
}) {
  if (blocker.state !== "blocked") return null;
  return (
    <ContentDialog
      labelledBy="unsaved-changes-heading"
      onClose={() => blocker.reset()}
    >
      <h2 id="unsaved-changes-heading">Sair com alterações pendentes?</h2>
      <p className="muted">{description}</p>
      <div className="content-modal-actions">
        <button
          className="button primary"
          autoFocus
          onClick={() => blocker.reset()}
        >
          Continuar editando
        </button>
        <button className="button secondary" onClick={() => blocker.proceed()}>
          Sair da página
        </button>
      </div>
    </ContentDialog>
  );
}
