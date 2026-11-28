
import { useState } from "react";
import type { FormEvent } from "react";
import type { Person, PersonChanges } from "../types/suggestionTypes";
import { submitPersonSuggestion } from "../services/suggestionService";

interface Props {
  person: Person | null;
  onClose: () => void;
}

interface SuggestionFormProps {
  person: Person;
  onClose: () => void;
}

type toEdit =
  | "firstName"
  | "lastName"
  | "preferredName"
  | "pronouns"
  | "birthDate"
  | "deathDate"
  | "isLiving"
  | "notes";

export default function PersonSuggestionFeature({ person, onClose }: Props) {
  const [showForm, setShowForm] = useState(false);

  if (!person) return null;

  function close() {
    setShowForm(false);
    onClose();
  }

  if (!showForm) {
    return (
      <div className="suggestion-backdrop" onMouseDown={close}>
        <section className="suggestion-dialog" role="dialog" aria-modal="true"
          aria-labelledby="suggestion-question" onMouseDown={(event) => event.stopPropagation()}>
          <h2 id="suggestion-question">Would you like to suggest changes?</h2>
          <p>
            You selected {person.firstName} {person.lastName}. You can suggest
            corrections to this person's information for the tree administrator
            to review.
          </p>
          <div className="suggestion-actions">
            <button type="button" className="suggestion-secondary" onClick={close}>No</button>
            <button type="button" onClick={() => setShowForm(true)}>Yes, continue</button>
          </div>
        </section>
      </div>
    );
  }

  return <SuggestionForm person={person} onClose={close} />;
}

function SuggestionForm({ person, onClose }: SuggestionFormProps) {
  const [form, setForm] = useState({
    firstName: person.firstName ?? "",
    lastName: person.lastName ?? "",
    preferredName: person.preferredName ?? "",
    pronouns: person.pronouns ?? "",
    birthDate: person.birthDate ?? "",
    deathDate: person.deathDate ?? "",
    isLiving: person.isLiving,
    notes: person.notes ?? "",
  });
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function updateField(field: toEdit, value: string | boolean) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const changes: PersonChanges = {};
    (Object.keys(form) as toEdit[]).forEach((key) => {
      const original = person[key] ?? (typeof form[key] === "boolean" ? false : "");
      if (form[key] !== original) Object.assign(changes, { [key]: form[key] });
    });

    if (Object.keys(changes).length === 0) {
      setMessage("No changes have been made.");
      return;
    }

    try {
      setLoading(true);
      await submitPersonSuggestion(person.id, changes, reason.trim());
      setSubmitted(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit suggestion.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="suggestion-backdrop" onMouseDown={onClose}>
        <section className="suggestion-dialog" role="dialog" aria-modal="true"
          onMouseDown={(event) => event.stopPropagation()}>
          <h2>Suggestion submitted</h2>
          <p>Your suggestion has been sent to the tree administrator for review.</p>
          <div className="suggestion-actions">
            <button type="button" onClick={onClose}>Close</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="suggestion-backdrop" onMouseDown={onClose}>
      <section className="suggestion-dialog suggestion-form-dialog" role="dialog"
        aria-modal="true" aria-labelledby="suggestion-form-title"
        onMouseDown={(event) => event.stopPropagation()}>
        <button className="suggestion-close" type="button" onClick={onClose}
          aria-label="Close">×</button>
        <h2 id="suggestion-form-title">Suggest changes</h2>
        <p>
          Suggest edits to {person.firstName} {person.lastName}'s information.
          Admin approval required.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="suggestion-grid">
            <label>First name
              <input value={form.firstName} required
                onChange={(e) => updateField("firstName", e.target.value)} />
            </label>
            <label>Last name
              <input value={form.lastName} required
                onChange={(e) => updateField("lastName", e.target.value)} />
            </label>
            <label>Preferred name
              <input value={form.preferredName}
                onChange={(e) => updateField("preferredName", e.target.value)} />
            </label>
            <label>Pronouns
              <input value={form.pronouns}
                onChange={(e) => updateField("pronouns", e.target.value)} />
            </label>
            <label>Birth date
              <input type="date" value={form.birthDate}
                onChange={(e) => updateField("birthDate", e.target.value)} />
            </label>
            <label>Death date
              <input type="date" value={form.deathDate}
                onChange={(e) => updateField("deathDate", e.target.value)} />
            </label>
            <label className="suggestion-living">
              <input type="checkbox" checked={form.isLiving}
                onChange={(e) => updateField("isLiving", e.target.checked)} />
              Living
            </label>
            <label className="suggestion-wide">Additional information
              <textarea rows={3} value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)} />
            </label>
            <label className="suggestion-wide">Reason for suggestion (optional)
              <textarea rows={2} value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reasons for suggestion" />
            </label>
          </div>

          <p className="suggestion-notice">
            Your suggestion will be updated after admin approval.
          </p>
          {message && <p className="suggestion-error" role="alert">{message}</p>}
          <div className="suggestion-actions">
            <button type="button" className="suggestion-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit suggestion"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
