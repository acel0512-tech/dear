
import React from 'react';
import { Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Brand Icon: Deep Terracotta/Brown */}
          <div className="bg-orange-800 p-2 rounded-lg shadow-sm">
            <Sparkles className="w-5 h-5 text-orange-50" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-800 tracking-tight">訫肌</h1>
            <p className="text-xs text-stone-500 font-medium tracking-wide">頭皮管理中心</p>
          </div>
        </div>
        <div className="text-sm font-medium text-orange-800 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
          AI 智能檢測顧問
        </div>
      </div>
    </header>
  );
};

export default Header;
