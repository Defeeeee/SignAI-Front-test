import React, { useState } from 'react';
import { useAccessibility } from './AccessibilityProvider';
import { Eye, Type, Plus, Minus, RotateCcw } from 'lucide-react';

const AccessibilityControls: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    highContrast, 
    toggleHighContrast, 
    fontSize, 
    increaseFontSize, 
    decreaseFontSize, 
    resetFontSize 
  } = useAccessibility();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="accessibility-controls">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            aria-label="Close accessibility controls"
          >
            ×
          </button>
          
          <div className="mb-3">
            <h3 className="text-sm font-medium mb-2">Accessibility Options</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={toggleHighContrast}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                  highContrast 
                    ? 'bg-yellow-200 text-black' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                aria-pressed={highContrast}
              >
                <Eye size={16} />
                <span>{highContrast ? 'Disable' : 'Enable'} High Contrast</span>
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={decreaseFontSize}
                  className="accessibility-button"
                  aria-label="Decrease font size"
                  disabled={fontSize <= 80}
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={resetFontSize}
                  className="accessibility-button"
                  aria-label="Reset font size"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={increaseFontSize}
                  className="accessibility-button"
                  aria-label="Increase font size"
                  disabled={fontSize >= 150}
                >
                  <Plus size={16} />
                </button>
                <span className="text-sm ml-2">{fontSize}%</span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 border-t pt-2">
            <p>Keyboard shortcuts:</p>
            <ul className="mt-1">
              <li>Alt+C: Toggle high contrast</li>
              <li>Alt++: Increase font size</li>
              <li>Alt+-: Decrease font size</li>
              <li>Alt+0: Reset font size</li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Open accessibility options"
        >
          <Type size={20} className="text-gray-700" />
        </button>
      )}
    </div>
  );
};

export default AccessibilityControls;