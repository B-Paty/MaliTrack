import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// TypeScript interfaces for component props and state
export interface TransactionTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  lines?: Array<{
    account_code: string;
    debit_amount: number;
    credit_amount: number;
  }>;
  category: 'sales' | 'purchase' | 'cash' | 'expense' | 'transfer' | 'other';
}

export interface MobileTemplateSelectorProps {
  templates: TransactionTemplate[];
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  onApplyTemplate: (templateId: string) => void;
}

interface MobileTemplateSelectorState {
  isExpanded: boolean;
  selectedTemplate: string | null;
  defaultTemplate: string;
}

interface TemplatePreferences {
  lastSelectedTemplate: string;
  timestamp: number;
}

const STORAGE_KEY = 'journal-template-preferences';

// Utility functions for localStorage operations with enhanced error handling
const loadTemplatePreferences = (): TemplatePreferences | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const preferences = JSON.parse(stored);
    
    // Validate the structure of stored preferences
    if (typeof preferences === 'object' && 
        preferences !== null && 
        typeof preferences.lastSelectedTemplate === 'string' &&
        typeof preferences.timestamp === 'number') {
      return preferences as TemplatePreferences;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to load template preferences:', error);
    return null;
  }
};

const saveTemplatePreferences = (templateId: string): boolean => {
  try {
    const preferences: TemplatePreferences = {
      lastSelectedTemplate: templateId,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.warn('Failed to save template preferences:', error);
    return false;
  }
};

const clearTemplatePreferences = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear template preferences:', error);
  }
};

export function MobileTemplateSelector({
  templates,
  selectedTemplate,
  onTemplateSelect,
  onApplyTemplate
}: MobileTemplateSelectorProps) {
  // State management for dropdown expansion and template selection
  const [state, setState] = useState<MobileTemplateSelectorState>({
    isExpanded: false,
    selectedTemplate: null,
    defaultTemplate: 'cash-sale'
  });

  // State for keyboard navigation
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [announceText, setAnnounceText] = useState<string>('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  // State for dynamic dropdown positioning optimization
  const [dropdownPosition, setDropdownPosition] = useState<'above' | 'below'>('below');

  // Load persisted template preference from localStorage with enhanced fallback logic
  useEffect(() => {
    if (!templates || templates.length === 0) return;

    const preferences = loadTemplatePreferences();
    
    if (preferences?.lastSelectedTemplate) {
      // Validate that the stored template still exists and is valid
      const validTemplate = templates.find(t => t.id === preferences.lastSelectedTemplate);
      if (validTemplate) {
        setState(prev => ({
          ...prev,
          selectedTemplate: preferences.lastSelectedTemplate!,
          defaultTemplate: preferences.lastSelectedTemplate!
        }));
        
        // Notify parent of the persisted selection
        onTemplateSelect(preferences.lastSelectedTemplate!);
        return;
      } else {
        // Template no longer exists, clean up localStorage
        console.warn(`Stored template '${preferences.lastSelectedTemplate}' no longer exists, falling back to default`);
        clearTemplatePreferences();
      }
    }

    // Fallback logic: prefer cash-sale, then first available template
    const fallbackTemplate = templates.find(t => t.id === 'cash-sale') || templates[0];
    if (fallbackTemplate) {
      setState(prev => ({
        ...prev,
        selectedTemplate: fallbackTemplate.id,
        defaultTemplate: fallbackTemplate.id
      }));
      onTemplateSelect(fallbackTemplate.id);
    }
  }, [templates, onTemplateSelect]);

  // Sync with parent component's selectedTemplate prop changes
  useEffect(() => {
    if (selectedTemplate && templates.find(t => t.id === selectedTemplate)) {
      setState(prev => ({
        ...prev,
        selectedTemplate: selectedTemplate
      }));
    }
  }, [selectedTemplate, templates]);

  // Get the currently displayed template with enhanced fallback logic
  const getDisplayedTemplate = () => {
    // Priority order: local state selection, parent prop selection, default template, first template
    const candidateIds = [
      state.selectedTemplate,
      selectedTemplate,
      state.defaultTemplate,
      'cash-sale'
    ].filter(Boolean);

    for (const id of candidateIds) {
      const template = templates.find(t => t.id === id);
      if (template) return template;
    }

    // Final fallback to first available template
    return templates[0] || null;
  };

  const displayedTemplate = getDisplayedTemplate();

  // Handle template selection with enhanced validation and error handling
  const handleTemplateSelect = (templateId: string) => {
    // Validate template exists before proceeding
    const selectedTemplateObj = templates.find(t => t.id === templateId);
    if (!selectedTemplateObj) {
      console.error(`Template with id '${templateId}' not found`);
      return;
    }

    // Update local state
    setState(prev => ({
      ...prev,
      selectedTemplate: templateId,
      isExpanded: false
    }));

    // Reset focus state
    setFocusedIndex(-1);

    // Announce selection to screen readers
    setAnnounceText(`${selectedTemplateObj.name} template selected. ${selectedTemplateObj.description}`);

    // Persist to localStorage with enhanced error handling
    const saved = saveTemplatePreferences(templateId);
    if (!saved) {
      console.warn('Template selection will not be persisted due to localStorage error');
    }

    // Notify parent components - ensure both callbacks are called
    try {
      onTemplateSelect(templateId);
      onApplyTemplate(templateId);
    } catch (error) {
      console.error('Error notifying parent components of template selection:', error);
    }

    // Return focus to trigger button
    setTimeout(() => {
      buttonRef.current?.focus();
    }, 100);
  };

  // Handle dropdown toggle with accessibility announcements and touch optimization
  const handleToggleDropdown = () => {
    const wasExpanded = state.isExpanded;
    setState(prev => ({
      ...prev,
      isExpanded: !prev.isExpanded
    }));

    // Reset focus index when opening dropdown
    if (!wasExpanded) {
      setFocusedIndex(-1);
      setAnnounceText('Template selector expanded. Use arrow keys to navigate options.');
    } else {
      setAnnounceText('Template selector closed.');
    }
  };

  // Handle click/touch outside to close dropdown with accessibility announcements
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        state.isExpanded &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setState(prev => ({ ...prev, isExpanded: false }));
        setFocusedIndex(-1);
        setAnnounceText('Template selector closed.');
      }
    };

    // Listen for both mouse and touch events to handle all interaction types
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [state.isExpanded]);

  // Focus management when dropdown opens
  useEffect(() => {
    if (state.isExpanded && listRef.current) {
      // Trap focus within the dropdown
      const focusableElements = listRef.current.querySelectorAll('button[role="option"]');
      if (focusableElements.length > 0) {
        // Set initial focus to first option if no keyboard navigation has occurred
        if (focusedIndex === -1) {
          (focusableElements[0] as HTMLElement).focus();
          setFocusedIndex(0);
        }
      }
    }
  }, [state.isExpanded]);

  // Initialize option refs array
  useEffect(() => {
    const availableTemplates = templates.filter(t => t.id !== displayedTemplate?.id);
    optionRefs.current = new Array(availableTemplates.length).fill(null);
  }, [templates, displayedTemplate]);

  // Dynamic dropdown positioning for thumb-friendly interaction
  useEffect(() => {
    const calculateOptimalPosition = () => {
      if (!buttonRef.current) return;

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 280; // Approximate max height of dropdown
      
      // Calculate available space above and below
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      // For mobile devices, optimize for thumb reach
      // Prefer positioning that keeps dropdown in lower half of screen for easier thumb access
      const isMobileDevice = window.innerWidth < 768;
      const thumbReachThreshold = viewportHeight * 0.6; // Lower 60% of screen is easier to reach
      
      if (isMobileDevice) {
        // If button is in upper half and there's space below, position below
        if (buttonRect.top < thumbReachThreshold && spaceBelow >= dropdownHeight) {
          setDropdownPosition('below');
        }
        // If button is in lower half and there's space above, position above
        else if (buttonRect.top >= thumbReachThreshold && spaceAbove >= dropdownHeight) {
          setDropdownPosition('above');
        }
        // Otherwise, choose position with more space
        else {
          setDropdownPosition(spaceBelow >= spaceAbove ? 'below' : 'above');
        }
      } else {
        // For desktop, use standard positioning logic
        setDropdownPosition(spaceBelow >= dropdownHeight ? 'below' : 'above');
      }
    };

    // Calculate position when dropdown opens
    if (state.isExpanded) {
      calculateOptimalPosition();
    }

    // Recalculate on window resize or orientation change
    const handleResize = () => {
      if (state.isExpanded) {
        calculateOptimalPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [state.isExpanded]);

  // Enhanced keyboard navigation with full accessibility support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle keyboard events when dropdown is closed
      if (!state.isExpanded) {
        // Allow Enter or Space to open dropdown when button is focused
        if ((event.key === 'Enter' || event.key === ' ') && 
            document.activeElement === buttonRef.current) {
          event.preventDefault();
          handleToggleDropdown();
        }
        return;
      }

      // Handle keyboard events when dropdown is expanded
      const availableTemplates = templates.filter(t => t.id !== displayedTemplate?.id);
      const maxIndex = availableTemplates.length - 1;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          setState(prev => ({ ...prev, isExpanded: false }));
          setFocusedIndex(-1);
          setAnnounceText('Template selector closed.');
          buttonRef.current?.focus();
          break;

        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => {
            const newIndex = prev < maxIndex ? prev + 1 : 0;
            const template = availableTemplates[newIndex];
            if (template) {
              setAnnounceText(`${template.name}. ${template.description}`);
              // Focus the option element
              setTimeout(() => {
                optionRefs.current[newIndex]?.focus();
              }, 0);
            }
            return newIndex;
          });
          break;

        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => {
            const newIndex = prev > 0 ? prev - 1 : maxIndex;
            const template = availableTemplates[newIndex];
            if (template) {
              setAnnounceText(`${template.name}. ${template.description}`);
              // Focus the option element
              setTimeout(() => {
                optionRefs.current[newIndex]?.focus();
              }, 0);
            }
            return newIndex;
          });
          break;

        case 'Home':
          event.preventDefault();
          setFocusedIndex(0);
          const firstTemplate = availableTemplates[0];
          if (firstTemplate) {
            setAnnounceText(`${firstTemplate.name}. ${firstTemplate.description}`);
            setTimeout(() => {
              optionRefs.current[0]?.focus();
            }, 0);
          }
          break;

        case 'End':
          event.preventDefault();
          setFocusedIndex(maxIndex);
          const lastTemplate = availableTemplates[maxIndex];
          if (lastTemplate) {
            setAnnounceText(`${lastTemplate.name}. ${lastTemplate.description}`);
            setTimeout(() => {
              optionRefs.current[maxIndex]?.focus();
            }, 0);
          }
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex <= maxIndex) {
            const selectedTemplate = availableTemplates[focusedIndex];
            if (selectedTemplate) {
              handleTemplateSelect(selectedTemplate.id);
            }
          }
          break;

        case 'Tab':
          // Allow tab to close dropdown and move focus naturally
          setState(prev => ({ ...prev, isExpanded: false }));
          setFocusedIndex(-1);
          setAnnounceText('Template selector closed.');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isExpanded, focusedIndex, templates, displayedTemplate]);

  if (!displayedTemplate) {
    return null;
  }

  return (
    <div 
      className="relative touch-manipulation" 
      ref={dropdownRef}
      style={{
        // Prevent text selection during touch interactions
        WebkitUserSelect: 'none',
        userSelect: 'none',
        // Prevent callout on touch and hold
        WebkitTouchCallout: 'none',
        // Prevent tap highlight
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Screen reader announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announceText}
      </div>

      {/* Collapsed View - Selected Template Button */}
      <Button
        ref={buttonRef}
        variant="ghost"
        onClick={handleToggleDropdown}
        className="w-full h-auto p-4 flex items-center gap-3 border border-input hover:bg-transparent active:bg-transparent focus:bg-transparent active:scale-[0.98] transition-all duration-200 ease-in-out text-left min-h-[48px] touch-manipulation"
        style={{
          // Ensure minimum touch target size of 44px as per WCAG guidelines
          minHeight: '48px',
          minWidth: '48px'
        }}
        aria-expanded={state.isExpanded}
        aria-haspopup="listbox"
        aria-label={`Select transaction template. Currently selected: ${displayedTemplate.name}. ${displayedTemplate.description}`}
        aria-describedby="template-selector-help"
      >
        <span className="text-xl flex-shrink-0" aria-hidden="true">{displayedTemplate.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{displayedTemplate.name}</div>
          <div className="text-xs text-muted-foreground truncate">{displayedTemplate.description}</div>
        </div>
        <ChevronDown 
          className={cn(
            "h-4 w-4 flex-shrink-0 transition-transform duration-200 ease-in-out",
            state.isExpanded && "rotate-180"
          )}
          aria-hidden="true"
        />
      </Button>

      {/* Hidden help text for screen readers */}
      <div id="template-selector-help" className="sr-only">
        Use Enter or Space to open template selector. Use arrow keys to navigate options when expanded. Press Escape to close.
      </div>

      {/* Expanded View - Template List */}
      <div className={cn(
        "absolute left-0 right-0 z-50 transition-all duration-200 ease-in-out",
        // Dynamic positioning based on viewport and thumb reach optimization
        dropdownPosition === 'above' 
          ? "bottom-full mb-1 origin-bottom" 
          : "top-full mt-1 origin-top",
        state.isExpanded 
          ? "opacity-100 scale-y-100 translate-y-0" 
          : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
      )}
      style={{
        // Ensure dropdown doesn't extend beyond viewport on small screens
        maxHeight: 'calc(100vh - 120px)'
      }}>
        <Card className="shadow-lg border bg-card">
          <CardContent className="p-2">
            <div 
              ref={listRef}
              className="space-y-1 max-h-64 overflow-y-auto overscroll-contain"
              role="listbox"
              aria-label="Available transaction templates"
              aria-activedescendant={
                focusedIndex >= 0 
                  ? `template-option-${templates.filter(t => t.id !== displayedTemplate.id)[focusedIndex]?.id}`
                  : undefined
              }
              style={{
                // Optimize scrolling for touch devices
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth',
                // Prevent momentum scrolling from interfering with touch events
                overscrollBehavior: 'contain'
              }}
            >
              {templates
                .filter(template => template.id !== displayedTemplate.id)
                .map((template, index) => (
                  <Button
                    key={template.id}
                    ref={(el) => {
                      optionRefs.current[index] = el;
                    }}
                    variant="ghost"
                    onClick={() => handleTemplateSelect(template.id)}
                    className="w-full h-auto p-4 flex items-center gap-3 hover:bg-transparent active:bg-transparent focus:bg-transparent active:scale-[0.98] transition-all duration-150 ease-in-out text-left min-h-[48px] touch-manipulation"
                    style={{
                      // Ensure minimum touch target size of 44px as per WCAG guidelines
                      minHeight: '48px',
                      minWidth: '48px'
                    }}
                    role="option"
                    id={`template-option-${template.id}`}
                    aria-selected={selectedTemplate === template.id}
                    aria-describedby={`template-description-${template.id}`}
                    tabIndex={state.isExpanded ? 0 : -1}
                  >
                    <span className="text-xl flex-shrink-0" aria-hidden="true">{template.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{template.name}</div>
                      <div 
                        id={`template-description-${template.id}`}
                        className="text-xs text-muted-foreground truncate"
                      >
                        {template.description}
                      </div>
                    </div>
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}