import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ShieldCheck, UserCircle, Heart, Plus, Trash2, Users } from 'lucide-react';
import { useAppStore } from '@/store/store';
import { getSafeAvatarUrl } from '@/utils/image';

const CustomNode = ({ data }: NodeProps<any>) => {
  const { person, onNodeClick, onAvatarClick, onAddClick, onDeleteClick, isHighlighted, kinship } = data;
  const meId = useAppStore(state => state.meId);
  const interactionNodeId = useAppStore(state => state.interactionNodeId);
  const setInteractionNodeId = useAppStore(state => state.setInteractionNodeId);

  const isMe = meId === person.id;
  const isDeceased = !person.isAlive;
  const isMale = person.gender === 'male';

  const showActions = interactionNodeId === person.id;

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (interactionNodeId !== person.id) {
      setInteractionNodeId(person.id);
      onNodeClick(person.id);
    } else {
      onAvatarClick(person.id);
    }
  };

  const mainColor = isDeceased ? '#B08D3E' : (isMale ? '#1E3A8A' : '#9D174D');
  const borderColorClass = isDeceased ? 'border-[#B08D3E]' : (isMale ? 'border-[#1E3A8A]' : 'border-[#9D174D]');

  const level = data?.level || 1;
  const scale = Math.max(0.85, 1 - (level - 1) * 0.05);
  const opacity = level <= 2 ? 1 : 0.9;

  return (
    <div
      className="relative flex flex-col items-center group touch-none"
      style={{
        transform: `scale(${scale})`,
        opacity: opacity,
        transformOrigin: 'top center',
        transition: 'opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
        willChange: 'transform, opacity'
      }}
    >
      <Handle type="target" position={Position.Top} id="top" className="!bg-heritage-red !w-2 !h-2 !border-2 !border-white !-top-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-heritage-red !w-2 !h-2 !border-2 !border-white !-bottom-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-heritage-gold !w-2 !h-2 !border-2 !border-white !-right-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-heritage-gold !w-2 !h-2 !border-2 !border-white !-left-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* MAIN CARD */}
      <div
        onClick={handleNodeClick}
        className={`
          relative w-[150px] h-[220px] rounded-2xl overflow-hidden cursor-pointer
          transition-all duration-300 ease-out bg-stone-900 group-hover:shadow-2xl
          border-[1.5px] ${borderColorClass}
          ${(isHighlighted || showActions) ? 'scale-105 shadow-[0_0_30px_rgba(176,141,62,0.4)] ring-2 ring-heritage-gold/50' : 'shadow-md'}
          ${isDeceased ? 'grayscale' : ''}
        `}
      >
        <img
          src={getSafeAvatarUrl(person.avatarUrl, person.fullName)}
          alt={person.fullName}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&fit=crop";
          }}
        />

        <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

        <div className="absolute bottom-0 left-0 right-0 p-3 text-white pointer-events-none">
          <h3 className="font-serif font-bold text-[14px] leading-tight mb-1 text-shadow-sm">
            {person.fullName}
          </h3>

          <div className="flex flex-col gap-0.5 opacity-90">
            <div className="flex items-center gap-1">
              {isDeceased && <ShieldCheck size={10} />}
              <span className="text-[10px] font-sans uppercase tracking-wider font-bold text-heritage-gold">
                {person.branch ? person.branch : `Đời thứ ${level}`}
              </span>
            </div>
            {person.order && data.isBloodMember && (
              <span className="text-[9px] font-sans uppercase tracking-tight opacity-70">
                Con thứ {person.order}
              </span>
            )}
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 h-[3px] w-full opacity-60"
          style={{ backgroundColor: mainColor }}
        />
      </div>

      {/* BADGES */}
      <div className="absolute -top-3 right-[-10px] z-50 flex flex-col items-end gap-1">
        {isMe && (
          <div className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg border border-white flex items-center gap-1">
            <UserCircle size={10} /> TÔI
          </div>
        )}
        {kinship && (
          <div className="bg-white border border-stone-200 px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap">
            <Heart size={8} fill="#741B1B" className="text-heritage-red" />
            <span className="text-[9px] font-bold uppercase text-heritage-red">{kinship}</span>
          </div>
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div className="absolute inset-0 z-[110] pointer-events-none">
        <button
          onClick={(e) => { e.stopPropagation(); onAddClick(person.id, 'parent'); }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`absolute -top-12 left-1/2 -translate-x-1/2 p-2 bg-white border border-stone-200 rounded-full shadow-xl text-heritage-red transition-all duration-300 pointer-events-auto hover:bg-red-50 hover:scale-110 flex flex-col items-center gap-1 ${showActions ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-8 pointer-events-none'}`}
        >
          <Plus size={16} strokeWidth={3} />
          {showActions && <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[8px] font-bold bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-stone-100 whitespace-nowrap text-stone-700">Ba/Mẹ</span>}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onAddClick(person.id, 'child'); }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`absolute -bottom-14 left-1/2 -translate-x-1/2 p-2 bg-white border border-stone-200 rounded-full shadow-xl text-heritage-red transition-all duration-300 pointer-events-auto hover:bg-red-50 hover:scale-110 flex flex-col items-center gap-1 ${showActions ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 -translate-y-8 pointer-events-none'}`}
        >
          <Plus size={16} strokeWidth={3} />
          {showActions && <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[8px] font-bold bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-stone-100 whitespace-nowrap text-stone-700">Con</span>}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onAddClick(person.id, 'spouse'); }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`absolute top-1/2 -right-12 -translate-y-1/2 p-2 bg-white border border-stone-200 rounded-full shadow-xl text-heritage-gold transition-all duration-300 pointer-events-auto hover:bg-amber-50 hover:scale-110 ${showActions ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-50 -translate-x-8 pointer-events-none'}`}
        >
          <Users size={16} strokeWidth={3} />
          {showActions && <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[8px] font-bold bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-stone-100 whitespace-nowrap text-stone-700">Vợ/Chồng</span>}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onAddClick(person.id, 'sibling'); }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`absolute top-1/2 -left-12 -translate-y-1/2 p-2 bg-white border border-stone-200 rounded-full shadow-xl text-blue-600 transition-all duration-300 pointer-events-auto hover:bg-blue-50 hover:scale-110 ${showActions ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-50 translate-x-8 pointer-events-none'}`}
        >
          <Plus size={16} strokeWidth={3} />
          {showActions && <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[8px] font-bold bg-white/90 px-1.5 py-0.5 rounded shadow-sm border border-stone-100 whitespace-nowrap text-stone-700">Anh/Em</span>}
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onDeleteClick(person.id); }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`absolute -top-4 -left-4 p-2 bg-white border border-red-100 rounded-full shadow-xl text-red-500 transition-all duration-300 pointer-events-auto hover:bg-red-50 hover:scale-110 ${showActions ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}
        >
          <Trash2 size={14} />
          {showActions && <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[8px] font-bold text-red-500 whitespace-nowrap">Xóa</span>}
        </button>
      </div>
    </div>
  );
};

export default memo(CustomNode);
