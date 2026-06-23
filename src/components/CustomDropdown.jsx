import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CustomDropdown = ({ options, placeholder, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
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

  return (
    <div className="relative w-48 select-none" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-card border border-white/10 rounded-xl px-4 py-2 text-left flex justify-between items-center text-white/90 shadow-lg hover:border-accent/40 transition-colors duration-250 cursor-pointer h-10 text-sm font-semibold outline-none"
      >
        <span>{selected || placeholder}</span>
        {isOpen ? (
          <ChevronUp className="size-4 text-accent" />
        ) : (
          <ChevronDown className="size-4 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-full bg-card border border-white/10 rounded-xl shadow-2xl z-[1000] overflow-hidden animate-fade-in">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-4 py-2.5 hover:bg-accent/10 hover:text-accent cursor-pointer text-sm transition-colors duration-150 ${
                selected === option.label ? 'text-accent bg-accent/5 font-semibold' : 'text-white/80'
              }`}
              onClick={() => {
                setSelected(option.label);
                onSelect(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;