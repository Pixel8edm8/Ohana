import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  ArrowRight, BookOpen, Check, ChevronDown,
  GitBranch, Link2, Plus, Search, Trash2,
  Users, UserRound, X,
} from 'lucide-react'
import XMLBuilder from 'fast-xml-builder'
import { sendToBackend } from '../api.ts'
import { FamilyTreeView } from './FamilyTreeView'
import type { Member, Relationship, RelationKind, RelationType } from '../types/family'

type RelationshipDraft = {
  id: string
  personId: string
  kind: RelationKind | ''
  type: RelationType
}

const MEMBER_KEY = 'ohana-family-members-v1'
const RELATION_KEY = 'ohana-family-relationships-v1'

const xmlBuilder = new XMLBuilder({
  format: true,
  ignoreAttributes: false,
})

function buildXmlPayload(data: Record<string, unknown>): string {
  return xmlBuilder.build({
    '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
    ...data,
  })
}

const relationKinds: RelationKind[] = [
  'Parent', 'Child', 'Sibling', 'Spouse / partner', 'Grandparent', 'Grandchild',
  'Aunt / uncle', 'Niece / nephew', 'Cousin', 'Guardian', 'Ward / dependent',
]
const relationTypes: RelationType[] = [
  'Biological', 'Adoptive', 'Step', 'Foster', 'Legal guardian', 'Chosen family', 'In-law',
]

const inverseKind: Record<RelationKind, RelationKind> = {
  Parent: 'Child',
  Child: 'Parent',
  Sibling: 'Sibling',
  'Spouse / partner': 'Spouse / partner',
  Grandparent: 'Grandchild',
  Grandchild: 'Grandparent',
  'Aunt / uncle': 'Niece / nephew',
  'Niece / nephew': 'Aunt / uncle',
  Cousin: 'Cousin',
  Guardian: 'Ward / dependent',
  'Ward / dependent': 'Guardian',
}

function readStored<T,>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function initials(member: Member) {
  return `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase()
}

function fullName(member: Member) {
  return `${member.preferredName || member.firstName} ${member.lastName}`.trim()
}

function formatDate(value: string) {
  if (!value) return ''
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function InputUI() {
  const [members, setMembers] = useState<Member[]>(() => readStored(MEMBER_KEY, []))
  const [relationships, setRelationships] = useState<Relationship[]>(() => readStored(RELATION_KEY, []))

  // Form mode: 'add' creates a new member; 'connect' links two existing members dragged on the tree
  const [formMode, setFormMode] = useState<'add' | 'connect'>('add')
  const [connectFromId, setConnectFromId] = useState('')
  const [connectToId, setConnectToId] = useState('')
  const [connectKind, setConnectKind] = useState<RelationKind | ''>('')
  const [connectType, setConnectType] = useState<RelationType>('Biological')
  const connectKindSelectRef = useRef<HTMLSelectElement | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [preferredName, setPreferredName] = useState('')
  const [pronouns, setPronouns] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [isLiving, setIsLiving] = useState(true)
  const [deathDate, setDeathDate] = useState('')
  const [notes, setNotes] = useState('')
  const [links, setLinks] = useState<RelationshipDraft[]>([
    { id: makeId(), personId: '', kind: '', type: 'Biological' },
  ])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'living' | 'deceased'>('all')
  const [showAll, setShowAll] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    localStorage.setItem(MEMBER_KEY, JSON.stringify(members))
  }, [members])

  useEffect(() => {
    localStorage.setItem(RELATION_KEY, JSON.stringify(relationships))
  }, [relationships])

  const memberById = useMemo(
    () => new Map(members.map((member) => [member.id, member])),
    [members],
  )

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return members.filter((member) => {
      const matchesSearch = !query || `${member.firstName} ${member.lastName} ${member.preferredName}`.toLowerCase().includes(query)
      const matchesTab = activeTab === 'all' || (activeTab === 'living' ? member.isLiving : !member.isLiving)
      return matchesSearch && matchesTab
    })
  }, [members, search, activeTab])

  const livingCount = members.filter((member) => member.isLiving).length
  const deceasedCount = members.length - livingCount

  function updateLink(id: string, field: keyof Omit<RelationshipDraft, 'id'>, value: string) {
    setLinks((current) => current.map((link) => link.id === id ? ({ ...link, [field]: value } as RelationshipDraft) : link))
  }

  function addLinkRow() {
    setLinks((current) => [...current, { id: makeId(), personId: '', kind: '', type: 'Biological' }])
  }

  function removeLinkRow(id: string) {
    setLinks((current) => current.length === 1 ? current : current.filter((link) => link.id !== id))
  }

  function resetForm() {
    setFirstName('')
    setLastName('')
    setPreferredName('')
    setPronouns('')
    setBirthDate('')
    setIsLiving(true)
    setDeathDate('')
    setNotes('')
    setLinks([{ id: makeId(), personId: '', kind: '', type: 'Biological' }])
  }

  // Triggered when dragging a connection between two nodes in FamilyTreeView
  function handleTreeConnect(sourceId: string, targetId: string) {
    setFormMode('connect')
    setConnectFromId(sourceId)
    setConnectToId(targetId)
    setConnectKind('')
    setConnectType('Biological')

    document.getElementById('member-form-card')?.scrollIntoView({ behavior: 'smooth' })
    window.setTimeout(() => {
      connectKindSelectRef.current?.focus()
    }, 350)
  }

  function handleConnectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!connectFromId || !connectToId || !connectKind || connectFromId === connectToId) return

    const fromMember = memberById.get(connectFromId)
    const toMember = memberById.get(connectToId)
    if (!fromMember || !toMember) return

    const kind = connectKind as RelationKind
    const nextRelationships: Relationship[] = [
      {
        id: makeId(),
        fromId: connectFromId,
        toId: connectToId,
        kind,
        type: connectType,
        notes: '',
      },
      {
        id: makeId(),
        fromId: connectToId,
        toId: connectFromId,
        kind: inverseKind[kind],
        type: connectType,
        notes: '',
      },
    ]

    const xmlString = buildXmlPayload({
      relationships: { relationship: nextRelationships },
    })
    sendToBackend(xmlString)

    setRelationships((current) => [...current, ...nextRelationships])
    setConnectKind('')
    setFormMode('add')
    setNotice(`Connected ${fullName(fromMember)} and ${fullName(toMember)}.`)
    window.setTimeout(() => setNotice(''), 4500)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanFirst = firstName.trim()
    const cleanLast = lastName.trim()
    if (!cleanFirst || !cleanLast) return

    const newMember: Member = {
      id: makeId(),
      firstName: cleanFirst,
      lastName: cleanLast,
      preferredName: preferredName.trim(),
      pronouns: pronouns.trim(),
      birthDate,
      deathDate: isLiving ? '' : deathDate,
      isLiving,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    }

    const nextRelationships: Relationship[] = []
    links.forEach((link) => {
      if (!link.personId || !link.kind) return
      const kind = link.kind as RelationKind
      nextRelationships.push({
        id: makeId(), fromId: newMember.id, toId: link.personId,
        kind, type: link.type, notes: '',
      })
      nextRelationships.push({
        id: makeId(), fromId: link.personId, toId: newMember.id,
        kind: inverseKind[kind], type: link.type, notes: '',
      })
    })

    const xmlString = buildXmlPayload({
      newMember,
      relationships: nextRelationships.length > 0 ? { relationship: nextRelationships } : undefined,
    })
    sendToBackend(xmlString)

    setMembers((current) => [newMember, ...current])
    setRelationships((current) => [...current, ...nextRelationships])
    resetForm()
    setNotice(`${fullName(newMember)} was added to your family.`)
    window.setTimeout(() => setNotice(''), 4500)
  }

  function handleSaveAll() {
    const xmlString = buildXmlPayload({
      familyTree: {
        members: { member: members },
        relationships: { relationship: relationships },
      },
    })
    sendToBackend(xmlString)
  }

  function deleteMember(memberId: string) {
    const member = memberById.get(memberId)
    if (!member) return
    const confirmed = window.confirm(`Remove ${fullName(member)} and their relationship links?`)
    if (!confirmed) return
    setMembers((current) => current.filter((item) => item.id !== memberId))
    setRelationships((current) => current.filter((item) => item.fromId !== memberId && item.toId !== memberId))
  }

  function relationshipsFor(memberId: string) {
    return relationships
      .filter((relationship) => relationship.fromId === memberId)
      .map((relationship) => ({ ...relationship, person: memberById.get(relationship.toId) }))
      .filter((relationship) => relationship.person)
  }

  const fromPerson = memberById.get(connectFromId)
  const toPerson = memberById.get(connectToId)

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Ohana home">
          <img src={import.meta.env.BASE_URL + "images/OhanaLogo.png"} alt="Ohana" />
        </a>
        <div className="topbar-right">
          <div className="avatar avatar-user">Y</div>
        </div>
      </header>

      <div className="page-layout" id="top">
        <aside className="sidebar">
          <div className="side-section-label">WORKSPACE</div>
          <button
            className={`side-link ${formMode === 'add' ? 'active' : ''}`}
            type="button"
            onClick={() => setFormMode('add')}
          >
            <Users size={17} /> Family members
          </button>
          <button
            className={`side-link ${formMode === 'connect' ? 'active' : ''}`}
            type="button"
            onClick={() => {
              if (members.length >= 2) setFormMode('connect')
              document.getElementById('member-form-card')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <GitBranch size={17} /> Relationships
          </button>
          <button className="side-link" type="button" onClick={() => document.getElementById('member-list')?.scrollIntoView({ behavior: 'smooth' })}>
            <BookOpen size={17} /> Member directory
          </button>

          <div className="sidebar-divider" />
          <div className="side-section-label">YOUR FAMILY</div>
          <div className="family-mini-card">
            <div className="mini-icon"></div>
            <div>
              <strong>My family tree</strong>
              <span>{members.length} {members.length === 1 ? 'member' : 'members'} added</span>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <div className="page-heading">
            <div>
              <h1>Build your family tree<span>.</span></h1>
            </div>
            <div className="heading-count"><Users size={16} /><strong>{members.length}</strong><span>people in your tree</span></div>
          </div>

          {notice && <div className="success-banner" role="status"><Check size={17} /> {notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss"><X size={15} /></button></div>}

          <div className="content-grid">
            <section className="form-card" id="member-form-card">
              <div className="card-heading">
                <div>
                  <h2>{formMode === 'connect' ? 'Connect existing family members' : 'Add a family member'}</h2>
                </div>
                {members.length >= 2 && (
                  <div className="living-toggle" role="group" aria-label="Form mode">
                    <button
                      type="button"
                      className={formMode === 'add' ? 'selected' : ''}
                      onClick={() => setFormMode('add')}
                    >
                      New person
                    </button>
                    <button
                      type="button"
                      className={formMode === 'connect' ? 'selected' : ''}
                      onClick={() => setFormMode('connect')}
                    >
                      Link existing
                    </button>
                  </div>
                )}
              </div>

              {formMode === 'connect' ? (
                <form onSubmit={handleConnectSubmit}>
                  <div className="section-kicker"><span>SELECTED PEOPLE FROM TREE</span><i /></div>
                  <div className="form-grid relation-grid">
                    <label className="field">
                      <span>First person <b>*</b></span>
                      <div className="select-wrap">
                        <select
                          value={connectFromId}
                          onChange={(e) => setConnectFromId(e.target.value)}
                          required
                        >
                          <option value="">Select a person</option>
                          {members.map((member) => (
                            <option value={member.id} key={member.id}>{fullName(member)}</option>
                          ))}
                        </select>
                        <ChevronDown size={15} />
                      </div>
                    </label>

                    <label className="field">
                      <span>Relationship <b>*</b></span>
                      <div className="select-wrap">
                        <select
                          ref={connectKindSelectRef}
                          value={connectKind}
                          onChange={(e) => setConnectKind(e.target.value as RelationKind)}
                          required
                        >
                          <option value="">Select relationship</option>
                          {relationKinds.map((kind) => (
                            <option value={kind} key={kind}>{kind}</option>
                          ))}
                        </select>
                        <ChevronDown size={15} />
                      </div>
                    </label>

                    <label className="field">
                      <span>Second person <b>*</b></span>
                      <div className="select-wrap">
                        <select
                          value={connectToId}
                          onChange={(e) => setConnectToId(e.target.value)}
                          required
                        >
                          <option value="">Select a person</option>
                          {members
                            .filter((m) => m.id !== connectFromId)
                            .map((member) => (
                              <option value={member.id} key={member.id}>{fullName(member)}</option>
                            ))}
                        </select>
                        <ChevronDown size={15} />
                      </div>
                    </label>

                    <label className="field relation-type-field">
                      <span>Connection type</span>
                      <div className="select-wrap">
                        <select
                          value={connectType}
                          onChange={(e) => setConnectType(e.target.value as RelationType)}
                        >
                          {relationTypes.map((type) => (
                            <option value={type} key={type}>{type}</option>
                          ))}
                        </select>
                        <ChevronDown size={15} />
                      </div>
                    </label>
                  </div>

                  {fromPerson && toPerson && connectKind && (
                    <div className="relationship-preview">
                      <Link2 size={14} /> {fullName(fromPerson)} is <b>{connectKind.toLowerCase()}</b> of {fullName(toPerson)} <span>· {connectType}</span>
                    </div>
                  )}

                  <div className="form-footer">
                    <span><b>*</b> Required fields</span>
                    <div className="footer-actions">
                      <button type="button" className="button-quiet" onClick={() => setFormMode('add')}>
                        Cancel
                      </button>
                      <button type="submit" className="button-primary">
                        Save connection <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="section-kicker"><span>PERSONAL DETAILS</span><i /></div>
                  <div className="form-grid two-columns">
                    <label className="field">
                      <span>First name <b>*</b></span>
                      <input value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Tom" required />
                    </label>
                    <label className="field">
                      <span>Last name <b>*</b></span>
                      <input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Cruise" required />
                    </label>
                    <label className="field">
                      <span>Preferred name <small>Optional</small></span>
                      <input value={preferredName} onChange={(event) => setPreferredName(event.target.value)} />
                    </label>
                    <label className="field">
                      <span>Pronouns <small>Optional</small></span>
                      <input value={pronouns} onChange={(event) => setPronouns(event.target.value)} placeholder=" he / him" />
                    </label>
                    <label className="field">
                      <span>Date of birth <small>Optional</small></span>
                      <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
                    </label>
                    <div className="field living-field">
                      <span>Living status</span>
                      <div className="living-toggle" role="group" aria-label="Living status">
                        <button className={isLiving ? 'selected' : ''} type="button" onClick={() => setIsLiving(true)}>Living</button>
                        <button className={!isLiving ? 'selected' : ''} type="button" onClick={() => setIsLiving(false)}>Passed away</button>
                      </div>
                    </div>
                    {!isLiving && (
                      <label className="field">
                        <span>Date of passing <small>Optional</small></span>
                        <input type="date" value={deathDate} onChange={(event) => setDeathDate(event.target.value)} />
                      </label>
                    )}
                  </div>

                  <div className="section-kicker relationship-kicker" id="relationship-section"><span>FAMILY CONNECTIONS</span><i /></div>
                  {members.length === 0 ? (
                    <div className="empty-connect"><UserRound size={18} /><span>Add your first person to start. </span></div>
                  ) : (
                    <div className="relationship-rows">
                      {links.map((link, index) => (
                        <div className="relationship-row" key={link.id}>
                          <div className="relationship-row-top"><span>CONNECTION {String(index + 1).padStart(2, '0')}</span>
                            {links.length > 1 && <button className="icon-button remove-link" type="button" onClick={() => removeLinkRow(link.id)} aria-label="Remove connection"><X size={15} /></button>}
                          </div>
                          <div className="form-grid relation-grid">
                            <label className="field">
                              <span>Person in your tree</span>
                              <div className="select-wrap"><select value={link.personId} onChange={(event) => updateLink(link.id, 'personId', event.target.value)}>
                                <option value="">Select a person</option>
                                {members.map((member) => <option value={member.id} key={member.id}>{fullName(member)}</option>)}
                              </select><ChevronDown size={15} /></div>
                            </label>
                            <label className="field">
                              <span>New person&apos;s relationship</span>
                              <div className="select-wrap"><select value={link.kind} onChange={(event) => updateLink(link.id, 'kind', event.target.value)}>
                                <option value="">Select relationship</option>
                                {relationKinds.map((kind) => <option value={kind} key={kind}>{kind}</option>)}
                              </select><ChevronDown size={15} /></div>
                            </label>
                            <label className="field relation-type-field">
                              <span>Connection type</span>
                              <div className="select-wrap"><select value={link.type} onChange={(event) => updateLink(link.id, 'type', event.target.value)}>
                                {relationTypes.map((type) => <option value={type} key={type}>{type}</option>)}
                              </select><ChevronDown size={15} /></div>
                            </label>
                          </div>
                          {link.kind && link.personId && (
                            <div className="relationship-preview"><Link2 size={14} /> {firstName.trim() || 'This person'} is <b>{link.kind.toLowerCase()}</b> of {memberById.get(link.personId) ? fullName(memberById.get(link.personId)!) : 'the selected person'} <span>· {link.type}</span></div>
                          )}
                        </div>
                      ))}
                      <button type="button" className="add-connection" onClick={addLinkRow}><Plus size={15} /> Add another connection</button>
                    </div>
                  )}

                  <div className="section-kicker notes-kicker"><span>NOTES</span><i /></div>
                  <label className="field notes-field">
                    <span><small>Optional</small></span>
                    <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="A memoir" rows={3} />
                  </label>

                  <div className="form-footer">
                    <span><b>*</b> Required fields</span>
                    <div className="footer-actions">
                      <button type="button" className="button-quiet" onClick={resetForm}>Clear form</button>
                      <button type="submit" className="button-primary">Add family member <ArrowRight size={16} /></button>
                    </div>
                  </div>
                </form>
              )}
            </section>
            <aside className="right-column">
              <section className="stats-card">
                <div className="stats-head"><div><span className="small-label">YOUR FAMILY TREE</span></div><div className="stats-ornament"></div></div>
                <div className="stats-total"><strong>{members.length.toString().padStart(2, '0')}</strong><span>family members</span></div>
                <div className="stats-bar"><span style={{ width: `${members.length ? (livingCount / members.length) * 100 : 0}%` }} /></div>
                <div className="stats-legend"><span> Living <b>{livingCount}</b></span><span> Deceased <b>{deceasedCount}</b></span></div>
              </section>
            </aside>
          </div>

          <section className="directory-section" id="member-list">
            <div className="directory-heading">
              <div><div className="eyebrow"></div><h2>Family directory</h2></div>
              <div className="footer-actions">
                <div className="directory-count">{members.length} {members.length === 1 ? 'person' : 'people'}</div>
              </div>
              <button
                type="button"
                className="button-primary"
                onClick={handleSaveAll}
              >
                Save your changes
              </button>
            </div>
            <div className="directory-toolbar">
              <div className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search family members" /></div>
              <div className="filter-tabs" role="tablist" aria-label="Filter members">
                <button type="button" className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>All <span>{members.length}</span></button>
                <button type="button" className={activeTab === 'living' ? 'active' : ''} onClick={() => setActiveTab('living')}>Living <span>{livingCount}</span></button>
                <button type="button" className={activeTab === 'deceased' ? 'active' : ''} onClick={() => setActiveTab('deceased')}>Deceased <span>{deceasedCount}</span></button>
              </div>
            </div>

            {members.length > 0 && (
              filteredMembers.length === 0 ? (
                <div className="no-results">No family members match that search.</div>
              ) : (
                <div className="member-list">
                  {(showAll ? filteredMembers : filteredMembers.slice(0, 5)).map((member, index) => {
                    const connections = relationshipsFor(member.id)
                    return (
                      <article className="member-card" key={member.id}>
                        <div className={`member-avatar avatar-${index % 5}`}>{initials(member)}</div>
                        <div className="member-main"><div className="member-name-line"><h3>{fullName(member)}</h3>{!member.isLiving && <span className="remembered-tag">Deceased</span>}</div>
                          <div className="member-meta">{member.pronouns && <span>{member.pronouns}</span>}{member.birthDate && <span>{formatDate(member.birthDate)}{!member.isLiving && member.deathDate ? ` – ${formatDate(member.deathDate)}` : ''}</span>}{!member.pronouns && !member.birthDate && <span>Family member</span>}</div>
                          {connections.length > 0 && <div className="connection-chips">{connections.slice(0, 3).map((connection) => <span key={connection.id}><Link2 size={11} /> {connection.kind} of {fullName(connection.person!)}</span>)}{connections.length > 3 && <span>+{connections.length - 3} more</span>}</div>}
                          {member.notes && <p className="member-note">{member.notes}</p>}
                        </div>
                        <button className="icon-button delete-member" type="button" onClick={() => deleteMember(member.id)} title={`Remove ${fullName(member)}`} aria-label={`Remove ${fullName(member)}`}><Trash2 size={16} /></button>
                      </article>
                    )
                  })}
                  {filteredMembers.length > 5 && <button className="show-more" type="button" onClick={() => setShowAll((value) => !value)}>{showAll ? 'Show fewer' : `Show all ${filteredMembers.length} members`} <ChevronDown size={15} className={showAll ? 'rotate-up' : ''} /></button>}
                </div>
              )
            )}
          </section>
          <section className="tree-section">
            <h2>Family Tree</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
              Drag from one person&apos;s handle to another to define a relationship between them.
            </p>
            <FamilyTreeView
              members={members}
              relationships={relationships}
              onConnectMembers={handleTreeConnect}
            />
          </section>
        </main>
      </div>
    </div>
  )
}

export default InputUI
