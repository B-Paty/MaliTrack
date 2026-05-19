import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxSuggestions?: number;
}

export function Autocomplete({
  options,
  value,
  onValueChange,
  placeholder = "Type to search...",
  className,
  disabled = false,
  maxSuggestions = 10,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Update input value when external value changes
  useEffect(() => {
    const selectedOption = options.find(option => option.value === value);
    setInputValue(selectedOption ? selectedOption.label : value || "");
  }, [value, options]);

  // Filter options based on input with enhanced matching
  const filteredOptions = options.filter(option => {
    if (!inputValue.trim()) return true;
    
    // Convert to lowercase for case-insensitive matching
    const searchTerms = inputValue.toLowerCase().split(/\s+/);
    const optionValue = option.value.toLowerCase();
    const optionLabel = option.label.toLowerCase();
    const optionDesc = (option.description || '').toLowerCase();
    
    // Every search term must match at least one field
    return searchTerms.every(term => {
      // Direct matches
      if (optionValue.includes(term) || optionLabel.includes(term) || optionDesc.includes(term)) {
        return true;
      }
      
      // Handle possessive forms and plurals
      const withoutS = term.endsWith('s') ? term.slice(0, -1) : term;
      const withoutApostropheS = term.endsWith("'s") ? term.slice(0, -2) : term;
      
      return (
        // Check variations of the term
        [withoutS, withoutApostropheS].some(variation =>
          optionValue.includes(variation) ||
          optionLabel.includes(variation) ||
          optionDesc.includes(variation)
        ) ||
        // Check if term matches the start of any word in the fields
        optionLabel.split(/\s+/).some(word => word.startsWith(term)) ||
        optionDesc.split(/\s+/).some(word => word.startsWith(term))
      );
    });
  }).slice(0, maxSuggestions);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
    
    // If input matches an option exactly, select it
    const exactMatch = options.find(option => 
      option.value === newValue || option.label === newValue
    );
    if (exactMatch) {
      onValueChange(exactMatch.value);
    } else {
      onValueChange(newValue);
    }
  };

  const handleOptionSelect = (option: AutocompleteOption) => {
    setInputValue(option.label);
    onValueChange(option.value);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Delay closing to allow for option selection
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn("font-mono", className)}
        disabled={disabled}
        autoComplete="off"
      />
      
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          <ul ref={listRef} className="py-1">
            {filteredOptions.map((option, index) => (
              <li
                key={option.value}
                className={cn(
                  "px-3 py-2 cursor-pointer text-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                  index === highlightedIndex && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleOptionSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-mono font-medium">{option.value}</span>
                    <span className="text-muted-foreground text-xs truncate">
                      {option.label}
                    </span>
                  </div>
                  {option.description && (
                    <span className="text-xs text-muted-foreground ml-2 truncate">
                      {option.description}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {isOpen && filteredOptions.length === 0 && inputValue && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg">
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No accounts found matching "{inputValue}"
          </div>
        </div>
      )}
    </div>
  );
}
