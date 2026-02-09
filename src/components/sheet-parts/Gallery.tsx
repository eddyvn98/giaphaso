
import React from 'react';
import { Plus } from 'lucide-react';
import { Person } from '@/types/types';

interface GalleryProps {
  person: Person;
  isEditing: boolean;
}

const Gallery: React.FC<GalleryProps> = ({ person, isEditing }) => {
  if (isEditing) return null;

  return (
    <div className="mt-6 px-6 pb-12">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-serif font-bold text-stone-800 text-lg">Tư liệu hình ảnh</h3>
        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{(person.images?.length || 0)} ảnh</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {person.images && person.images.length > 0 ? (
          person.images.map((img, idx) => (
            <div key={idx} className="relative flex-shrink-0 group">
              <img src={img} className={`h-32 w-48 object-cover rounded-xl shadow-md border border-stone-100 group-hover:brightness-90 transition-all ${!person.isAlive ? 'grayscale' : ''}`} alt="Gallery" />
            </div>
          ))
        ) : (
          <div className="h-32 w-full bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center px-10 text-center">
            <p className="text-xs text-stone-400 italic font-serif">Chưa có tư liệu hình ảnh</p>
          </div>
        )}
        <button className="h-32 w-32 bg-stone-50 rounded-2xl flex flex-col items-center justify-center text-stone-400 flex-shrink-0 border-2 border-dashed border-stone-200 hover:bg-stone-100 transition-colors gap-2">
          <Plus size={24} />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Thêm tư liệu</span>
        </button>
      </div>
    </div>
  );
};

export default Gallery;
