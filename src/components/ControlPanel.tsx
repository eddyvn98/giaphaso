
import React, { useState, useMemo } from 'react';
import { Search, Maximize, Users, Crown, ChevronDown, X, GitBranch, Plus } from 'lucide-react';
import { useAppStore } from '@/store/store';

interface ControlPanelProps {
  onFitView: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onFitView }) => {
  const {
    people, selectPerson, getStats, toggleRouteMode,
    isRouteMode, visibleGenerations, showMoreGenerations
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const stats = getStats();
  const filteredPeople = people.filter(p =>
    searchTerm && p.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Kiểm tra xem có còn đời nào chưa hiện không
  const hasMoreGenerations = useMemo(() => {
    return stats.generations > visibleGenerations;
  }, [stats.generations, visibleGenerations]);

  return (
    <>
      {/* Nút Tra cứu lộ trình (Góc trên phải) */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => toggleRouteMode(!isRouteMode)}
          className={`p-4 rounded-full shadow-2xl transition-all active:scale-90 border-2 ${isRouteMode ? 'bg-heritage-red text-white border-red-400' : 'bg-white text-stone-700 border-white hover:bg-stone-50'}`}
        >
          <GitBranch size={22} className={isRouteMode ? "animate-pulse" : ""} />
        </button>
      </div>

      {/* Thanh tìm kiếm (Phía trên) */}
      <div className="absolute top-4 left-4 right-20 z-10 md:w-96 md:left-6">
        <div className="relative shadow-2xl rounded-full bg-white/98 backdrop-blur-md border border-stone-200">
          <input
            type="text"
            placeholder="Tìm danh tính dòng họ..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
            className="w-full pl-12 pr-4 py-4 rounded-full border-none outline-none bg-transparent text-base text-stone-800 placeholder:text-stone-400 font-serif"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={22} />

          {showResults && searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[50vh] overflow-y-auto border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
              {filteredPeople.length > 0 ? filteredPeople.map(p => (
                <div
                  key={p.id}
                  onClick={() => { selectPerson(p.id); setSearchTerm(''); setShowResults(false); }}
                  className="px-6 py-4 hover:bg-stone-50 border-b border-stone-50 cursor-pointer flex items-center gap-4 active:bg-stone-100"
                >
                  <img src={p.avatarUrl} className="w-11 h-11 rounded-full object-cover border-2 border-stone-100 shadow-sm" alt="" />
                  <div>
                    <p className="text-base font-bold text-stone-800 font-serif">{p.fullName}</p>
                    <p className="text-[10px] uppercase tracking-widest text-heritage-gold font-bold">{p.branch || 'Hậu duệ'}</p>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-8 text-center text-stone-400 font-serif italic">Không tìm thấy danh tính</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nút Thống kê (Phía dưới tìm kiếm) */}
      <div className="absolute top-20 left-4 z-10 md:left-6">
        {showStats ? (
          <div className="bg-heritage-red p-4 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-white w-48 border border-white/20 animate-in fade-in slide-in-from-left-6 duration-500 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-heritage-gold rounded-full animate-ping"></div>
                <h4 className="font-serif font-bold text-[10px] uppercase tracking-[0.15em] text-heritage-gold">Bảng Vàng</h4>
              </div>
              <button onClick={() => setShowStats(false)} className="bg-white/10 p-1 rounded-full hover:bg-white/20 transition-colors">
                <X size={12} />
              </button>
            </div>
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-heritage-gold"><Crown size={14} /></div>
                <div>
                  <p className="text-white/50 text-[8px] uppercase font-bold tracking-widest mb-0.5">Phả hệ duy trì</p>
                  <p className="text-base font-serif font-bold text-white">{stats.generations} Đời</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white"><Users size={14} /></div>
                <div>
                  <p className="text-white/50 text-[8px] uppercase font-bold tracking-widest mb-0.5">Tổng nhân khẩu</p>
                  <p className="text-base font-serif font-bold text-white">{stats.total} Người</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowStats(true)}
            className="bg-heritage-red/95 backdrop-blur-md p-3 rounded-full shadow-2xl text-white hover:bg-heritage-red flex items-center gap-2 px-4 border border-white/10 group active:scale-95"
          >
            <Users size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Thống kê</span>
          </button>
        )}
      </div>

      {/* NÚT MỞ RỘNG PHẢ HỆ (TRUNG TÂM PHÍA DƯỚI) */}
      {hasMoreGenerations && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <button
            onClick={showMoreGenerations}
            className="bg-heritage-gold text-white px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(176,141,62,0.4)] flex items-center gap-3 border-2 border-white hover:scale-105 transition-all active:scale-95 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-xs font-black uppercase tracking-widest">Xem tiếp đời thứ {visibleGenerations + 1}</span>
            <ChevronDown size={18} className="animate-bounce" />
          </button>
          <p className="text-[9px] text-heritage-gold/60 font-black uppercase tracking-[0.2em]">Khám phá thêm lịch sử</p>
        </div>
      )}

      {/* Nút Zoom Fit (Góc dưới phải) */}
      <div className="absolute bottom-8 right-6 flex flex-col gap-4 z-10">
        <button
          onClick={onFitView}
          className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full shadow-2xl flex items-center justify-center text-heritage-red hover:bg-heritage-red hover:text-white transition-all border border-stone-200 active:scale-90"
        >
          <Maximize size={24} />
        </button>
      </div>
    </>
  );
};

export default ControlPanel;
