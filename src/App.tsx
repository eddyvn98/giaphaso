
import React from 'react';
import FamilyTree from './components/FamilyTree';
import PersonDetailsSheet from './components/PersonDetailsSheet';
import { AnimatePresence } from 'framer-motion';

function App() {
  return (
    <div 
      className="fixed inset-0 w-full overflow-hidden bg-paper-bg overscroll-none"
      style={{ height: '100dvh' }} 
    >
      <AnimatePresence mode="wait">
        <FamilyTree />
      </AnimatePresence>
      <PersonDetailsSheet />
    </div>
  );
}

export default App;
