import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const MultiSelectDropdown = ({ options, selected, onChange, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (opt) => {
    if (selected.some(item => item.value === opt.value)) {
      onChange(selected.filter(item => item.value !== opt.value));
    } else {
      onChange([...selected, opt]);
    }
  };

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([]); // Deselect all
    } else {
      onChange([...options]); // Select all
    }
  };

  const isAllSelected = selected.length === options.length || selected.length === 0;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="w-full bg-cosmic-card border border-cosmic-border text-cosmic-text text-sm rounded-lg flex items-center justify-between p-2.5 cursor-pointer hover:border-blue-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selected.length === 0 ? placeholder : selected.map(item => item.label).join(', ')}
        </span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-cosmic-card border border-cosmic-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Select All Option */}
          <div 
            className="flex items-center px-3 py-2 cursor-pointer hover:bg-cosmic-bg border-b border-cosmic-border transition-colors"
            onClick={handleSelectAll}
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2 ${isAllSelected ? 'bg-blue-500 border-blue-500' : 'border-cosmic-border bg-transparent'}`}>
              {isAllSelected && <Check size={12} className="text-white" />}
            </div>
            <span className="text-sm font-medium text-cosmic-text">{placeholder}</span>
          </div>
          
          {options.map((opt) => {
            const isSelected = selected.some(item => item.value === opt.value);
            return (
              <div 
                key={opt.value}
                className="flex items-center px-3 py-2 cursor-pointer hover:bg-cosmic-bg transition-colors"
                onClick={() => toggleOption(opt)}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-cosmic-border bg-transparent'}`}>
                  {isSelected && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm text-cosmic-text">{opt.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
