import React, { useState } from 'react';
import { X } from 'lucide-react';

const CategorySelector = ({ categories, selectedCategory, onCategoryChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative z-10 mb-6">
      {/* Selected Category Pill or Select Button */}
      {!selectedCategory ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="px-6 py-3 bg-white/90 hover:bg-white/95 backdrop-blur-sm rounded-full 
                     shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100
                     text-gray-600 hover:text-gray-800"
        >
          Select Feature Category
        </button>
      ) : (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 
                        rounded-full border-2 border-green-500/20 shadow-md">
          <span className="text-green-700">
            {categories.find(c => c.id === selectedCategory)?.name}
          </span>
          <button
            onClick={() => onCategoryChange(null)}
            className="w-6 h-6 flex items-center justify-center rounded-full 
                       bg-green-100 hover:bg-green-200 text-green-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Category Selection Modal */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsExpanded(false)}
          />

          {/* Modal */}
          <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-[90vw] max-w-3xl">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
                  Select Feature Category
                </h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-2 
                            scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      onCategoryChange(category.id);
                      setIsExpanded(false);
                    }}
                    className={`
                      group relative p-4 rounded-xl text-left transition-all duration-300
                      ${selectedCategory === category.id
                        ? 'bg-gradient-to-br from-sky-50 to-indigo-50 border-2 border-sky-500/20'
                        : 'hover:bg-gray-50 border border-gray-100 hover:border-gray-200'
                      }
                    `}
                  >
                    <div className="relative z-10">
                      <p className={`text-sm font-medium mb-1 transition-colors duration-300
                        ${selectedCategory === category.id ? 'text-sky-700' : 'text-gray-700 group-hover:text-gray-900'}`}>
                        {category.name}
                      </p>
                    </div>
                    {selectedCategory === category.id && (
                      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-indigo-500/5 rounded-xl" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CategorySelector;