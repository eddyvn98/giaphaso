
import React from 'react';
import FamilyTree from './components/FamilyTree';
import PersonDetailsSheet from './components/PersonDetailsSheet';
import { AnimatePresence } from 'framer-motion';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-paper-bg p-10 text-center z-[9999]">
          <h1 className="text-2xl font-serif font-bold text-heritage-red mb-4">Lỗi Hệ Thống (React Error)</h1>
          <pre className="text-xs text-stone-500 bg-stone-100 p-4 rounded-xl max-w-full overflow-auto text-left mb-6">
            {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
          </pre>
          <button onClick={() => window.location.reload()} className="bg-heritage-red text-white px-8 py-3 rounded-full font-bold">Thử lại</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <div
      className="fixed inset-0 w-full overflow-hidden overscroll-none"
      style={{ height: '100dvh' }}
    >
      {/* BACKGROUND IMAGE & BLUR */}
      {/* Mẹo: Để thay đổi hình nền, bạn hãy chép file ảnh của bạn vào thư mục 'public' và đổi tên thành 'bg.jpg' */}
      <img
        src="/bg.jpg"
        onError={(e) => {
          e.currentTarget.src = 'https://images.unsplash.com/photo-1516962080544-eac695c93791?q=80&w=2574&auto=format&fit=crop';
        }}
        alt="Background"
        className="absolute inset-0 z-[-10] w-full h-full object-cover"
        style={{
          filter: 'blur(10px) brightness(0.8)',
          transform: 'scale(1.1)'
        }}
      />
      <div className="absolute inset-0 z-[-9] bg-stone-100/40" />

      <ErrorBoundary>
        <AnimatePresence mode="wait">
          <FamilyTree />
        </AnimatePresence>
        <PersonDetailsSheet />
      </ErrorBoundary>
    </div>
  );
}

export default App;
