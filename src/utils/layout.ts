
import dagre from 'dagre';
import { Node, Edge, Position } from 'reactflow';
import { Person, Relationship } from '@/types/types';

const nodeWidth = 140; // Khớp với CustomNode
const nodeHeight = 190;
const rankSep = 200;
const nodeSep = 100;

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = 'TB'
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: rankSep,
    nodesep: nodeSep,
    marginx: 100,
    marginy: 100
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const x = nodeWithPosition.x - nodeWidth / 2;
    const y = nodeWithPosition.y - nodeHeight / 2;

    return {
      ...node,
      position: { x, y },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const transformDataToFlow = (
  people: Person[],
  relationships: Relationship[],
  onNodeClick: (id: string) => void,
  onAddClick: (id: string, type: 'parent' | 'spouse' | 'child') => void,
  onDeleteClick: (id: string) => void,
  maxVisibleLevel: number
) => {
  const personLevels: Record<string, number> = {};

  const calculateLevels = () => {
    const roots = people.filter(p => !relationships.some(r => r.target === p.id && r.type === 'blood'));

    const traverse = (id: string, level: number) => {
      if (personLevels[id] !== undefined && personLevels[id] <= level) return;
      personLevels[id] = level;

      relationships.filter(r => r.source === id && r.type === 'blood').forEach(r => {
        traverse(r.target, level + 1);
      });

      relationships.filter(r => (r.source === id || r.target === id) && r.type === 'spouse').forEach(r => {
        const spouseId = r.source === id ? r.target : r.source;
        if (personLevels[spouseId] === undefined) {
          personLevels[spouseId] = level;
          relationships.filter(cr => cr.source === spouseId && cr.type === 'blood').forEach(cr => {
            traverse(cr.target, level + 1);
          });
        }
      });
    };

    roots.forEach(root => traverse(root.id, 1));
  };

  calculateLevels();

  const filteredPeople = people.filter(p => (personLevels[p.id] || 1) <= maxVisibleLevel);
  const filteredPeopleIds = new Set(filteredPeople.map(p => p.id));

  const nodes: Node[] = filteredPeople.map((person) => ({
    id: person.id,
    type: 'custom',
    data: {
      person,
      onNodeClick,
      onAddClick,
      onDeleteClick
    },
    position: { x: 0, y: 0 },
  }));

  const edges: Edge[] = relationships
    .filter(rel => filteredPeopleIds.has(rel.source) && filteredPeopleIds.has(rel.target))
    .map((rel) => {
      const isSpouse = rel.type === 'spouse';

      return {
        id: rel.id,
        source: rel.source,
        target: rel.target,
        // QUY TẮC CỔNG KẾT NỐI:
        sourceHandle: isSpouse ? 'right' : 'bottom',
        targetHandle: isSpouse ? 'left' : 'top',
        type: isSpouse ? 'simplebezier' : 'smoothstep',
        className: isSpouse ? 'spouse-edge' : 'blood-edge',
        style: {
          stroke: isSpouse ? '#B08D3E' : '#741B1B',
          strokeWidth: isSpouse ? 2 : 4,
          strokeDasharray: isSpouse ? '6 4' : '0',
          opacity: isSpouse ? 0.6 : 1
        },
      };
    });

  return { nodes, edges, hasMore: people.length > filteredPeople.length };
};
