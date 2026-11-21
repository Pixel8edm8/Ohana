export type RelationKind =
  | 'Parent' | 'Child' | 'Sibling' | 'Spouse / partner'
  | 'Grandparent' | 'Grandchild' | 'Aunt / uncle' | 'Niece / nephew'
  | 'Cousin' | 'Guardian' | 'Ward / dependent'

export type RelationType =
  | 'Biological' | 'Adoptive' | 'Step' | 'Foster'
  | 'Legal guardian' | 'Chosen family' | 'In-law'

export type Member = {
  id: string
  firstName: string
  lastName: string
  preferredName: string
  pronouns: string
  birthDate: string
  deathDate: string
  isLiving: boolean
  notes: string
  createdAt: string
}

export type Relationship = {
  id: string
  fromId: string
  toId: string
  kind: RelationKind
  type: RelationType
  notes: string
}