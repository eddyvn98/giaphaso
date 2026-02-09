
import React, { memo, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ShieldCheck, UserCircle, Heart, Crown, Plus, Trash2, Users } from 'lucide-react';
import { useAppStore } from '../store';
import { getKinshipTerm } from '../utils/kinship';

const CustomNode = ({ data }: NodeProps<any>) => {
  const { person, onNodeClick, onAvatarClick, onAddClick, onDeleteClick, isHighlighted } = data;
  const { meId, people, relationships } = useAppStore();
  
  const isMe = meId === person.id;
  const isDeceased = !person.isAlive;
  const isMale = person.gender === 'male';

  const kinship = useMemo(() => {
    if (!meId || isMe) return null;
    return getKinshipTerm(meId, person.id, people, relationships);
  }, [meId, person.id, people, relationships, isMe]);

  const borderColor = isDeceased ? 'border-[#B08D3E]' : (isMale ? 'border-[#1E3A8A]' : 'border-[#9D174D]');
  const headerBg = isDeceased ? 'bg-[#B08D3E]' : (isMale ? 'bg-[#1E3A8A]' : 'bg-[#9D174D]');

  return (
    <div className="relative flex flex-col items-center group touch-none">
       
       {/* CỔNG KẾT NỐI (HANDLES) - QUY ƯỚC CHUẨN */}
       <Handle type="target" position={Position.Top} id="top" className="!bg-heritage-red !w-2 !h-2 !border-2 !border-white !-top-1 z-50" />
       <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-heritage-red !w-2 !h-2 !border-2 !border-white !-bottom-1 z-50" />
       <Handle type="source" position={Position.Right} id="right" className="!bg-heritage-gold !w-2 !h-2 !border-2 !border-white !-right-1 z-50" />
       <Handle type="target" position={Position.Left} id="left" className="!bg-heritage-gold !w-2 !h-2 !border-2 !border-white !-left-1 z-50" />

       {/* NHÓM NÚT CHỨC NĂNG (QUICK ACTIONS) */}
       <div className="absolute inset-0 z-[60] pointer-events-none">
          {/* Thêm Cha Mẹ (TRÊN) */}
          <button 
            onClick={(e) => { e.stopPropagation(); onAddClick(person.id, 'parent'); }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 p-2 bg-white border border-stone-200 rounded-full shadow-xl text-heritage-red opacity-0 group-hover:opacity-100 transition-all hover:scale-125 pointer-events-auto"
            title="Thêm Cha/Mẹ"
          >
            <Plus size={14} strokeWidth={3} />
          </button>

          {/* Thêm Con cái (DƯỚI) */}
          <button 
            onClick={(e) => { e.stopPropagation(); onAddClick(person.id, 'child'); }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 p-2 bg-white border border-stone-200 rounded-full shadow-xl text-heritage-red opacity-0 group-hover:opacity-100 transition-all hover:scale-125 pointer-events-auto"
            title="Thêm Con"
          >
            <Plus size={14} strokeWidth={3} />
          </button>

          {/* Thêm Vợ/Chồng (PHẢI) */}
          <button 
            onClick={(e) => { e.stopPropagation(); onAddClick(person.id, 'spouse'); }}
            className="absolute top-1/2 -right-8 -translate-y-1/2 p-2 bg-white border border-stone-200 rounded-full shadow-xl text-heritage-gold opacity-0 group-hover:opacity-100 transition-all hover:scale-125 pointer-events-auto"
            title="Thêm Vợ/Chồng"
          >
            <Users size={14} strokeWidth={3} />
          </button>

          {/* Xóa thành viên (GÓC TRÊN TRÁI) */}
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteClick(person.id); }}
            className="absolute -top-2 -left-8 p-2 bg-white border border-red-100 rounded-full shadow-xl text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-125 pointer-events-auto"
            title="Xóa thành viên"
          >
            <Trash2 size={12} />
          </button>
       </div>

       {/* Nhãn vai vế & TÔI */}
       <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1">
          {isMe && (
            <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl border-2 border-white animate-bounce flex items-center gap-2">
               <UserCircle size={12} /> TÔI
            </div>
          )}
          {kinship && (
            <div className="bg-white border border-stone-200 px-3 py-1 rounded-full shadow-xl flex items-center gap-1.5 whitespace-nowrap">
               <Heart size={10} fill="#741B1B" className="text-heritage-red" />
               <span className="text-[10px] font-black uppercase tracking-widest text-heritage-red">{kinship}</span>
            </div>
          )}
       </div>

      <div 
        onClick={() => onNodeClick(person.id)}
        className={`
          relative w-[140px] h-[190px] bg-white rounded-2xl
          transition-all duration-500 ease-out
          border-[2px] ${borderColor}
          flex flex-col overflow-hidden cursor-pointer
          ${isHighlighted ? 'scale-105 shadow-[0_0_30px_rgba(176,141,62,0.4)] ring-4 ring-heritage-gold/20' : 'shadow-xl'}
          ${isDeceased ? 'opacity-90 grayscale-[0.3]' : 'opacity-100'}
        `}
      >
        <div className={`h-4 w-full ${headerBg} flex items-center justify-center`}>
             <ShieldCheck size={10} className="text-white/80" />
        </div>

        <div className="flex flex-col items-center p-4 flex-grow bg-gradient-to-b from-white to-stone-50/30">
            <div 
              onClick={(e) => { e.stopPropagation(); onAvatarClick(person.id); }}
              className={`
                w-20 h-20 rounded-2xl p-0.5 bg-white shadow-inner border-[1.5px] ${borderColor} overflow-hidden transform transition-transform duration-500 group-hover:scale-110
                ${isDeceased ? 'grayscale' : ''}
            `}>
                <img 
                    src={person.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.fullName)}&background=random&size=200`} 
                    alt={person.fullName} 
                    className="w-full h-full rounded-xl object-cover"
                />
            </div>
            
            <div className="text-center w-full mt-3">
                <h3 className="font-serif font-black text-[12px] leading-tight text-stone-900 mb-1 line-clamp-2">
                    {person.fullName}
                </h3>
                <div className="flex items-center justify-center gap-1 opacity-40">
                  <Crown size={8} />
                  <p className="text-[9px] font-sans uppercase tracking-[0.1em] font-black">
                    Đời thứ {person.order || '?'}
                  </p>
                </div>
            </div>
        </div>
      </div>
      <div className="absolute -bottom-2 w-[80%] h-4 bg-black/5 blur-xl -z-10 rounded-full"></div>
    </div>
  );
};

export default memo(CustomNode);
