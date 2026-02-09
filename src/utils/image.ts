/**
 * Tiện ích xử lý hình ảnh
 */

/**
 * Nén và resize ảnh sử dụng Canvas
 * @param file File ảnh gốc
 * @param options Tùy chọn nén: maxWidth (mặc định 800), quality (0.1 - 1.0, mặc định 0.7)
 * @returns Promise trả về chuỗi Base64 của ảnh đã nén
 */
export const compressImage = (file: File, options: { maxWidth?: number; quality?: number } = {}): Promise<string> => {
    return new Promise((resolve, reject) => {
        const { maxWidth = 800, quality = 0.7 } = options;
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Tính toán tỷ lệ resize
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Xuất ra Base64 JPEG với chất lượng giảm
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };

            img.onerror = (err) => reject(err);
        };

        reader.onerror = (err) => reject(err);
    });
};

/**
 * Các URL avatar từ mock data cũ hoặc không mong muốn
 */
const BANNED_URLS = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    'https://ui-avatars.com',
];

// Fallback landscape image (using a reliable source)
// Random mountain view from Unsplash Source
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&fit=crop';

export const getSafeAvatarUrl = (url?: string, name?: string): string => {
    if (!url) return FALLBACK_IMAGE;

    // Check if URL is banned
    if (BANNED_URLS.some(banned => url.includes(banned))) {
        return FALLBACK_IMAGE;
    }

    // Check for broken links (basic check)
    // Here we can't really async check, so we rely on UI onError fallback, 
    // but we can filter obvious bad strings.

    return url;
};
