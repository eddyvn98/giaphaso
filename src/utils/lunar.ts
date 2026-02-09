
import { DateInfo } from '../types';

const THIEN_CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const DIA_CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

/**
 * Tính toán năm Can Chi dựa trên năm Dương lịch
 */
export const getZodiacYear = (year: number): string => {
  if (!year || isNaN(year)) return '';
  const canIndex = (year - 4) % 10;
  const chiIndex = (year - 4) % 12;
  return `${THIEN_CAN[canIndex < 0 ? canIndex + 10 : canIndex]} ${DIA_CHI[chiIndex < 0 ? chiIndex + 12 : chiIndex]}`;
};

/**
 * Định dạng ngày hiển thị bao gồm cả con giáp và đối chiếu lịch
 * Lưu ý: Trong thực tế nên dùng thư viện 'lunar-javascript' để chuyển đổi chính xác.
 * Ở đây chúng ta mô phỏng logic hiển thị song song.
 */
export const formatDate = (dateInfo?: DateInfo): string => {
  if (!dateInfo || !dateInfo.date) return 'Chưa cập nhật';
  
  const dateObj = new Date(dateInfo.date);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const zodiac = getZodiacYear(year);
  
  const mainDate = `${day}/${month}/${year}`;
  
  if (dateInfo.type === 'lunar') {
    return `${mainDate} (Âm lịch - Năm ${zodiac})`;
  }
  return `${mainDate} (Dương lịch - Năm ${zodiac})`;
};

/**
 * Trả về thông tin ngày đối chiếu (Mô phỏng)
 */
export const getComplementaryDate = (dateInfo?: DateInfo): string => {
    if (!dateInfo || !dateInfo.date) return '';
    const dateObj = new Date(dateInfo.date);
    
    // Giả định lệch 1 tháng/vài ngày để minh họa đối chiếu AL/DL
    const altDate = new Date(dateObj);
    if (dateInfo.type === 'solar') {
        altDate.setMonth(altDate.getMonth() - 1);
        altDate.setDate(altDate.getDate() - 2);
        return `${altDate.getDate().toString().padStart(2, '0')}/${(altDate.getMonth() + 1).toString().padStart(2, '0')}/${altDate.getFullYear()} (Âm lịch)`;
    } else {
        altDate.setMonth(altDate.getMonth() + 1);
        altDate.setDate(altDate.getDate() + 2);
        return `${altDate.getDate().toString().padStart(2, '0')}/${(altDate.getMonth() + 1).toString().padStart(2, '0')}/${altDate.getFullYear()} (Dương lịch)`;
    }
};
