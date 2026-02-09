
import { Person, Relationship } from '../types';

/**
 * Tìm đường đi ngắn nhất giữa 2 người
 */
export const findRelationshipPath = (
  startId: string,
  endId: string,
  relationships: Relationship[]
): string[] => {
  if (startId === endId) return [startId];
  const adj = new Map<string, string[]>();
  relationships.forEach(r => {
    if (!adj.has(r.source)) adj.set(r.source, []);
    if (!adj.has(r.target)) adj.set(r.target, []);
    adj.get(r.source)!.push(r.target);
    adj.get(r.target)!.push(r.source);
  });

  const queue: [string, string[]][] = [[startId, [startId]]];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const [current, path] = queue.shift()!;
    if (current === endId) return path;
    for (const neighbor of (adj.get(current) || [])) {
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
        // Xuống: from là cha/mẹ, to là con
        const term = to.gender === 'male' ? 'con trai' : 'con gái';
        result.push(`${to.fullName} là ${term} của ${from.fullName}`);
      } else {
        // Lên: to là cha/mẹ, from là con
        const term = to.gender === 'male' ? 'cha' : 'mẹ';
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
  relationships: Relationship[]
): string => {
  if (baseId === targetId) return "Tôi";
  const base = people.find(p => p.id === baseId);
  const target = people.find(p => p.id === targetId);
  if (!base || !target) return "";

  const path = findRelationshipPath(baseId, targetId, relationships);
  if (path.length < 2) return "Họ hàng";

  // Phân tích chuỗi quan hệ
  let genDelta = 0;
  let hasSpouseStep = false;
  let isLateral = false; // Quan hệ hàng ngang (anh em của cha mẹ)

  for (let i = 0; i < path.length - 1; i++) {
    const step = getStepType(path[i], path[i+1], relationships);
    if (step === 'UP') genDelta++;
    if (step === 'DOWN') genDelta--;
    if (step === 'SPOUSE') hasSpouseStep = true;
    
    // Nếu đi lên rồi đi xuống ngay -> Anh chị em hoặc Họ hàng hàng ngang
    if (i > 0) {
      const prevStep = getStepType(path[i-1], path[i], relationships);
      if (prevStep === 'UP' && step === 'DOWN') isLateral = true;
    }
  }

  const isMale = target.gender === 'male';

  // --- LOGIC QUY ĐỔI DANH XƯNG ---
  
  // 1. Cùng đời (Hàng ngang)
  if (genDelta === 0) {
    if (hasSpouseStep) return isMale ? "Chồng" : "Vợ";
    if (isLateral || path.length === 3) {
      // So sánh tuổi hoặc thứ tự sinh (order) nếu có
      if (target.order && base.order) {
        if (target.order < base.order) return isMale ? "Anh" : "Chị";
        return "Em";
      }
      return isMale ? "Anh/Em" : "Chị/Em";
    }
    return "Thân tộc";
  }

  // 2. Cách 1 đời (Bậc Cha/Chú/Cô/Dì/Cậu hoặc Con)
  if (genDelta === 1) {
    if (path.length === 2) return isMale ? "Cha" : "Mẹ"; // Trực hệ
    if (isLateral) {
      // Tìm xem là anh hay em của Cha/Mẹ thông qua node trung gian (Ông Bà)
      // Đây là logic đơn giản hóa cho Bác/Chú/Cô
      if (isMale) {
        // Nếu là anh của bố mẹ -> Bác, em -> Chú/Cậu
        return (target.order || 0) < 2 ? "Bác" : "Chú";
      }
      return "Cô/Dì";
    }
    return hasSpouseStep ? (isMale ? "Dượng" : "Thím/Mợ") : "Họ hàng";
  }

  if (genDelta === -1) return "Con cháu";

  // 3. Cách 2 đời (Bậc Ông/Bà hoặc Cháu)
  if (genDelta === 2) return isMale ? "Ông" : "Bà";
  if (genDelta === -2) return "Cháu";

  // 4. Cách 3 đời trở lên (Bậc Cụ hoặc Chắt)
  if (genDelta === 3) return isMale ? "Cụ" : "Cụ bà";
  if (genDelta === -3) return "Chắt";

  return genDelta > 0 ? "Tiền bối" : "Hậu duệ";
};
