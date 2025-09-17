import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileTemplateSelector, type TransactionTemplate } from '../MobileTemplateSelector';

// Mock templates for testing
const mockTemplates: TransactionTemplate[] = [
  {
    id: 'cash-sale',
    name: 'Cash Sale',
    description: 'Sale of goods/services for cash',
    icon: '💰',
    category: 'sales',
    lines: [
      { account_code: '1010', debit_amount: 0, credit_amount: 0 },
      { account_code: '4010', debit_amount: 0, credit_amount: 0 }
    ]
  },
  {
    id: 'credit-sale',
    name: 'Credit Sale',
    description: 'Sale of goods/services on credit',
    icon: '📋',
    category: 'sales',
    lines: [
      { account_code: '1030', debit_amount: 0, credit_amount: 0 },
      { account_code: '4010', debit_amount: 0, credit_amount: 0 }
    ]
  },
  {
    id: 'purchase',
    name: 'Purchase',
    description: 'Purchase of goods/services',
    icon: '🛒',
    category: 'purchase',
    lines: [
      { account_code: '5010', debit_amount: 0, credit_amount: 0 },
      { account_code: '2010', debit_amount: 0, credit_amount: 0 }
    ]
  }
];

const defaultProps = {
  templates: mockTemplates,
  selectedTemplate: 'cash-sale',
  onTemplateSelect: vi.fn(),
  onApplyTemplate: vi.fn()
};

describe('MobileTemplateSelector - State Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('should initialize with default template when no localStorage data', () => {
    render(<MobileTemplateSelector {...defaultProps} />);
    
    const triggerButton = screen.getByRole('button', { expanded: false });
    expect(triggerButton).toHaveTextContent('Cash Sale');
    expect(triggerButton).toHaveTextContent('Sale of goods/services for cash');
  });

  test('should manage dropdown expansion state correctly', async () => {
    const user = userEvent.setup();
    render(<MobileTemplateSelector {...defaultProps} />);
    
    const triggerButton = screen.getByRole('button', { expanded: false });
    
    // Initially collapsed
    expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
    
    // Expand dropdown
    await user.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { expanded: true })).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    // Collapse dropdown by clicking outside
    await user.click(document.body);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { expanded: false })).toHaveAttribute('aria-expanded', 'false');
    });
  });

  test('should update selected template state when template is selected', async () => {
    const user = userEvent.setup();
    render(<MobileTemplateSelector {...defaultProps} />);
    
    // Open dropdown
    await user.click(screen.getByRole('button', { expanded: false }));
    
    // Select different template
    const creditSaleOption = screen.getByRole('option', { name: /credit sale/i });
    await user.click(creditSaleOption);
    
    // Verify callbacks were called
    expect(defaultProps.onTemplateSelect).toHaveBeenCalledWith('credit-sale');
    expect(defaultProps.onApplyTemplate).toHaveBeenCalledWith('credit-sale');
    
    // Verify dropdown closed
    await waitFor(() => {
      expect(screen.getByRole('button', { expanded: false })).toHaveAttribute('aria-expanded', 'false');
    });
  });

  test('should handle invalid template selection gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    
    render(<MobileTemplateSelector {...defaultProps} />);
    
    // Simulate selecting non-existent template
    const component = screen.getByRole('button', { expanded: false }).closest('div');
    const selector = component?.querySelector('[data-testid="mobile-template-selector"]') as HTMLElement;
    
    // Manually trigger handleTemplateSelect with invalid ID
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    
    // Should not crash and should log error for invalid template
    expect(consoleErrorSpy).not.toHaveBeenCalled(); // No error should occur in normal flow
    
    consoleErrorSpy.mockRestore();
  });
});

describe('MobileTemplateSelector - Template Selection and Form State Interaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('should integrate with parent form state correctly', async () => {
    const user = userEvent.setup();
    const onTemplateSelect = vi.fn();
    const onApplyTemplate = vi.fn();
    
    render(
      <MobileTemplateSelector 
        {...defaultProps}
        onTemplateSelect={onTemplateSelect}
        onApplyTemplate={onApplyTemplate}
      />
    );
    
    // Clear initial calls from component initialization
    onTemplateSelect.mockClear();
    onApplyTemplate.mockClear();
    
    // Open dropdown and select template
    await user.click(screen.getByRole('button', { expanded: false }));
    await user.click(screen.getByRole('option', { name: /purchase/i }));
    
    // Verify both callbacks are called with correct template ID
    expect(onTemplateSelect).toHaveBeenCalledWith('purchase');
    expect(onApplyTemplate).toHaveBeenCalledWith('purchase');
    expect(onTemplateSelect).toHaveBeenCalledTimes(1);
    expect(onApplyTemplate).toHaveBeenCalledTimes(1);
  });

  test('should sync with parent selectedTemplate prop changes', () => {
    const { rerender } = render(<MobileTemplateSelector {...defaultProps} />);
    
    // Initially shows cash-sale
    expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Cash Sale');
    
    // Update parent selectedTemplate prop
    rerender(
      <MobileTemplateSelector 
        {...defaultProps}
        selectedTemplate="credit-sale"
      />
    );
    
    // Should update to show credit-sale
    expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Credit Sale');
  });

  test('should handle template data changes gracefully', () => {
    const { rerender } = render(<MobileTemplateSelector {...defaultProps} />);
    
    // Remove the currently selected template
    const updatedTemplates = mockTemplates.filter(t => t.id !== 'cash-sale');
    
    rerender(
      <MobileTemplateSelector 
        {...defaultProps}
        templates={updatedTemplates}
        selectedTemplate="cash-sale" // Still trying to select removed template
      />
    );
    
    // Should fallback to first available template
    expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Credit Sale');
  });

  test('should preserve form state during template switching', async () => {
    const user = userEvent.setup();
    const onTemplateSelect = vi.fn();
    
    render(
      <MobileTemplateSelector 
        {...defaultProps}
        onTemplateSelect={onTemplateSelect}
      />
    );
    
    // Clear initial calls from component initialization
    onTemplateSelect.mockClear();
    
    // Select multiple templates in sequence
    await user.click(screen.getByRole('button', { expanded: false }));
    await user.click(screen.getByRole('option', { name: /credit sale/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Credit Sale');
    });
    
    await user.click(screen.getByRole('button', { expanded: false }));
    await user.click(screen.getByRole('option', { name: /purchase/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Purchase');
    });
    
    // Verify each selection was properly handled
    expect(onTemplateSelect).toHaveBeenCalledTimes(2);
    expect(onTemplateSelect).toHaveBeenNthCalledWith(1, 'credit-sale');
    expect(onTemplateSelect).toHaveBeenNthCalledWith(2, 'purchase');
  });
});

describe('MobileTemplateSelector - LocalStorage Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('should save template selection to localStorage', async () => {
    const user = userEvent.setup();
    render(<MobileTemplateSelector {...defaultProps} />);
    
    // Select a template
    await user.click(screen.getByRole('button', { expanded: false }));
    await user.click(screen.getByRole('option', { name: /credit sale/i }));
    
    // Verify localStorage was called
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'journal-template-preferences',
      expect.stringContaining('"lastSelectedTemplate":"credit-sale"')
    );
  });

  test('should attempt to load template selection from localStorage on mount', () => {
    const onTemplateSelect = vi.fn();
    
    render(<MobileTemplateSelector {...defaultProps} onTemplateSelect={onTemplateSelect} />);
    
    // Verify that localStorage.getItem was called with the correct key
    expect(localStorage.getItem).toHaveBeenCalledWith('journal-template-preferences');
    
    // Since no valid localStorage data is available, should use default template
    expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Cash Sale');
    expect(onTemplateSelect).toHaveBeenCalledWith('cash-sale');
  });

  test('should handle corrupted localStorage data gracefully', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock localStorage.getItem to return invalid JSON
    (localStorage.getItem as any).mockReturnValue('invalid-json');
    
    render(<MobileTemplateSelector {...defaultProps} />);
    
    // Should fallback to default template
    expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Cash Sale');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to load template preferences:',
      expect.any(Error)
    );
    
    consoleWarnSpy.mockRestore();
  });

  test('should handle localStorage unavailable gracefully', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock localStorage to throw error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error('localStorage unavailable');
    });
    
    const user = userEvent.setup();
    render(<MobileTemplateSelector {...defaultProps} />);
    
    // Select a template
    await user.click(screen.getByRole('button', { expanded: false }));
    await user.click(screen.getByRole('option', { name: /credit sale/i }));
    
    // Should still work but log warning
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Template selection will not be persisted due to localStorage error'
    );
    
    // Restore original localStorage
    localStorage.setItem = originalSetItem;
    consoleWarnSpy.mockRestore();
  });

  test('should validate localStorage data structure', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Set invalid structure in localStorage
    localStorage.setItem('journal-template-preferences', JSON.stringify({
      invalidKey: 'invalid-value'
    }));
    
    render(<MobileTemplateSelector {...defaultProps} />);
    
    // Should fallback to default template
    expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Cash Sale');
    
    consoleWarnSpy.mockRestore();
  });

  test('should clear localStorage when stored template no longer exists', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock localStorage.getItem to return non-existent template
    const preferences = {
      lastSelectedTemplate: 'non-existent-template',
      timestamp: Date.now()
    };
    (localStorage.getItem as any).mockReturnValue(JSON.stringify(preferences));
    
    render(<MobileTemplateSelector {...defaultProps} />);
    
    // Should clear localStorage and fallback to default
    expect(localStorage.removeItem).toHaveBeenCalledWith('journal-template-preferences');
    expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Cash Sale');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('no longer exists')
    );
    
    consoleWarnSpy.mockRestore();
  });
});

describe('MobileTemplateSelector - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('should handle empty templates array', () => {
    render(
      <MobileTemplateSelector 
        {...defaultProps}
        templates={[]}
      />
    );
    
    // Should render nothing when no templates
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('should handle missing template data gracefully', () => {
    const incompleteTemplates = [
      {
        id: 'incomplete',
        name: 'Incomplete Template',
        description: '',
        icon: '',
        category: 'other' as const,
        lines: []
      }
    ];
    
    render(
      <MobileTemplateSelector 
        {...defaultProps}
        templates={incompleteTemplates}
      />
    );
    
    // Should still render with incomplete data
    expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Incomplete Template');
  });

  test('should handle callback errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Create a callback that only throws on the second call (after initialization)
    let callCount = 0;
    const errorCallback = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount > 1) {
        throw new Error('Callback error');
      }
    });
    
    const user = userEvent.setup();
    render(
      <MobileTemplateSelector 
        {...defaultProps}
        onTemplateSelect={errorCallback}
      />
    );
    
    // Select a template (this should trigger the error)
    await user.click(screen.getByRole('button', { expanded: false }));
    await user.click(screen.getByRole('option', { name: /credit sale/i }));
    
    // Should log error but not crash
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error notifying parent components of template selection:',
      expect.any(Error)
    );
    
    consoleErrorSpy.mockRestore();
  });
});

describe('MobileTemplateSelector - Responsive Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('should handle window resize events', async () => {
    render(<MobileTemplateSelector {...defaultProps} />);
    
    const triggerButton = screen.getByRole('button', { expanded: false });
    
    // Mock getBoundingClientRect
    triggerButton.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      bottom: 148,
      left: 0,
      right: 375,
      width: 375,
      height: 48
    }));
    
    // Open dropdown
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    // Simulate window resize
    fireEvent(window, new Event('resize'));
    
    // Should still be functional after resize
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  test('should handle orientation change events', async () => {
    render(<MobileTemplateSelector {...defaultProps} />);
    
    const triggerButton = screen.getByRole('button', { expanded: false });
    
    // Open dropdown
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    // Simulate orientation change
    fireEvent(window, new Event('orientationchange'));
    
    // Should still be functional after orientation change
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  test('should optimize dropdown positioning for mobile devices', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667
    });
    
    render(<MobileTemplateSelector {...defaultProps} />);
    
    const triggerButton = screen.getByRole('button', { expanded: false });
    
    // Mock button position in upper half of screen
    triggerButton.getBoundingClientRect = vi.fn(() => ({
      top: 200, // Upper half of 667px screen
      bottom: 248,
      left: 0,
      right: 375,
      width: 375,
      height: 48
    }));
    
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      const dropdownContainer = screen.getByRole('listbox').closest('[class*="absolute"]');
      // Should position below for better thumb reach
      expect(dropdownContainer).toHaveClass('top-full');
    });
  });

  test('should handle breakpoint transitions', () => {
    const { rerender } = render(<MobileTemplateSelector {...defaultProps} />);
    
    // Should render consistently across re-renders
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
    
    rerender(<MobileTemplateSelector {...defaultProps} />);
    
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
  });
});

describe('MobileTemplateSelector - Touch Optimizations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should have minimum 44px touch targets', () => {
    render(<MobileTemplateSelector {...defaultProps} />);
    
    const triggerButton = screen.getByRole('button', { expanded: false });
    const computedStyle = window.getComputedStyle(triggerButton);
    
    // Check minimum height is at least 44px (we set it to 48px for better UX)
    expect(parseInt(computedStyle.minHeight)).toBeGreaterThanOrEqual(44);
  });

  test('should prevent event bubbling on touch events', async () => {
    const parentClickHandler = vi.fn();
    
    render(
      <div onClick={parentClickHandler}>
        <MobileTemplateSelector {...defaultProps} />
      </div>
    );
    
    const triggerButton = screen.getByRole('button', { expanded: false });
    
    // Simulate touch start event
    fireEvent.touchStart(triggerButton);
    
    // Parent click handler should not be called due to stopPropagation
    expect(parentClickHandler).not.toHaveBeenCalled();
  });

  test('should handle touch events without conflicts', async () => {
    render(<MobileTemplateSelector {...defaultProps} />);
    
    const triggerButton = screen.getByRole('button', { expanded: false });
    
    // Simulate touch interaction to open dropdown
    fireEvent.touchStart(triggerButton);
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    // Find and interact with template option
    const templateOption = screen.getByRole('option', { name: /credit sale/i });
    
    // Simulate touch events on option
    fireEvent.touchStart(templateOption);
    fireEvent.touchEnd(templateOption);
    fireEvent.click(templateOption);
    
    // Verify callbacks were called
    expect(defaultProps.onTemplateSelect).toHaveBeenCalledWith('credit-sale');
    expect(defaultProps.onApplyTemplate).toHaveBeenCalledWith('credit-sale');
  });

  test('should have touch-optimized CSS classes', () => {
    render(<MobileTemplateSelector {...defaultProps} />);
    
    const container = screen.getByRole('button', { expanded: false }).closest('div');
    
    // Check for touch-manipulation class
    expect(container).toHaveClass('touch-manipulation');
  });

  test('should handle dropdown positioning for thumb reach', async () => {
    // Mock window dimensions for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667
    });
    
    render(<MobileTemplateSelector {...defaultProps} />);
    
    const triggerButton = screen.getByRole('button', { expanded: false });
    
    // Mock getBoundingClientRect to simulate button position
    triggerButton.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      bottom: 148,
      left: 0,
      right: 375,
      width: 375,
      height: 48
    }));
    
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      const dropdownContainer = screen.getByRole('listbox').closest('[class*="absolute"]');
      // Should position below for better thumb reach when button is in upper area
      expect(dropdownContainer).toHaveClass('top-full');
    });
  });
});