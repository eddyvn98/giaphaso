
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, X, UserSearch, GitMerge, RotateCcw, User, UserCircle, Plus, Trash2, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '@/store/store';
import { findRelationshipPath, describePath, getKinshipTerm } from '@/utils/kinship';

const RouteFinder = () => {
  const {
    people, relationships, meId,
    isRouteMode, toggleRouteMode,
    routeNodeIds, setRouteNodes, clearRoute,
    setHighlightedNodes
  } = useAppStore();

  const [waypointIds, setWaypointIds] = useState<string[]>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isRouteMode && waypointIds.length === 0) {
      setWaypointIds([meId || people[0]?.id || '', '']);
      setSearchTerms(['', '']);
    }
  }, [isRouteMode, meId, people]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveIdx(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addWaypoint = () => {
    setWaypointIds([...waypointIds, '']);
    setSearchTerms([...searchTerms, '']);
  };

  const removeWaypoint = (idx: number) => {
    if (waypointIds.length <= 2) return;
    const newIds = [...waypointIds];
    const newTerms = [...searchTerms];
    newIds.splice(idx, 1);
    newTerms.splice(idx, 1);
    setWaypointIds(newIds);
    setSearchTerms(newTerms);
  };

  const updateWaypoint = (idx: number, id: string, name: string) => {
    const newIds = [...waypointIds];
    const newTerms = [...searchTerms];
    newIds[idx] = id;
    newTerms[idx] = name;
    setWaypointIds(newIds);
    setSearchTerms(newTerms);
    setActiveIdx(null);
  };

  const calculateFullRoute = () => {
    let fullPath: string[] = [];
    for (let i = 0; i < waypointIds.length - 1; i++) {
      const start = waypointIds[i];
      const end = waypointIds[i + 1];
      if (start && end) {
        const segment = findRelationshipPath(start, end, relationships);
        if (fullPath.length === 0) fullPath = segment;
        else fullPath = [...fullPath, ...segment.slice(1)];
      }
    }
    setRouteNodes(fullPath);
    setHighlightedNodes(new Set(fullPath));
    // Tự động thu gọn sau khi tính toán để người dùng nhìn thấy cây
    if (fullPath.length > 0) {
      setTimeout(() => setIsCollapsed(true), 1000);
    }
  };

  const descriptions = routeNodeIds.length > 1 ? describePath(routeNodeIds, people, relationships) : [];

  const finalKinship = routeNodeIds.length >= 2
    ? getKinshipTerm(routeNodeIds[0], routeNodeIds[routeNodeIds.length - 1], people, relationships)
    : null;

  const handleClear = () => {
    clearRoute();
    setWaypointIds([meId || people[0]?.id || '', '']);
    setSearchTerms(['', '']);
    setIsCollapsed(false);
  };

  const handleClose = () => {
    toggleRouteMode(false);
    clearRoute();
    setIsCollapsed(false);
  };

  if (!isRouteMode) return null;

  return (
    <>
      {/* Nút nhỏ nổi khi đã thu gọn */}
      <AnimatePresence shadow-sm>
        {isCollapsed && (
          <motion.button
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            onClick={() => setIsCollapsed(false)}
            className="fixed top-24 left-4 z-[110] bg-heritage-red text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-400/30 active:scale-95 transition-all md:left-6"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <GitBranch size={14} />
            </div>
            <div className="text-left">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/60">Đang truy vết</p>
              <p className="text-[11px] font-serif font-bold">Xem chi tiết lộ trình</p>
            </div>
            <ChevronDown size={16} className="ml-2 text-white/50" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            ref={containerRef}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.2)] rounded-b-[2.5rem] border-b border-stone-200 overflow-visible md:max-w-md md:left-6 md:top-6 md:rounded-3xl max-h-[90vh] flex flex-col"
          >
            <div className="p-5 overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-heritage-red flex items-center justify-center text-white shadow-lg shadow-red-100">
                    <GitBranch size={18} />
                  </div>
                  <h3 className="font-serif font-bold text-stone-800 text-lg">Truy vết huyết thống</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsCollapsed(true)}
                    className="text-stone-400 p-2 hover:bg-stone-50 rounded-full transition-colors flex items-center gap-1"
                    title="Tạm ẩn để quan sát"
                  >
                    <EyeOff size={18} />
                  </button>
                  <button onClick={handleClose} className="text-stone-400 p-2 hover:bg-stone-50 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 relative">
                <div className="absolute left-[21px] top-[24px] bottom-[24px] w-0.5 border-l-2 border-dashed border-heritage-red/20 z-0"></div>

                {waypointIds.map((id, idx) => {
                  const person = people.find(p => p.id === id);
                  const isActive = activeIdx === idx;

                  return (
                    <div key={idx} className={`relative flex items-center gap-3 transition-all ${isActive ? 'z-30' : 'z-10'}`}>
                      <div className="relative z-10">
                        {idx === 0 ? (
                          <UserCircle size={20} className="text-blue-500 bg-white rounded-full" />
                        ) : idx === waypointIds.length - 1 ? (
                          <UserSearch size={20} className="text-heritage-red bg-white rounded-full" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-stone-500">
                            {idx}
                          </div>
                        )}
                      </div>

                      <div className="relative flex-grow">
                        <div className="flex gap-2">
                          <input
                            value={searchTerms[idx] || (person?.fullName || '')}
                            onFocus={() => { setActiveIdx(idx); }}
                            onChange={(e) => {
                              const newTerms = [...searchTerms];
                              newTerms[idx] = e.target.value;
                              setSearchTerms(newTerms);
                            }}
                            placeholder={idx === 0 ? "Người khởi đầu..." : "Thêm người thân..."}
                            className={`w-full bg-stone-50 border rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-all ${isActive ? 'border-heritage-red/30 bg-white shadow-md' : 'border-stone-200'}`}
                          />
                          {waypointIds.length > 2 && (
                            <button
                              onClick={() => removeWaypoint(idx)}
                              className="p-2 text-stone-300 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        <AnimatePresence>
                          {isActive && searchTerms[idx] && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-100 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] z-[60] max-h-40 overflow-y-auto no-scrollbar"
                            >
                              {people
                                .filter(p => p.fullName.toLowerCase().includes(searchTerms[idx].toLowerCase()))
                                .map(p => (
                                  <div
                                    key={p.id}
                                    onClick={() => updateWaypoint(idx, p.id, p.fullName)}
                                    className="px-4 py-3 hover:bg-stone-50 text-sm cursor-pointer border-b border-stone-50 flex items-center gap-3"
                                  >
                                    <img src={p.avatarUrl} className="w-6 h-6 rounded-full object-cover" alt="" />
                                    <span className="font-medium text-stone-700">{p.fullName}</span>
                                  </div>
                                ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={addWaypoint}
                  className="ml-8 flex items-center gap-2 text-stone-400 hover:text-heritage-red transition-colors text-xs font-bold py-2"
                >
                  <Plus size={14} className="bg-stone-100 rounded-full p-0.5" /> Thêm người vào chuỗi
                </button>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={calculateFullRoute}
                  disabled={waypointIds.some(id => !id)}
                  className="flex-grow bg-heritage-red text-white rounded-2xl py-3.5 font-bold text-sm shadow-xl shadow-red-100 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  <GitMerge size={18} /> Kết nối huyết thống
                </button>
                <button
                  onClick={handleClear}
                  className="bg-stone-100 text-stone-500 rounded-2xl p-3.5 hover:bg-stone-200 transition-all active:scale-90"
                >
                  <RotateCcw size={20} />
                </button>
              </div>

              {/* Kết quả phân tích */}
              <AnimatePresence>
                {descriptions.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-6 pt-5 border-t border-stone-100"
                  >
                    {/* BANNER TỔNG KẾT VAI VẾ */}
                    {finalKinship && (
                      <div className="mb-6 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-4 animate-in zoom-in-95 duration-500">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 flex-shrink-0">
                          <User size={24} />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-black text-blue-400 tracking-widest mb-0.5">Xác định vai vế</p>
                          <p className="text-sm font-serif font-bold text-blue-900 leading-tight">
                            <span className="text-blue-600">{people.find(p => p.id === routeNodeIds[routeNodeIds.length - 1])?.fullName}</span> là <span className="underline decoration-blue-300 decoration-2 underline-offset-4">{finalKinship}</span> của <span className="text-blue-600">{people.find(p => p.id === routeNodeIds[0])?.fullName}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] font-black text-heritage-gold uppercase tracking-[0.2em]">Dòng chảy huyết thống</p>
                      <button onClick={() => setIsCollapsed(true)} className="text-[10px] font-bold text-stone-400 hover:text-heritage-red flex items-center gap-1 transition-colors">
                        Thu gọn để xem cây <ChevronUp size={12} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {descriptions.map((desc, i) => (
                        <div key={i} className="flex items-start gap-3 group">
                          <div className="w-6 h-6 rounded-full bg-heritage-red/5 text-heritage-red flex items-center justify-center text-[10px] font-black mt-0.5 border border-heritage-red/10 group-hover:bg-heritage-red group-hover:text-white transition-colors">
                            {i + 1}
                          </div>
                          <p className="text-sm text-stone-700 font-serif italic leading-relaxed">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RouteFinder;
