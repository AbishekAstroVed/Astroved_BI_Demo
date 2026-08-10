import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

const SearchableDropdown = ({ options, selected, onChange, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter(opt => 
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedLabel = options.find(opt => opt.value === selected)?.label || placeholder;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className="w-full bg-cosmic-card border border-cosmic-border text-cosmic-text text-sm rounded-lg flex items-center justify-between p-2.5 cursor-pointer hover:border-blue-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-cosmic-card border border-cosmic-border rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-cosmic-border flex items-center bg-cosmic-bg/50">
            <Search size={14} className="text-cosmic-muted mr-2" />
            <input 
              type="text" 
              className="w-full bg-transparent border-none text-cosmic-text text-sm outline-none" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-cosmic-muted italic">No results found</div>
            ) : (
              filteredOptions.map((opt) => (
                <div 
                  key={opt.value}
                  className="flex items-center px-3 py-2 cursor-pointer hover:bg-cosmic-bg transition-colors"
                  onClick={() => handleSelect(opt.value)}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-2 ${selected === opt.value ? 'bg-blue-500 border-blue-500' : 'border-cosmic-border bg-transparent'}`}>
                    {selected === opt.value && <Check size={10} className="text-white" />}
                  </div>
                  <span className="text-sm text-cosmic-text">{opt.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
