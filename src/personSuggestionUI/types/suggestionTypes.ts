export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  pronouns?: string;
  birthDate?: string;
  deathDate?: string;
  isLiving: boolean;
  notes?: string;
}
export type PersonChanges = Partial<Omit<Person, "id">>;
export interface PersonSuggestion {
  id: string;
  treeId: string;
  personId: string;
  proposedChanges: PersonChanges;
  reason: string;
  status: "pending" | "approved" | "denied";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}
