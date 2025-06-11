import React from 'react';
import { FileText } from 'lucide-react';

const Header = ({ isPromptSubmitted, resetBuilder }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 w-full">
      <div className="max-w-7xl mx-auto px-6 py-4 w-full">
        <div className="flex justify-between items-center w-full">
          {/* Left - Logo and Text */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ContractCraft Pro</h1>
              <p className="text-sm text-gray-600">Professional Contract Generation Platform</p>
            </div>
          </div>

          {/* Right - Button */}
          {isPromptSubmitted && (
            <button
              onClick={resetBuilder}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              New Contract
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
