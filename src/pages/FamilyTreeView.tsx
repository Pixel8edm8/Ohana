import { useCallback, useEffect, useState, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
  type Connection,
} from '@xyflow/react'
import ELK from 'elkjs/lib/elk.bundled.js'
import '@xyflow/react/dist/style.css'
import type { Member, Relationship, RelationKind } from '../types/family'

type FamilyNodeData = {
  member: Member
}

type FamilyNode = Node<FamilyNodeData, 'familyMember'>

function FamilyMemberNode({ data }: NodeProps<FamilyNode>) {
  const { member } = data
  const displayName = `${member.preferredName || member.firstName} ${member.lastName}`.trim()
  const initials = `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase()

  return (
    <div
      style={{
        width: 220,
        padding: '12px 14px',
        borderRadius: 12,
        background: '#ffffff',
        border: member.isLiving ? '1.5px solid #cbd5e1' : '1.5px dashed #94a3b8',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        style={{ width: 10, height: 10, background: '#64748b' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: '#e0e7ff',
            color: '#3730a3',
            fontWeight: 700,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              color: '#0f172a',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {displayName}
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            {member.pronouns ? `${member.pronouns} · ` : ''}
            {member.isLiving ? 'Living' : 'Deceased'}
          </div>
        </div>
      </div>

      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        style={{ width: 10, height: 10, background: '#64748b' }}
      />
    </div>
  )
}

const nodeTypes = {
  familyMember: FamilyMemberNode,
}

const elk = new ELK()

const elkOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '60',
  'elk.layered.spacing.nodeNodeBetweenLayers': '90',
  'elk.edgeRouting': 'ORTHOGONAL',
}

async function computeElkLayout(nodes: FamilyNode[], edges: Edge[]) {
  const graph = {
    id: 'ohana-tree',
    layoutOptions: elkOptions,
    children: nodes.map((node) => ({
      id: node.id,
      width: 220,
      height: 76,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  }

  const layoutedGraph = await elk.layout(graph)

  const layoutedNodes: FamilyNode[] = nodes.map((node) => {
    const elkNode = layoutedGraph.children?.find((n) => n.id === node.id)
    return {
      ...node,
      position: {
        x: elkNode?.x ?? 0,
        y: elkNode?.y ?? 0,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

function buildGraphElements(members: Member[], relationships: Relationship[]) {
  const initialNodes: FamilyNode[] = members.map((member) => ({
    id: member.id,
    type: 'familyMember',
    position: { x: 0, y: 0 },
    data: { member },
  }))

  const seenPairs = new Set<string>()
  const initialEdges: Edge[] = []

  const primaryDirections = new Set<RelationKind>([
    'Parent',
    'Grandparent',
    'Guardian',
    'Spouse / partner',
    'Sibling',
    'Cousin',
  ])

  for (const rel of relationships) {
    if (!primaryDirections.has(rel.kind)) continue

    const pairKey = [rel.fromId, rel.toId].sort().join('::')
    if (seenPairs.has(pairKey)) continue
    seenPairs.add(pairKey)

    const isNonBiological = rel.type !== 'Biological'
    const isPartner = rel.kind === 'Spouse / partner'

    initialEdges.push({
      id: rel.id,
      source: rel.fromId,
      target: rel.toId,
      label: `${rel.kind} (${rel.type})`,
      type: 'smoothstep',
      animated: rel.type === 'Chosen family',
      style: {
        stroke: isPartner ? '#ec4899' : isNonBiological ? '#6366f1' : '#64748b',
        strokeWidth: 2,
        strokeDasharray: isNonBiological ? '6 4' : undefined,
      },
      labelStyle: { fontSize: 11, fill: '#475569', fontWeight: 500 },
      markerEnd: isPartner
        ? undefined
        : { type: MarkerType.ArrowClosed, color: isNonBiological ? '#6366f1' : '#64748b' },
    })
  }

  return { initialNodes, initialEdges }
}

export function FamilyTreeView({
  members,
  relationships,
  treeId,
  onConnectMembers,
}: {
  members: Member[]
  relationships: Relationship[]
  onConnectMembers?: (sourceId: string, targetId: string) => void
  treeId: string
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<FamilyNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const [treeLink, setTreeLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const handleCreateLink = async () => {
  const link = `${window.location.origin}/tree/${encodeURIComponent(treeId)}`
  setTreeLink(link)
  try {
    await navigator.clipboard.writeText(link)
    setLinkCopied(true)
  } catch {
    setLinkCopied(false)
  }
}

  const { initialNodes, initialEdges } = useMemo(
    () => buildGraphElements(members, relationships),
    [members, relationships],
  )

  useEffect(() => {
    let cancelled = false

    computeElkLayout(initialNodes, initialEdges).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
      if (!cancelled) {
        setNodes(layoutedNodes)
        setEdges(layoutedEdges)
      }
    })

    return () => {
      cancelled = true
    }
  }, [initialNodes, initialEdges, setNodes, setEdges])

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return
      if (connection.source === connection.target) return
      onConnectMembers?.(connection.source, connection.target)
    },
    [onConnectMembers],
  )

  if (members.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
        Add family members to visualize your tree.
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: 600, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
       <div style={{ marginBottom: 12 }}>
  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
    <button
      onClick={handleCreateLink}
      style={{
        padding: '9px 18px',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 8,
        color: '#334155',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {linkCopied ? 'Copied!' : 'Create Link'}
    </button>
  </div>

  {treeLink && (
    <div style={{ marginTop: 10 }}>
      <input
        type="text"
        value={treeLink}
        readOnly
        onClick={(e) => e.currentTarget.select()}
        style={{
          width: '100%',
          padding: 10,
          border: '1px solid #cbd5e1',
          borderRadius: 8,
          fontSize: 13,
        }}
      />

      <small style={{ color: '#64748b' }}>
        {linkCopied
          ? 'Link copied to clipboard!'
          : 'Select and copy the link above.'}
      </small>
    </div>
  )}
</div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background gap={16} color="#e2e8f0" />
        <Controls />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </div>
  )
}