
import React from 'react';
import { X, Edit2, Share2, Save, RotateCcw, Eye, EyeOff, UserCheck, UserPlus } from 'lucide-react';
import { Person } from '@/types/types';
import { useAppStore } from '@/store/store';
import { getSafeAvatarUrl } from '@/utils/image';

interface SheetHeaderProps {
  person: Person;
  formData: Partial<Person>;
  isEditing: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onFieldChange: (field: keyof Person, value: any) => void;
}

const SheetHeader: React.FC<SheetHeaderProps> = ({
  person,
  formData,
  isEditing,
  onClose,
  onEdit,
  onSave,
  onCancel,
  onFieldChange
}) => {
  const { meId, setMe } = useAppStore();
  const isMe = meId === person.id;

  const isAlive = isEditing ? (formData.isAlive ?? true) : person.isAlive;
  const currentAvatarUrl = isEditing ? (formData.avatarUrl || person.avatarUrl) : person.avatarUrl;

  const displayAvatar = getSafeAvatarUrl(currentAvatarUrl, person.fullName);

  // Handle Image Upload with Compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      // Import dynamic để tránh load code khi không cần
      const { compressImage } = await import('@/utils/image');
      const compressedBase64 = await compressImage(file, { maxWidth: 600, quality: 0.6 });
      onFieldChange('avatarUrl', compressedBase64);
    } catch (error) {
      console.error("Compression failed:", error);
      alert("Lỗi khi xử lý ảnh");
    }
  };

  return (
    <>
      {/* Cover Image Container */}
      <div className="relative h-56 w-full overflow-hidden">
        <img
          src={displayAvatar}
          className={`w-full h-full object-cover opacity-90 transition-all duration-500 ${!isAlive ? 'grayscale' : ''}`}
          alt="Cover"
        />

        {/* Gradients */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-black/40 to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-paper-bg to-transparent z-10"></div>

        {/* Nút Đóng (Góc trên phải) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all active:scale-90 z-20 border border-stone-200"
        >
          <X size={20} className="text-stone-800" />
        </button>

        {/* Nút Xác nhận là tôi (Di chuyển lên góc trên trái) */}
        {!isEditing && (
          <button
            onClick={() => setMe(isMe ? null : person.id)}
            className={`
              absolute top-4 left-4 h-10 px-4 rounded-full text-[9px] font-black uppercase tracking-widest 
              flex items-center gap-2 transition-all shadow-xl backdrop-blur-md z-20 border
              ${isMe
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-white/90 text-stone-800 border-white hover:bg-white'}
              active:scale-95
            `}
          >
            {isMe ? <UserCheck size={14} className="animate-pulse" /> : <UserPlus size={14} />}
            <span>{isMe ? "Bạn là người này" : "Đây là tôi"}</span>
          </button>
        )}
      </div>

      {/* Avatar & Controls Section */}
      <div className="-mt-16 relative px-6 pb-4 z-30">
        <div className="flex justify-between items-end mb-6">
          <div className="relative group">
            {/* Avatar Circle */}
            <div className={`
              relative w-32 h-32 rounded-full border-[6px] border-paper-bg shadow-2xl overflow-hidden bg-white 
              transition-all duration-500 
              ${!isAlive ? 'grayscale contrast-110' : ''} 
              ${isMe ? 'ring-4 ring-blue-500/30' : ''}
              ${isEditing ? 'cursor-pointer hover:brightness-90' : ''}
            `}
              onClick={() => isEditing && document.getElementById('avatar-upload')?.click()}
            >
              <img
                src={displayAvatar}
                className="w-full h-full object-cover"
                alt="Avatar"
              />
              {/* Overlay Icon Edit */}
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                    <Edit2 size={24} className="text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Hidden Input File */}
            {isEditing && (
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            )}

            {/* Trạng thái sống/mất khi Edit */}
            {isEditing && (
              <button
                onClick={() => onFieldChange('isAlive', !isAlive)}
                className={`absolute bottom-1 right-1 p-2.5 rounded-full border-4 border-paper-bg shadow-lg transition-all active:scale-90 z-40 ${isAlive ? 'bg-white text-stone-600' : 'bg-stone-800 text-white'}`}
                title={isAlive ? "Đánh dấu đã mất" : "Đánh dấu còn sống"}
              >
                {isAlive ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 mb-2">
            {isEditing ? (
              <>
                <button
                  onClick={onCancel}
                  className="p-3.5 bg-white rounded-2xl text-stone-400 shadow-md border border-stone-100 active:scale-90 transition-transform"
                >
                  <RotateCcw size={20} />
                </button>
                <button
                  onClick={onSave}
                  className="p-3.5 bg-heritage-red rounded-2xl text-white shadow-xl shadow-heritage-red/20 active:scale-90 transition-transform"
                >
                  <Save size={20} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onEdit}
                  className="p-3.5 bg-white rounded-2xl text-stone-600 shadow-md border border-stone-100 active:scale-90 transition-transform"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  className="p-3.5 bg-white rounded-2xl text-stone-600 shadow-md border border-stone-100 active:scale-90 transition-transform"
                >
                  <Share2 size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SheetHeader;
