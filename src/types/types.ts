
export type Gender = 'male' | 'female' | 'other';
export type DateType = 'solar' | 'lunar';
export type NodeType = 'root' | 'spouse' | 'blood';

export interface DateInfo {
  date: string; // ISO string YYYY-MM-DD
  type: DateType;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Person {
  id: string;
  fullName: string;
  gender: Gender;
  dob?: DateInfo; // Date of Birth
  dod?: DateInfo; // Date of Death (if applicable)
  isAlive: boolean;
  avatarUrl?: string;
  bio?: string;
  branch?: string; // Chi/Phái
  burialLocation?: Coordinates;
  burialAddress?: string;
  order?: number; // Con thứ mấy
  images: string[];
}

export interface Relationship {
  id: string;
  source: string; // Parent ID
  target: string; // Child ID
  type: 'blood' | 'spouse' | 'adopted';
  label?: string;
}

// React Flow Types
export interface FamilyNodeData {
  person: Person;
  isRoot?: boolean;
  spouseId?: string; 
  onNodeClick: (id: string) => void; // Dùng cho zoom
  onAvatarClick: (id: string) => void; // Dùng cho xem chi tiết
  onEditClick: (id: string) => void; // Dùng cho chỉnh sửa
  onAddClick: (id: string, type: 'parent' | 'spouse' | 'child') => void;
  onDeleteClick: (id: string) => void; // Thêm chức năng xóa
}
