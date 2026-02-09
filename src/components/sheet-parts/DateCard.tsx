
import React from 'react';
import { Calendar, Info } from 'lucide-react';
import { DateInfo } from '@/types/types';
import { getZodiacYear, getComplementaryDate } from '@/utils/lunar';

interface DateCardProps {
  label: string;
  field: 'dob' | 'dod';
  dateInfo?: DateInfo;
  isEditing: boolean;
  onChange: (field: 'dob' | 'dod', value: DateInfo) => void;
}

const DateCard: React.FC<DateCardProps> = ({ label, field, dateInfo, isEditing, onChange }) => {
  if (!dateInfo && !isEditing) return null;

  const currentInfo = dateInfo || { date: '', type: 'solar' };
  const compDate = getComplementaryDate(currentInfo);
  const year = currentInfo.date ? new Date(currentInfo.date).getFullYear() : 0;
  const zodiac = getZodiacYear(year);

  const toggleType = () => {
    onChange(field, { ...currentInfo, type: currentInfo.type === 'solar' ? 'lunar' : 'solar' });
  };

  const handleDateChange = (dateStr: string) => {
    onChange(field, { ...currentInfo, date: dateStr });
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 mb-4 transition-all">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-stone-400 text-[10px] uppercase font-bold tracking-tighter">
          <Calendar size={12} className="text-heritage-red" /> {label}
        </div>
        {isEditing && (
          <div className="flex bg-stone-100 rounded-lg p-0.5 border border-stone-200">
            <button type="button" onClick={toggleType}
              className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${currentInfo.type === 'solar' ? 'bg-white text-heritage-red shadow-sm' : 'text-stone-400'}`}>
              DƯƠNG
            </button>
            <button type="button" onClick={toggleType}
              className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${currentInfo.type === 'lunar' ? 'bg-white text-heritage-red shadow-sm' : 'text-stone-400'}`}>
              ÂM LỊCH
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] font-bold text-stone-400 px-1 uppercase">Ngày</label>
              <input
                type="number"
                placeholder="DD"
                min="1"
                max="31"
                value={currentInfo.date ? new Date(currentInfo.date).getDate() : ''}
                onChange={(e) => {
                  const d = new Date(currentInfo.date || new Date());
                  d.setDate(parseInt(e.target.value) || 1);
                  handleDateChange(d.toISOString().split('T')[0]);
                }}
                className="w-full font-bold text-stone-800 text-center text-sm outline-none bg-stone-50 p-3 rounded-xl border border-stone-200 focus:border-heritage-red/40"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] font-bold text-stone-400 px-1 uppercase">Tháng</label>
              <input
                type="number"
                placeholder="MM"
                min="1"
                max="12"
                value={currentInfo.date ? new Date(currentInfo.date).getMonth() + 1 : ''}
                onChange={(e) => {
                  const d = new Date(currentInfo.date || new Date());
                  d.setMonth((parseInt(e.target.value) || 1) - 1);
                  handleDateChange(d.toISOString().split('T')[0]);
                }}
                className="w-full font-bold text-stone-800 text-center text-sm outline-none bg-stone-50 p-3 rounded-xl border border-stone-200 focus:border-heritage-red/40"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] font-bold text-stone-400 px-1 uppercase">Năm</label>
              <input
                type="number"
                placeholder="YYYY"
                min="1000"
                max="2100"
                value={currentInfo.date ? new Date(currentInfo.date).getFullYear() : ''}
                onChange={(e) => {
                  const d = new Date(currentInfo.date || new Date());
                  d.setFullYear(parseInt(e.target.value) || new Date().getFullYear());
                  handleDateChange(d.toISOString().split('T')[0]);
                }}
                className="w-full font-bold text-stone-800 text-center text-sm outline-none bg-stone-50 p-3 rounded-xl border border-stone-200 focus:border-heritage-red/40"
              />
            </div>
          </div>

          {currentInfo.date && (
            <div className="flex items-start gap-2 bg-heritage-gold/5 p-3 rounded-xl border border-heritage-gold/10">
              <Info size={14} className="text-heritage-gold mt-0.5 flex-shrink-0" />
              <div className="text-[11px] leading-relaxed text-stone-600">
                <p className="font-bold text-heritage-gold uppercase tracking-tighter mb-1">
                  Đối chiếu {currentInfo.type === 'solar' ? 'Âm lịch' : 'Dương lịch'}
                </p>
                <p>{compDate}</p>
                <p className="font-serif italic mt-1 font-medium">Năm {zodiac}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-stone-800 text-lg font-serif">
              {currentInfo.date ? currentInfo.date.split('-').reverse().join('/') : '??'}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${currentInfo.type === 'lunar' ? 'bg-stone-800 text-white' : 'bg-heritage-red/10 text-heritage-red'}`}>
              {currentInfo.type === 'lunar' ? 'ÂM LỊCH' : 'DƯƠNG LỊCH'}
            </span>
          </div>
          <div className="text-xs text-stone-500 font-medium flex items-center gap-2">
            <span>Đương thời: <span className="text-heritage-gold font-bold">{zodiac}</span></span>
            <span className="text-stone-300">|</span>
            <span>Đối: {compDate}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateCard;
