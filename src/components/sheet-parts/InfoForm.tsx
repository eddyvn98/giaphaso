
import React from 'react';
import { User, MapPin, Navigation, Heart } from 'lucide-react';
import { Person } from '@/types/types';
import DateCard from './DateCard';
import { useAppStore } from '@/store/store';
import { getKinshipTerm } from '@/utils/kinship';

interface InfoFormProps {
  formData: Partial<Person>;
  originalPerson: Person;
  isEditing: boolean;
  setFormData: (data: Partial<Person>) => void;
}

const InfoForm: React.FC<InfoFormProps> = ({ formData, originalPerson, isEditing, setFormData }) => {
  const { meId, people, relationships } = useAppStore();
  const updateField = (key: keyof Person, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const openGoogleMaps = () => {
    if (originalPerson.burialLocation) {
      const { lat, lng } = originalPerson.burialLocation;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  // Tính toán cách xưng hô
  const kinship = meId ? getKinshipTerm(meId, originalPerson.id, people, relationships) : null;

  return (
    <div className="px-6 pb-2">
      {/* Name & Branch */}
      <div className="mb-6">
        {isEditing ? (
          <input
            value={formData.fullName || ''}
            onChange={(e) => updateField('fullName', e.target.value)}
            className="text-3xl font-serif font-bold text-stone-900 mb-1 bg-white border-b-2 border-heritage-red/20 outline-none w-full px-2 py-1 rounded"
            placeholder="Tên đầy đủ..."
          />
        ) : (
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-1 leading-tight">{formData.fullName}</h2>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-heritage-gold font-bold text-[10px] uppercase tracking-[0.2em]">{formData.branch || 'Hậu duệ'}</span>
          <div className="h-1 w-1 bg-stone-300 rounded-full"></div>
          <span className="text-stone-400 text-[10px] uppercase tracking-widest">Đời thứ {formData.order || '...'}</span>
        </div>

        {/* Banner vai vế */}
        {!isEditing && kinship && (
          <div className="mt-4 bg-heritage-red/5 border border-heritage-red/10 p-3 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-heritage-red/10 flex items-center justify-center text-heritage-red">
              <Heart size={16} fill="currentColor" className="opacity-80" />
            </div>
            <div>
              <p className="text-[8px] uppercase font-bold text-stone-400 tracking-widest mb-0.5">Mối quan hệ với bạn</p>
              <p className="text-sm font-bold text-heritage-red italic font-serif">{kinship}</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <DateCard
          label="Ngày sinh" field="dob" isEditing={isEditing}
          dateInfo={formData.dob} onChange={(f, v) => updateField(f, v)}
        />

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-400 text-[10px] uppercase font-bold tracking-tighter">
              <User size={12} className="text-heritage-red" /> Giới tính
            </div>
            {isEditing && (
              <div className="flex items-center gap-2 text-stone-400 text-[10px] uppercase font-bold tracking-tighter">
                <Navigation size={12} className="text-heritage-gold" /> Thứ tự trong đời
              </div>
            )}
          </div>

          <div className="grid grid-cols-12 gap-4 mt-3">
            <div className={isEditing ? "col-span-8" : "col-span-12"}>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => updateField('gender', 'male')}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${formData.gender === 'male' ? 'bg-male-blue-solid text-white border-male-blue-solid' : 'bg-white text-stone-400 border-stone-200'}`}>
                    Nam
                  </button>
                  <button onClick={() => updateField('gender', 'female')}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${formData.gender === 'female' ? 'bg-female-pink-solid text-white border-female-pink-solid' : 'bg-white text-stone-400 border-stone-200'}`}>
                    Nữ
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] text-stone-400 uppercase font-bold mb-1 tracking-tighter">Giới tính</p>
                  <p className="font-bold text-stone-800 text-sm">{formData.gender === 'male' ? 'Nam giới' : 'Nữ giới'}</p>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="col-span-4">
                <input
                  type="number"
                  min="1"
                  value={formData.order || ''}
                  onChange={(e) => updateField('order', parseInt(e.target.value) || undefined)}
                  className="w-full py-3 rounded-xl border border-stone-200 text-center font-bold text-sm outline-none focus:border-heritage-gold/40 bg-stone-50"
                  placeholder="Thứ..."
                />
              </div>
            )}
          </div>

          {!isEditing && formData.order && (
            <div className="mt-4 pt-4 border-t border-stone-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-bold mb-1 tracking-tighter">Thứ tự trong đời</p>
                <p className="font-bold text-stone-800 text-sm">Con thứ {formData.order}</p>
              </div>
              <Navigation size={16} className="text-heritage-gold opacity-30 rotate-45" />
            </div>
          )}
        </div>

        {!formData.isAlive && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="mb-4">
              <DateCard label="Ngày tạ thế" field="dod" isEditing={isEditing} dateInfo={formData.dod} onChange={(f, v) => updateField(f, v)} />
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 flex-shrink-0 text-heritage-red" />
                <div className="flex-grow">
                  <p className="text-xs text-stone-400 mb-2 uppercase font-bold tracking-tighter">Nơi an nghỉ (Mộ phần)</p>
                  {isEditing ? (
                    <textarea value={formData.burialAddress || ''} onChange={(e) => updateField('burialAddress', e.target.value)}
                      placeholder="Vị trí phần mộ..." rows={2}
                      className="w-full text-sm text-stone-800 font-medium leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200 outline-none focus:border-heritage-red/40" />
                  ) : (
                    <p className="text-sm text-stone-800 font-medium leading-relaxed">{formData.burialAddress || 'Chưa cập nhật'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="font-serif font-bold text-stone-800 text-lg mb-3">Tiểu sử & Sự nghiệp</h3>
          {isEditing ? (
            <textarea value={formData.bio || ''} onChange={(e) => updateField('bio', e.target.value)}
              placeholder="Ghi chú về cuộc đời..." rows={6}
              className="text-sm text-stone-600 leading-relaxed bg-white p-4 rounded-2xl border border-stone-200 shadow-sm w-full outline-none focus:border-heritage-red/40" />
          ) : (
            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line bg-white p-5 rounded-2xl border border-stone-50 shadow-sm italic font-serif opacity-90">
              {formData.bio || 'Hiện tại chưa có thông tin chi tiết.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoForm;
