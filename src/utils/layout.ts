import { Node, Edge, Position } from 'reactflow';
import { Person, Relationship } from '@/types/types';

const NODE_WIDTH = 150;
const NODE_HEIGHT = 220;
const SPOUSE_GAP = 40;
const SIBLING_GAP = 80;
const RANK_SEP = 300;

// Helper: Xác định width của một node (đơn hoặc cặp)
const getBlockWidth = (nodeId: string, spouseMap: Record<string, string>) => {
  const spouseId = spouseMap[nodeId];
  return spouseId ? (NODE_WIDTH * 2 + SPOUSE_GAP) : NODE_WIDTH;
};

// Thuật toán đệ quy tính toán layout
// Map lưu cache width của subtree
const treeWidths: Record<string, number> = {};

const calculateMetrics = (
  nodeId: string,
  spouseMap: Record<string, string>,
  childrenMap: Record<string, string[]>,
  processed: Set<string> // Chỉ để tránh cycle
): number => {
  if (treeWidths[nodeId]) return treeWidths[nodeId];

  const spouseId = spouseMap[nodeId];
  const selfWidth = spouseId ? (NODE_WIDTH * 2 + SPOUSE_GAP) : NODE_WIDTH;

  const children = [...(childrenMap[nodeId] || [])];
  if (spouseId && childrenMap[spouseId]) {
    childrenMap[spouseId].forEach(c => {
      if (!children.includes(c)) children.push(c);
    });
  }

  if (children.length === 0) {
    treeWidths[nodeId] = selfWidth;
    return selfWidth;
  }

  let childrenBlockWidth = 0;
  children.forEach((childId, idx) => {
    const w = calculateMetrics(childId, spouseMap, childrenMap, processed);
    childrenBlockWidth += w;
    if (idx < children.length - 1) childrenBlockWidth += SIBLING_GAP;
  });

  const finalWidth = Math.max(selfWidth, childrenBlockWidth);
  treeWidths[nodeId] = finalWidth;
  return finalWidth;
};


const assignCoordinates = (
  nodeId: string,
  startX: number, // Tọa độ bắt đầu của block dành cho subtree này
  level: number,
  spouseMap: Record<string, string>,
  childrenMap: Record<string, string[]>,
  positions: Record<string, { x: number, y: number }>,
  processed: Set<string>
) => {
  if (processed.has(nodeId)) return;
  processed.add(nodeId);
  const spouseId = spouseMap[nodeId];
  if (spouseId) processed.add(spouseId);

  const selfWidth = spouseId ? (NODE_WIDTH * 2 + SPOUSE_GAP) : NODE_WIDTH;
  const fullTreeWidth = treeWidths[nodeId] || selfWidth;

  // Center của block này
  const centerX = startX + fullTreeWidth / 2;
  const y = (level - 1) * RANK_SEP;

  // Đặt vị trí Node (Bố Mẹ) ở Center
  // Nếu là Couple: [Node1] - Gap - [Node2]. Center nằm giữa Gap.
  if (spouseId) {
    // Node1 (Main)
    positions[nodeId] = {
      x: centerX - (SPOUSE_GAP / 2) - NODE_WIDTH,
      y: y
    };
    // Node2 (Spouse)
    positions[spouseId] = {
      x: centerX + (SPOUSE_GAP / 2),
      y: y
    };
  } else {
    // Single
    positions[nodeId] = {
      x: centerX - NODE_WIDTH / 2,
      y: y
    };
  }

  // Đặt vị trí Con Cái
  const children = [...(childrenMap[nodeId] || [])];
  if (spouseId && childrenMap[spouseId]) {
    childrenMap[spouseId].forEach(c => {
      if (!children.includes(c)) children.push(c);
    });
  }

  if (children.length > 0) {
    // Tính toán StartX cho children block để nó Center align với Parents
    // Tổng width children
    let childrenBlockWidth = 0;
    children.forEach((c, i) => {
      childrenBlockWidth += treeWidths[c];
      if (i < children.length - 1) childrenBlockWidth += SIBLING_GAP;
    });

    // StartX của con đầu tiên sao cho Center của ChildrenBlock trùng CenterX (của bố mẹ)
    let currentChildX = centerX - childrenBlockWidth / 2;

    children.forEach(childId => {
      const w = treeWidths[childId];
      assignCoordinates(childId, currentChildX, level + 1, spouseMap, childrenMap, positions, processed);
      currentChildX += w + SIBLING_GAP;
    });
  }
};


export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = 'TB',
  personLevels: Record<string, number> = {}
) => {
  const spouseMap: Record<string, string> = {};
  const childrenMap: Record<string, string[]> = {};
  const positions: Record<string, { x: number, y: number }> = {};

  // 1. Build Graph Maps
  const personMap = new Map<string, Person>();
  nodes.forEach(n => personMap.set(n.id, n.data.person));

  // Helper date parser
  const parseDate = (dString?: string) => {
    if (!dString) return 0;
    // Simple parse for "YYYY" or "DD/MM/YYYY" or ISO
    if (/^\d{4}$/.test(dString)) return new Date(Number(dString), 0, 1).getTime();
    const parts = dString.split('/');
    if (parts.length === 3) return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
    return new Date(dString).getTime();
  };

  edges.forEach(edge => {
    const isSpouseEdge = edge.data?.isSpouse || edge.className?.includes('spouse-edge');
    if (isSpouseEdge) {
      spouseMap[edge.source] = edge.target;
      spouseMap[edge.target] = edge.source;
    } else {
      const p = edge.source;
      const c = edge.target;
      if (!childrenMap[p]) childrenMap[p] = [];
      childrenMap[p].push(c);
    }
  });

  // Sort Children by Age or Order (Oldest/First First -> Left)
  Object.keys(childrenMap).forEach(parentId => {
    childrenMap[parentId].sort((aId, bId) => {
      const pA = personMap.get(aId);
      const pB = personMap.get(bId);
      if (!pA || !pB) return 0;

      // 1. Primary Sort: Order (Thứ tự trong đời)
      if (pA.order !== undefined && pB.order !== undefined && pA.order !== pB.order) {
        return pA.order - pB.order;
      }

      // 2. Secondary Sort: Date of Birth
      const dateA = pA.dob?.date ? parseDate(pA.dob.date) : Number.MAX_SAFE_INTEGER;
      const dateB = pB.dob?.date ? parseDate(pB.dob.date) : Number.MAX_SAFE_INTEGER;
      return dateA - dateB;
    });
  });

  // 2. Identify Roots (Level 1 or No Parents)
  // Dùng personLevels để chắc chắn
  const roots = nodes.filter(n => (personLevels[n.id] || 1) === 1).map(n => n.id);
  const uniqueRoots: string[] = [];
  const processedRoots = new Set<string>();

  roots.forEach(r => {
    if (processedRoots.has(r)) return;
    uniqueRoots.push(r);
    processedRoots.add(r);
    if (spouseMap[r]) processedRoots.add(spouseMap[r]);
  });

  // Reset cache
  for (const key in treeWidths) delete treeWidths[key];

  // 3. Calculate Metrics & Assign Positions
  let currentRootX = 0;
  const processedNodes = new Set<string>();

  uniqueRoots.forEach(rootId => {
    // Tính width cây
    const dummySet = new Set<string>(); // Metrics calc doesn't mark generic usage
    const treeW = calculateMetrics(rootId, spouseMap, childrenMap, dummySet);

    // Gán tọa độ
    assignCoordinates(rootId, currentRootX, 1, spouseMap, childrenMap, positions, processedNodes);

    currentRootX += treeW + 300; // Khoảng cách giữa các Main Trees
  });

  // Handle Orphans if any (những node chưa được layout)
  nodes.forEach(n => {
    if (!positions[n.id]) {
      // Safety check: is this a spouse of someone already placed?
      const mainSpouseId = spouseMap[n.id];
      if (mainSpouseId && positions[mainSpouseId]) {
        // Place next to spouse
        positions[n.id] = {
          x: positions[mainSpouseId].x + NODE_WIDTH + SPOUSE_GAP, // Naive overlap fix, assuming main is Left
          y: positions[mainSpouseId].y
        };
        // If main spouse was actually on right, this might overlap, 
        // but typically orphans are 2nd spouses or broken links.
        // Better: Check if main spouse is Left or Right in their pair?
        // Since we don't know, we just place it nearby.
      } else {
        // Real orphan
        positions[n.id] = { x: currentRootX, y: 0 };
        currentRootX += NODE_WIDTH + 50;
      }
    }
  });

  // 4. Return Layouted Nodes
  const layoutedNodes = nodes.map(node => ({
    ...node,
    position: positions[node.id] || { x: 0, y: 0 }
  }));

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

  // BFS Calculate Levels
  const calculateLevels = () => {
    const visited = new Set<string>();
    people.forEach(p => {
      if (visited.has(p.id)) return;
      const queue: { id: string, level: number }[] = [{ id: p.id, level: 1 }];
      visited.add(p.id);
      let head = 0;
      while (head < queue.length) {
        const { id, level } = queue[head++];
        personLevels[id] = level;

        // Down to Children
        relationships.filter(r => r.source === id && r.type === 'blood').forEach(r => {
          if (!visited.has(r.target)) {
            visited.add(r.target);
            queue.push({ id: r.target, level: level + 1 });
          }
        });

        // Up to Parents
        relationships.filter(r => r.target === id && r.type === 'blood').forEach(r => {
          if (!visited.has(r.source)) {
            visited.add(r.source);
            queue.push({ id: r.source, level: level - 1 });
          }
        });

        // Spouse
        relationships.filter(r => (r.source === id || r.target === id) && r.type === 'spouse').forEach(r => {
          const spouseId = r.source === id ? r.target : r.source;
          if (!visited.has(spouseId)) {
            visited.add(spouseId);
            queue.push({ id: spouseId, level: level });
          }
        });
      }
    });

    // Normalize levels
    const levels = Object.values(personLevels);
    if (levels.length > 0) {
      const minLevel = Math.min(...levels);
      Object.keys(personLevels).forEach(k => personLevels[k] = personLevels[k] - minLevel + 1);
    }
  };
  calculateLevels();

  // Filter
  const filteredPeople = people.filter(p => (personLevels[p.id] || 1) <= maxVisibleLevel);
  const filteredIds = new Set(filteredPeople.map(p => p.id));

  // Create Nodes
  const nodes: Node[] = filteredPeople.map(p => ({
    id: p.id,
    type: 'custom',
    data: {
      person: p,
      level: personLevels[p.id],
      onNodeClick, onAddClick, onDeleteClick
    },
    position: { x: 0, y: 0 }
  }));

  // Create Edges
  const edges: Edge[] = relationships
    .filter(r => filteredIds.has(r.source) && filteredIds.has(r.target))
    .map(r => {
      const isSpouse = r.type === 'spouse';
      return {
        id: r.id,
        source: r.source,
        target: r.target,
        sourceHandle: isSpouse ? 'right' : 'bottom',
        targetHandle: isSpouse ? 'left' : 'top',
        type: isSpouse ? 'straight' : 'tree', // Use custom orthogonal edge
        className: isSpouse ? 'spouse-edge' : 'blood-edge',
        data: { isSpouse }, // Explicit data flag
        style: {
          stroke: isSpouse ? '#B08D3E' : '#741B1B', // Gold for spouse, Reddish for blood
          strokeWidth: 2,
          strokeDasharray: isSpouse ? '4 4' : '0',
          opacity: 0.8
        }
      };
    });

  return { nodes, edges, personLevels, hasMore: people.length > filteredPeople.length };
};
