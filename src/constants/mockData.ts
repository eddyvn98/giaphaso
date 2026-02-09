
import { Person, Relationship } from '@/types/types';

export const MOCK_PEOPLE: Person[] = [
  // THẾ HỆ 1: ĐỜI CỐ
  {
    id: 'co-ong',
    fullName: 'Hà Văn Tải',
    gender: 'male',
    isAlive: false,
    order: 1,
    branch: 'Thủy Tổ',
    images: [],
  },
  {
    id: 'co-ba',
    fullName: 'Nguyễn Thị Thôi',
    gender: 'female',
    isAlive: false,
    order: 1,
    images: [],
  },

  // THẾ HỆ 2: ÔNG BÀ NỘI
  {
    id: 'ong-noi',
    fullName: 'Hà Minh Tài',
    gender: 'male',
    isAlive: false,
    order: 2,
    images: [],
  },
  {
    id: 'ba-noi',
    fullName: 'Đặng Thị Mi',
    gender: 'female',
    isAlive: false,
    order: 2,
    images: [],
  },

  // THẾ HỆ 3: CON CỦA ÔNG BÀ NỘI
  { id: 'bac-hai', fullName: 'Hà Minh Thanh', gender: 'male', isAlive: true, order: 3, branch: 'Chi Hai', images: [] },
  { id: 'co-ba-minh-tam', fullName: 'Hà Thị Minh Tâm', gender: 'female', isAlive: true, order: 3, branch: 'Chi Ba', images: [] },
  { id: 'chong-co-ba', fullName: 'Nguyễn Như Sơn', gender: 'male', isAlive: true, order: 3, images: [] },
  { id: 'co-tu', fullName: 'Hà Thị Minh Thu', gender: 'female', isAlive: true, order: 3, branch: 'Chi Tư', images: [] },
  { id: 'chong-co-tu', fullName: 'Lê Văn Nam', gender: 'male', isAlive: true, order: 3, images: [] },
  { id: 'bac-nam', fullName: 'Hà Minh Trúc', gender: 'male', isAlive: true, order: 3, branch: 'Chi Năm', images: [] },
  { id: 'ba-minh-trung', fullName: 'Hà Minh Trung', gender: 'male', isAlive: true, order: 3, branch: 'Chi Sáu', images: [] },
  { id: 'me-van', fullName: 'Phạm Thị Vân', gender: 'female', isAlive: true, order: 3, images: [] },
  { id: 'chu-bay', fullName: 'Hà Minh Trang', gender: 'male', isAlive: true, order: 3, branch: 'Chi Bảy', images: [] },
  { id: 'vo-chu-bay', fullName: 'Trương Thúy Kiều', gender: 'female', isAlive: true, order: 3, images: [] },
  { id: 'chu-ut', fullName: 'Hà Minh Mẫn', gender: 'male', isAlive: true, order: 3, branch: 'Chi Út', images: [] },

  // THẾ HỆ 4: CHÁU
  { id: 'chau-ba-1', fullName: 'Nguyễn Hà Như Bảo', gender: 'male', isAlive: true, order: 4, images: [] },
  { id: 'chau-ba-2', fullName: 'Nguyễn Hà Như Hải', gender: 'male', isAlive: true, order: 4, images: [] },
  { id: 'chau-tu-1', fullName: 'Lê Hà Việt Chương', gender: 'male', isAlive: true, order: 4, images: [] },
  { id: 'chau-tu-2', fullName: 'Lê Hà Minh Hiền', gender: 'female', isAlive: true, order: 4, images: [] },
  { id: 'chau-sau-1', fullName: 'Hà Thanh Tú', gender: 'male', isAlive: true, order: 4, images: [] },
  { id: 'chau-sau-3', fullName: 'Hà Thị Vân Anh', gender: 'female', isAlive: true, order: 4, images: [] },
  { id: 'chau-sau-2', fullName: 'Hà Minh Thông', gender: 'male', isAlive: true, order: 4, images: [] },
  { id: 'chau-bay-1', fullName: 'Hà Minh Phúc', gender: 'male', isAlive: true, order: 4, images: [] },
  { id: 'chau-ut-1', fullName: 'Hà Minh Châu', gender: 'female', isAlive: true, order: 4, images: [] },
  { id: 'chau-ut-2', fullName: 'Hà Minh Ngân', gender: 'female', isAlive: true, order: 4, images: [] },
  { id: 'chau-ut-3', fullName: 'Hà Minh Luân', gender: 'male', isAlive: true, order: 4, images: [] },
];

export const MOCK_RELATIONSHIPS: Relationship[] = [
  // Đời Cố
  { id: 'r-co', source: 'co-ong', target: 'co-ba', type: 'spouse' },
  { id: 'r-noi-tu-co', source: 'co-ong', target: 'ong-noi', type: 'blood' },

  // Đời Ông Bà
  { id: 'r-ongba', source: 'ong-noi', target: 'ba-noi', type: 'spouse' },
  { id: 'r-con-1', source: 'ong-noi', target: 'bac-hai', type: 'blood' },
  { id: 'r-con-2', source: 'ong-noi', target: 'co-ba-minh-tam', type: 'blood' },
  { id: 'r-con-3', source: 'ong-noi', target: 'co-tu', type: 'blood' },
  { id: 'r-con-4', source: 'ong-noi', target: 'bac-nam', type: 'blood' },
  { id: 'r-con-5', source: 'ong-noi', target: 'ba-minh-trung', type: 'blood' },
  { id: 'r-con-6', source: 'ong-noi', target: 'chu-bay', type: 'blood' },
  { id: 'r-con-7', source: 'ong-noi', target: 'chu-ut', type: 'blood' },

  // Vợ chồng thế hệ 3
  { id: 'r-sp-ba', source: 'co-ba-minh-tam', target: 'chong-co-ba', type: 'spouse' },
  { id: 'r-sp-tu', source: 'co-tu', target: 'chong-co-tu', type: 'spouse' },
  { id: 'r-sp-sau', source: 'ba-minh-trung', target: 'me-van', type: 'spouse' },
  { id: 'r-sp-bay', source: 'chu-bay', target: 'vo-chu-bay', type: 'spouse' },

  // Thế hệ 4
  { id: 'r-ch-ba1', source: 'co-ba-minh-tam', target: 'chau-ba-1', type: 'blood' },
  { id: 'r-ch-ba2', source: 'co-ba-minh-tam', target: 'chau-ba-2', type: 'blood' },
  { id: 'r-ch-tu1', source: 'co-tu', target: 'chau-tu-1', type: 'blood' },
  { id: 'r-ch-tu2', source: 'co-tu', target: 'chau-tu-2', type: 'blood' },
  { id: 'r-ch-sau1', source: 'ba-minh-trung', target: 'chau-sau-1', type: 'blood' },
  { id: 'r-ch-sau2', source: 'ba-minh-trung', target: 'chau-sau-2', type: 'blood' },
  { id: 'r-ch-sau3', source: 'ba-minh-trung', target: 'chau-sau-3', type: 'blood' },
  { id: 'r-ch-bay1', source: 'chu-bay', target: 'chau-bay-1', type: 'blood' },
  { id: 'r-ch-ut1', source: 'chu-ut', target: 'chau-ut-1', type: 'blood' },
  { id: 'r-ch-ut2', source: 'chu-ut', target: 'chau-ut-2', type: 'blood' },
  { id: 'r-ch-ut3', source: 'chu-ut', target: 'chau-ut-3', type: 'blood' },
];
