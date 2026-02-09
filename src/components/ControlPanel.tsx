
import React, { useState, useMemo } from 'react';
import { Search, Maximize, Crown, ChevronDown, X, GitBranch, Plus, LocateFixed } from 'lucide-react';
import { useAppStore } from '@/store/store';
import { getSafeAvatarUrl } from '@/utils/image';

interface ControlPanelProps {
  onFitView: () => void;
  onLocateNode?: (id: string) => void;
  currentMaxLevel?: number;
}

// Utility for accent-insensitive search
const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onFitView, onLocateNode, currentMaxLevel }) => {
  const {
    people, selectPerson, getStats, toggleRouteMode,
    isRouteMode, visibleGenerations, showMoreGenerations,
    meId
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const stats = getStats();

  const filteredPeople = useMemo(() => {
    if (!searchTerm) return [];
    const lowerTerm = removeAccents(searchTerm.toLowerCase());
    return people.filter(p =>
      removeAccents(p.fullName.toLowerCase()).includes(lowerTerm) ||
      (p.branch && removeAccents(p.branch.toLowerCase()).includes(lowerTerm))
    );
  }, [people, searchTerm]);

  // Kiểm tra xem có còn đời nào chưa hiện không
  const hasMoreGenerations = useMemo(() => {
    return stats.generations > visibleGenerations;
  }, [stats.generations, visibleGenerations]);

  const handleLocateMe = () => {
    if (meId) {
      // selectPerson(meId); // Don't open sheet
      onLocateNode?.(meId); // Only zoom
    }
  };

  return (
    <>
      {/* 1. MỤC TÌM KIẾM - TOP CENTER */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-[90%] md:w-[500px]">
        <div className="relative group">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 transition-all group-hover:bg-white/80 group-focus-within:bg-white group-focus-within:shadow-2xl group-focus-within:scale-[1.02]"></div>
          <div className="relative flex items-center px-4 py-3 gap-3">
            <Search className="text-stone-400 group-focus-within:text-heritage-red transition-colors" size={20} />
            <input
              type="text"
              placeholder="Tìm người thân, dòng họ..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setShowResults(true); }}
              className="flex-1 bg-transparent border-none outline-none text-stone-800 placeholder:text-stone-400 font-medium text-sm"
            />
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); setShowResults(false); }} className="p-1 rounded-full hover:bg-stone-200 text-stone-400">
                <X size={14} />
              </button>
            )}
          </div>

          {/* RESULTS DROPDOWN */}
          {showResults && searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden max-h-[60vh] overflow-y-auto animate-in fade-in slide-in-from-top-2">
              {filteredPeople.length > 0 ? filteredPeople.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    selectPerson(p.id);
                    onLocateNode?.(p.id); // Also zoom to searching person
                    setSearchTerm('');
                    setShowResults(false);
                  }}
                  className="px-4 py-3 hover:bg-stone-100/50 cursor-pointer flex items-center gap-3 transition-colors border-b border-stone-100 last:border-0"
                >
                  <img
                    src={getSafeAvatarUrl(p.avatarUrl, p.fullName)}
                    className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
                    alt={p.fullName}
                  />
                  <div>
                    <p className="text-sm font-bold text-stone-800">{p.fullName}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-heritage-gold">{p.branch || `Đời ${p.order}`}</span>
                      {!p.isAlive && <span className="px-1.5 py-0.5 bg-stone-100 text-stone-500 text-[8px] font-bold rounded-full">ĐÃ MẤT</span>}
                      {p.id === meId && <span className="bg-blue-100 text-blue-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full">TÔI</span>}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-stone-400 text-sm font-medium">Không tìm thấy kết quả</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. CENTER BOTTOM - NÚT MỞ RỘNG */}
      {hasMoreGenerations && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={showMoreGenerations}
            className="group flex flex-col items-center gap-2 transition-all hover:-translate-y-1"
          >
            <div className="bg-stone-900 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-stone-700 group-hover:bg-black group-hover:scale-105 transition-all">
              <Plus size={16} />
              <span className="text-xs font-bold">Mở thế hệ {currentMaxLevel ? currentMaxLevel + 1 : visibleGenerations + 1}</span>
            </div>
            <ChevronDown size={16} className="text-stone-400 animate-bounce" />
          </button>
        </div>
      )}

      {/* 3. RIGHT BOTTOM SIDEBAR - CÁC NÚT CHỨC NĂNG */}
      {/* Xếp dọc từ dưới lên: ZoomFit -> LocateMe -> Route -> Stats */}
      <div className="absolute bottom-8 right-6 z-10 flex flex-col-reverse gap-3 items-end">

        {/* Nút Zoom Fit (Dưới cùng) */}
        <button
          onClick={onFitView}
          className="w-14 h-14 bg-white rounded-full shadow-xl border border-stone-100 text-stone-600 hover:text-heritage-red hover:scale-110 active:scale-95 transition-all flex items-center justify-center group relative"
        >
          <Maximize size={22} />
          <span className="absolute right-full mr-3 bg-stone-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Toàn màn hình</span>
        </button>

        {/* Nút Về Tôi */}
        {meId && (
          <button
            onClick={handleLocateMe}
            className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 border border-blue-500 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group relative"
          >
            <LocateFixed size={20} className="" />
            <span className="absolute right-full mr-3 bg-stone-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Vị trí của tôi</span>
          </button>
        )}

        {/* Nút Lộ trình */}
        <button
          onClick={() => toggleRouteMode(!isRouteMode)}
          className={`w-12 h-12 rounded-full shadow-lg border transition-all flex items-center justify-center group relative ${isRouteMode ? 'bg-heritage-red text-white border-heritage-red' : 'bg-white text-stone-600 border-stone-100 hover:text-heritage-red hover:scale-105 active:scale-95'}`}
        >
          <GitBranch size={20} className={isRouteMode ? "animate-pulse" : ""} />
          <span className="absolute right-full mr-3 bg-stone-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Tìm đường huyết thống</span>
        </button>

        {/* Nút Thống kê + Popup */}
        <div className="relative flex items-center">
          {/* Stats Popup Panel (Hiển thị bên trái nút) */}
          <div className={`
                absolute right-full mr-3 top-1/2 -translate-y-1/2
                origin-right transition-all duration-300
                ${showStats ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'}
             `}>
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-stone-100 w-56 animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center mb-3 border-b border-stone-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <Crown size={12} className="text-heritage-gold" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Bảng Vàng</span>
                </div>
                <X size={12} className="cursor-pointer text-stone-400 hover:text-stone-800" onClick={() => setShowStats(false)} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-stone-500 font-medium">Thế hệ</span>
                  <span className="text-sm font-black text-stone-800 font-serif">{stats.generations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-stone-500 font-medium">Thành viên</span>
                  <span className="text-sm font-black text-stone-800 font-serif">{stats.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Button */}
          <button
            onClick={() => setShowStats(!showStats)}
            className={`
                    w-12 h-12 rounded-full shadow-lg border transition-all flex items-center justify-center group relative
                    ${showStats ? 'bg-heritage-gold text-white border-heritage-gold' : 'bg-white text-stone-600 border-stone-100 hover:text-heritage-gold hover:scale-105 active:scale-95'}
                `}
          >
            <Crown size={20} />
            <span className="absolute right-full mr-3 bg-stone-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Thống kê dòng họ</span>
          </button>
        </div>

      </div>
    </>
  );
};

export default ControlPanel;
