
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useAppStore } from '../store';
import { Person } from '../types';
import SheetHeader from './sheet-parts/SheetHeader';
import InfoForm from './sheet-parts/InfoForm';
import Gallery from './sheet-parts/Gallery';

const PersonDetailsSheet = () => {
  const { selectedPersonId, selectPerson, people, updatePerson, isEditModeRequested } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Person>>({});
  
  const person = people.find(p => p.id === selectedPersonId);

  useEffect(() => {
    if (person) {
      setFormData(person);
      setIsEditing(isEditModeRequested);
    }
  }, [selectedPersonId, person, isEditModeRequested]);

  if (!selectedPersonId || !person) return null;

  const handleClose = () => {
    selectPerson(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (person.id) {
      updatePerson(person.id, formData);
      setIsEditing(false);
    }
  };

  const onDragEnd = (_: any, info: PanInfo) => {
    if (!isEditing && (info.offset.y > 150 || info.velocity.y > 500)) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {selectedPersonId && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            onClick={isEditing ? undefined : handleClose}
            className="fixed inset-0 bg-black z-40"
          />
          
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag={isEditing ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.7 }}
            onDragEnd={onDragEnd}
            className="fixed bottom-0 left-0 right-0 bg-paper-bg rounded-t-3xl z-50 max-h-[92vh] overflow-hidden shadow-2xl md:max-w-md md:left-auto md:right-4 md:bottom-4 md:rounded-3xl"
          >
            <div className="w-full flex justify-center pt-3 pb-3 bg-paper-bg sticky top-0 z-10 border-b border-stone-100">
              <div className="w-12 h-1.5 bg-stone-300 rounded-full"></div>
            </div>

            <div className="overflow-y-auto max-h-[85vh] no-scrollbar pb-10">
              <SheetHeader 
                person={person} 
                formData={formData}
                isEditing={isEditing} 
                onClose={handleClose} 
                onEdit={() => setIsEditing(true)} 
                onSave={handleSave} 
                onCancel={() => setIsEditing(false)}
                onFieldChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
              />
              
              <InfoForm 
                formData={formData} originalPerson={person} 
                isEditing={isEditing} setFormData={setFormData} 
              />

              <Gallery person={person} isEditing={isEditing} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PersonDetailsSheet;
