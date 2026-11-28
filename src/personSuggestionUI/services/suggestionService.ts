import type { PersonChanges } from "../types/suggestionTypes";

export async function submitPersonSuggestion(
  personId: string,
  proposedChanges: PersonChanges,
  reason: string
): Promise<unknown> {
  const response = await fetch("/api/suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personId, proposedChanges, reason }),
  });
if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || "Could not submit suggestion.");
  }

  return response.json().catch(() => ({}));
}
