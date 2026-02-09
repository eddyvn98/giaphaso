
import { Person, Relationship } from '@/types/types';

/**
 * Xây dựng danh sách kề từ danh sách quan hệ
 */
export const buildAdjacencyList = (relationships: Relationship[]): Map<string, string[]> => {
  const adj = new Map<string, string[]>();
  relationships.forEach(r => {
    if (!adj.has(r.source)) adj.set(r.source, []);
    if (!adj.has(r.target)) adj.set(r.target, []);
    adj.get(r.source)!.push(r.target);
    adj.get(r.target)!.push(r.source);
  });
  return adj;
};

/**
 * Tìm đường đi ngắn nhất giữa 2 người (tối ưu hóa với adj list)
 */
export const findRelationshipPath = (
  startId: string,
  endId: string,
  relationships: Relationship[],
  adj?: Map<string, string[]>
): string[] => {
  if (startId === endId) return [startId];
  const list = adj || buildAdjacencyList(relationships);

  const queue: [string, string[]][] = [[startId, [startId]]];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const nodeData = queue.shift();
    if (!nodeData) break;
    const [current, path] = nodeData;

    if (current === endId) return path;
    for (const neighbor of (list.get(current) || [])) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, [...path, neighbor]]);
      }
    }
  }
  return [];
};

/**
 * Xác định hướng của từng bước trong quan hệ
 */
const getStepType = (from: string, to: string, relationships: Relationship[]) => {
  const rel = relationships.find(r =>
    (r.source === from && r.target === to) || (r.source === to && r.target === from)
  );
  if (!rel) return null;
  if (rel.type === 'spouse') return 'SPOUSE';
  if (rel.source === from) return 'DOWN'; // From parent to child
  return 'UP'; // From child to parent
};

// Fix error: Exporting describePath which was missing but used in RouteFinder.tsx
/**
 * Mô tả từng bước trong đường đi huyết thống
 */
export const describePath = (
  path: string[],
  people: Person[],
  relationships: Relationship[]
): string[] => {
  const result: string[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const fromId = path[i];
    const toId = path[i + 1];
    const from = people.find(p => p.id === fromId);
    const to = people.find(p => p.id === toId);
    if (!from || !to) continue;

    const rel = relationships.find(r =>
      (r.source === fromId && r.target === toId) || (r.source === toId && r.target === fromId)
    );

    if (!rel) continue;

    if (rel.type === 'spouse') {
      const term = to.gender === 'male' ? 'chồng' : 'vợ';
      result.push(`${to.fullName} là ${term} của ${from.fullName}`);
    } else {
      if (rel.source === fromId) {
        // Xuống: from là ba/mẹ, to là con
        const term = to.gender === 'male' ? 'con trai' : 'con gái';
        result.push(`${to.fullName} là ${term} của ${from.fullName}`);
      } else {
        // Lên: to là Ba/mẹ, from là con
        const term = to.gender === 'male' ? 'ba' : 'mẹ';
        result.push(`${to.fullName} là ${term} của ${from.fullName}`);
      }
    }
  }
  return result;
};

/**
 * Thuật toán xác định vai vế Việt Nam chính xác
 */
export const getKinshipTerm = (
  baseId: string,
  targetId: string,
  people: Person[],
  relationships: Relationship[],
  adj?: Map<string, string[]>
): string => {
  if (baseId === targetId) return "Tôi";
  const base = people.find(p => p.id === baseId);
  const target = people.find(p => p.id === targetId);
  if (!base || !target) return "";
  const list = adj || buildAdjacencyList(relationships);

  const path = findRelationshipPath(baseId, targetId, relationships, list);
  if (path.length < 2) return "Họ hàng";

  // Phân tích các bước
  const steps = [];
  for (let i = 0; i < path.length - 1; i++) {
    const fromId = path[i];
    const toId = path[i + 1];
    const type = getStepType(fromId, toId, relationships);
    steps.push({ fromId, toId, type });
  }

  const isMale = target.gender === 'male';
  let genDelta = 0;
  steps.forEach(s => {
    if (s.type === 'UP') genDelta++;
    if (s.type === 'DOWN') genDelta--;
  });

  // Helper parse date
  const parseDate = (dString: string) => {
    let d = new Date(dString);
    if (!isNaN(d.getTime())) return d;
    const parts = dString.split('/');
    if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    if (/^\d{4}$/.test(dString)) return new Date(dString);
    return null;
  };

  const compareAge = (p1: Person, p2: Person): 'older' | 'younger' | 'unknown' => {
    if (p1.dob?.date && p2.dob?.date) {
      const d1 = parseDate(p1.dob.date);
      const d2 = parseDate(p2.dob.date);
      if (d1 && d2) {
        if (d1.getTime() < d2.getTime()) return 'older';
        if (d1.getTime() > d2.getTime()) return 'younger';
      }
    }
    // Fallback: so sánh theo order
    if (p1.order && p2.order && p1.order !== p2.order) {
      return p1.order < p2.order ? 'older' : 'younger';
    }
    return 'unknown';
  };

  // 1. Cùng đời (genDelta === 0)
  if (genDelta === 0) {
    if (steps.length === 1 && steps[0].type === 'SPOUSE') return isMale ? "Chồng" : "Vợ";

    // Anh chị em ruột
    if (steps.length === 2 && steps[0].type === 'UP' && steps[1].type === 'DOWN') {
      const seniority = compareAge(target, base);
      if (seniority === 'older') return isMale ? "Anh trai" : "Chị gái";
      if (seniority === 'younger') return isMale ? "Em trai" : "Em gái";
      return isMale ? "Anh/Em" : "Chị/Em";
    }

    // Dâu Rể (Spouse of Sibling)
    if (steps.length === 3 && steps[0].type === 'UP' && steps[1].type === 'DOWN' && steps[2].type === 'SPOUSE') {
      const siblingId = steps[1].toId;
      const sibling = people.find(p => p.id === siblingId);
      if (sibling) {
        const seniority = compareAge(sibling, base);
        if (seniority === 'older') {
          if (sibling.gender === 'male') return "Chị dâu";
          return "Anh rể";
        } else if (seniority === 'younger') {
          if (sibling.gender === 'male') return "Em dâu";
          return "Em rể";
        }
      }
      return isMale ? "Anh/Em rể" : "Chị/Em dâu";
    }

    // Cousins (Con Bác/Con Chú/Con Cô/Con Cậu/Con Dì)
    if (steps.length === 4 && steps[0].type === 'UP' && steps[1].type === 'UP' && steps[2].type === 'DOWN' && steps[3].type === 'DOWN') {
      const myParentId = steps[0].toId;
      const myParent = people.find(p => p.id === myParentId);
      const cousinParentId = steps[2].toId;
      const cousinParent = people.find(p => p.id === cousinParentId);

      if (myParent && cousinParent) {
        const parentSeniority = compareAge(cousinParent, myParent);
        // Rule: "Con chú con bác" - Seniority follows the branch of parents
        if (parentSeniority === 'older') {
          // Parent of cousin is older branch (Bác). I call them Anh/Chị.
          return isMale ? "Anh họ" : "Chị họ";
        } else if (parentSeniority === 'younger') {
          // Parent of cousin is younger branch (Chú/Cô/Cậu/Dì). I call them Em.
          return isMale ? "Em họ" : "Em họ";
        }
      }
      // Fallback to age comparison if parent seniority unknown
      const cousinSeniority = compareAge(target, base);
      if (cousinSeniority === 'older') return isMale ? "Anh họ" : "Chị họ";
      if (cousinSeniority === 'younger') return isMale ? "Em họ" : "Em họ";
      return isMale ? "Anh/Em họ" : "Anh/Chị họ";
    }

    return "Họ hàng";
  }

  // 2. Cách 1 đời (genDelta === 1)
  if (genDelta === 1) {
    // 2.1 Bố Mẹ Vợ/Chồng (Me -> Spouse -> Parent)
    if (steps.length === 2 && steps[0].type === 'SPOUSE' && steps[1].type === 'UP') return isMale ? "Bố vợ/chồng" : "Mẹ vợ/chồng";

    // 2.2 Bố Mẹ Ruột (Direct UP)
    if (steps.length === 1 && steps[0].type === 'UP') return isMale ? "Ba" : "Mẹ";

    // 2.3 Bố Mẹ (Indirect via Spouse) - e.g. Me -> Father -> Mother (Spouse)
    if (steps.length === 2 && steps[0].type === 'UP' && steps[1].type === 'SPOUSE') return isMale ? "Ba" : "Mẹ";

    // 2.4 Cô Dì Chú Bác (Me -> Parent -> Grandparent -> Uncle/Aunt)
    if (steps.length === 3 && steps[0].type === 'UP' && steps[1].type === 'UP' && steps[2].type === 'DOWN') {
      const parentId = steps[0].toId;
      const parent = people.find(p => p.id === parentId);
      const uncleAuntId = steps[2].toId;
      const uncleAunt = people.find(p => p.id === uncleAuntId);

      if (parent && uncleAunt) {
        const side = parent.gender === 'male' ? 'PATERNAL' : 'MATERNAL';
        const seniority = compareAge(uncleAunt, parent);

        if (side === 'PATERNAL') {
          if (seniority === 'older') return "Bác";
          if (seniority === 'younger') return uncleAunt.gender === 'male' ? "Chú" : "Cô";
          return uncleAunt.gender === 'male' ? "Bác/Chú" : "Bác/Cô";
        } else {
          if (seniority === 'older') return "Bác";
          if (seniority === 'younger') return uncleAunt.gender === 'male' ? "Cậu" : "Dì";
          return uncleAunt.gender === 'male' ? "Bác/Cậu" : "Bác/Dì";
        }
      }
    }

    // 2.5 Dượng / Thím / Mợ / Bác gái (Spouse of Uncle/Aunt)
    if (steps.length === 4 && steps[3].type === 'SPOUSE') {
      const parentId = steps[0].toId;
      const parent = people.find(p => p.id === parentId);
      const uncleAuntId = steps[2].toId;
      const uncleAunt = people.find(p => p.id === uncleAuntId);

      if (parent && uncleAunt) {
        const side = parent.gender === 'male' ? 'PATERNAL' : 'MATERNAL';
        const seniority = compareAge(uncleAunt, parent);

        if (side === 'PATERNAL') {
          if (seniority === 'older') return "Bác";
          if (seniority === 'younger') {
            return uncleAunt.gender === 'male' ? "Thím" : "Dượng";
          }
        } else {
          if (seniority === 'older') return "Bác";
          if (seniority === 'younger') {
            return uncleAunt.gender === 'male' ? "Mợ" : "Dượng";
          }
        }
      }
      return isMale ? "Dượng" : "Thím/Mợ";
    }

    return "Bác/Chú/Cô";
  }

  // 3. Cách -1 đời (Con cháu)
  if (genDelta === -1) {
    if (steps.length === 2 && steps[0].type === 'DOWN' && steps[1].type === 'SPOUSE') return isMale ? "Con rể" : "Con dâu";
    if (steps.length === 1 && steps[0].type === 'DOWN') return isMale ? "Con trai" : "Con gái";
    if (steps.length === 2 && steps[0].type === 'SPOUSE' && steps[1].type === 'DOWN') return isMale ? "Con trai" : "Con gái";
    return "Cháu";
  }

  // 4. Cách 2 đời (Ông bà)
  if (genDelta === 2) {
    const isLateral = steps.some(s => s.type === 'DOWN');
    const parentId = steps[0].toId;
    const parent = people.find(p => p.id === parentId);
    const side = parent?.gender === 'male' ? 'PATERNAL' : 'MATERNAL';

    if (isLateral) {
      if (steps.length >= 3 && steps[0].type === 'UP' && steps[1].type === 'UP') {
        const grandparentId = steps[1].toId;
        const lateralRelativeId = steps[steps.length - 1].toId;
        const grandParent = people.find(p => p.id === grandparentId);
        const lateralRelative = people.find(p => p.id === lateralRelativeId);

        if (grandParent && lateralRelative) {
          const seniority = compareAge(lateralRelative, grandParent);
          if (side === 'PATERNAL') {
            if (seniority === 'older') return isMale ? "Ông bác" : "Bà bác";
            return isMale ? "Ông chú" : "Bà cô";
          } else {
            if (seniority === 'older') return isMale ? "Ông bác" : "Bà bác";
            return isMale ? "Ông cậu" : "Bà dì";
          }
        }
      }
      return isMale ? "Ông chú/bác" : "Bà cô/dì";
    }

    if (side === 'MATERNAL') return isMale ? "Ông ngoại" : "Bà ngoại";
    return isMale ? "Ông nội" : "Bà nội";
  }

  if (genDelta === -2) return "Cháu nội/ngoại";
  if (genDelta === 3) return isMale ? "Cụ ông" : "Cụ bà";
  if (genDelta === -3) return "Chắt";

  return genDelta > 0 ? "Tiền bối" : "Hậu duệ";
};
