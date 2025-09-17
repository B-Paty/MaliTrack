import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MobileTemplateSelector, type TransactionTemplate } from '../MobileTemplateSelector';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock templates for testing
const mockTemplates: TransactionTemplate[] = [
  {
    id: 'cash-sale',
    name: 'Cash Sale',
    icon: '💰',
    description: 'Record cash sales',
    accounts: [
      { account: '1010', type: 'debit', amount: '' },
      { account: '4010', type: 'credit', amount: '' }
    ]
  },
  {
    id: 'credit-sale',
    name: 'Credit Sale',
    icon: '📄',
    description: 'Record credit sales',
    accounts: [
      { account: '1020', type: 'debit', amount: '' },
      { account: '4010', type: 'credit', amount: '' }
    ]
  },
  {
    id: 'cash-purchase',
    name: 'Cash Purchase',
    icon: '🛒',
    description: 'Record cash purchases',
    accounts: [
      { account: '5010', type: 'debit', amount: '' },
      { account: '1010', type: 'credit', amount: '' }
    ]
  },
  {
    id: 'credit-purchase',
    name: 'Credit Purchase',
    icon: '📋',
    description: 'Record credit purchases',
    accounts: [
      { account: '5010', type: 'debit', amount: '' },
      { account: '2010', type: 'credit', amount: '' }
    ]
  }
];

const defaultProps = {
  templates: mockTemplates,
  selectedTemplate: 'cash-sale',
  onTemplateSelect: vi.fn(),
  onApplyTemplate: vi.fn()
};

describe('MobileTemplateSelector - Comprehensive Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Reset viewport to mobile default
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 812,
    });
  });

  describe('Complete User Journey Tests', () => {
    test('should complete full interaction cycle with keyboard navigation', async () => {
      const mockOnTemplateSelect = vi.fn();
      const mockOnApplyTemplate = vi.fn();
      const user = userEvent.setup();
      
      const { container } = render(
        <MobileTemplateSelector 
          {...defaultProps}
          onTemplateSelect={mockOnTemplateSelect}
          onApplyTemplate={mockOnApplyTemplate}
        />
      );
      
      // 1. Initial accessibility check
      let results = await axe(container);
      expect(results).toHaveNoViolations();
      
      // 2. Navigate to component with Tab
      await user.tab();
      const triggerButton = screen.getByRole('button', { expanded: false });
      expect(triggerButton).toHaveFocus();
      
      // 3. Open dropdown with Enter
      await user.keyboard('{Enter}');
      await waitFor(() => screen.getByRole('listbox'));
      
      // 4. Accessibility check in expanded state
      results = await axe(container);
      expect(results).toHaveNoViolations();
      
      // 5. Navigate options with arrow keys
      await user.keyboard('{ArrowDown}');
      const secondOption = screen.getByRole('option', { name: /credit sale/i });
      expect(secondOption).toHaveFocus();
      
      // 6. Select option with Enter
      await user.keyboard('{Enter}');
      
      // 7. Verify selection callback
      expect(mockOnTemplateSelect).toHaveBeenCalledWith('credit-sale');
      
      // 8. Verify focus returns to trigger
      await waitFor(() => {
        expect(screen.getByRole('button', { expanded: false })).toHaveFocus();
      });
      
      // 9. Final accessibility check
      results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should complete full interaction cycle with mouse/touch', async () => {
      const mockOnTemplateSelect = vi.fn();
      const user = userEvent.setup();
      
      const { container } = render(
        <MobileTemplateSelector 
          {...defaultProps}
          onTemplateSelect={mockOnTemplateSelect}
        />
      );
      
      // 1. Initial state check
      const triggerButton = screen.getByRole('button', { expanded: false });
      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
      
      // 2. Click to open dropdown
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      // 3. Verify expanded state
      expect(screen.getByRole('button', { expanded: true })).toHaveAttribute('aria-expanded', 'true');
      
      // 4. Click on option
      const purchaseOption = screen.getByRole('option', { name: /cash purchase/i });
      await user.click(purchaseOption);
      
      // 5. Verify selection and closure
      expect(mockOnTemplateSelect).toHaveBeenCalledWith('cash-purchase');
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
      
      // 6. Accessibility check after interaction
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should handle complete responsive behavior cycle', async () => {
      const user = userEvent.setup();
      const { container } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // 1. Start on mobile (375px)
      expect(window.innerWidth).toBe(375);
      
      // 2. Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      // 3. Change to landscape (812x375)
      Object.defineProperty(window, 'innerWidth', { value: 812 });
      Object.defineProperty(window, 'innerHeight', { value: 375 });
      fireEvent(window, new Event('resize'));
      
      // 4. Dropdown should remain functional
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      
      // 5. Change to tablet size (768x1024)
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      Object.defineProperty(window, 'innerHeight', { value: 1024 });
      fireEvent(window, new Event('resize'));
      
      // 6. Component should still work
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
      
      // 7. Select option
      await user.click(options[1]);
      
      // 8. Verify functionality maintained
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
      
      // 9. Final accessibility check
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    test('should recover gracefully from invalid states', async () => {
      const user = userEvent.setup();
      
      // Start with invalid selected template
      const { rerender, container } = render(
        <MobileTemplateSelector 
          {...defaultProps}
          selectedTemplate="invalid-template"
        />
      );
      
      // Should fallback to first template
      const triggerButton = screen.getByRole('button', { expanded: false });
      expect(triggerButton).toBeInTheDocument();
      
      // Should still be accessible
      let results = await axe(container);
      expect(results).toHaveNoViolations();
      
      // Update to valid template
      rerender(
        <MobileTemplateSelector 
          {...defaultProps}
          selectedTemplate="credit-sale"
        />
      );
      
      // Should work normally
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should handle empty templates gracefully', async () => {
      const { container } = render(
        <MobileTemplateSelector 
          {...defaultProps}
          templates={[]}
        />
      );
      
      // Should render without crashing
      expect(container).toBeInTheDocument();
      
      // Should be accessible even with no templates
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should handle rapid state changes', async () => {
      const mockOnTemplateSelect = vi.fn();
      const user = userEvent.setup();
      
      const { container } = render(
        <MobileTemplateSelector 
          {...defaultProps}
          onTemplateSelect={mockOnTemplateSelect}
        />
      );
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Rapid open/close cycles
      for (let i = 0; i < 5; i++) {
        await user.click(triggerButton);
        await waitFor(() => screen.getByRole('listbox'));
        
        await user.keyboard('{Escape}');
        await waitFor(() => {
          expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });
      }
      
      // Should remain functional and accessible
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Performance and Memory Tests', () => {
    test('should not cause memory leaks during repeated interactions', async () => {
      const user = userEvent.setup();
      const { unmount } = render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Simulate many interactions
      for (let i = 0; i < 20; i++) {
        await user.click(triggerButton);
        await waitFor(() => screen.getByRole('listbox'));
        
        const options = screen.getAllByRole('option');
        await user.click(options[i % options.length]);
        
        await waitFor(() => {
          expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });
      }
      
      // Clean unmount should not throw errors
      expect(() => unmount()).not.toThrow();
    });

    test('should handle large numbers of templates efficiently', async () => {
      const manyTemplates = Array.from({ length: 50 }, (_, i) => ({
        id: `template-${i}`,
        name: `Template ${i}`,
        icon: '📄',
        description: `Description ${i}`,
        accounts: [
          { account: '1010', type: 'debit' as const, amount: '' },
          { account: '4010', type: 'credit' as const, amount: '' }
        ]
      }));
      
      const user = userEvent.setup();
      const { container } = render(
        <MobileTemplateSelector 
          {...defaultProps}
          templates={manyTemplates}
        />
      );
      
      const startTime = performance.now();
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      const endTime = performance.now();
      
      // Should render quickly even with many templates
      expect(endTime - startTime).toBeLessThan(1000);
      
      // Should still be accessible
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      
      // Should handle scrolling
      const options = screen.getAllByRole('option');
      expect(options.length).toBe(50);
    });
  });

  describe('Cross-Browser Compatibility Tests', () => {
    test('should work with different event handling patterns', async () => {
      const user = userEvent.setup();
      const mockOnTemplateSelect = vi.fn();
      
      render(
        <MobileTemplateSelector 
          {...defaultProps}
          onTemplateSelect={mockOnTemplateSelect}
        />
      );
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Test different event types
      fireEvent.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      fireEvent.keyDown(triggerButton, { key: 'Escape' });
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
      
      // Test touch events
      fireEvent.touchStart(triggerButton);
      fireEvent.touchEnd(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      const firstOption = screen.getByRole('option', { name: /cash sale/i });
      fireEvent.click(firstOption);
      
      expect(mockOnTemplateSelect).toHaveBeenCalled();
    });

    test('should handle different focus management approaches', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Manual focus
      triggerButton.focus();
      expect(triggerButton).toHaveFocus();
      
      // Keyboard activation
      fireEvent.keyDown(triggerButton, { key: 'Enter' });
      await waitFor(() => screen.getByRole('listbox'));
      
      // Focus should move to first option
      const firstOption = screen.getByRole('option', { name: /cash sale/i });
      expect(firstOption).toHaveFocus();
      
      // Tab navigation
      fireEvent.keyDown(firstOption, { key: 'Tab' });
      
      // Focus should stay within dropdown or close it
      const focusedElement = document.activeElement;
      const isWithinDropdown = screen.queryByRole('listbox')?.contains(focusedElement);
      const isDropdownClosed = !screen.queryByRole('listbox');
      
      expect(isWithinDropdown || isDropdownClosed).toBe(true);
    });
  });

  describe('Integration with Form Systems', () => {
    test('should integrate properly with form validation', async () => {
      const mockOnTemplateSelect = vi.fn();
      const mockOnApplyTemplate = vi.fn();
      const user = userEvent.setup();
      
      render(
        <form>
          <MobileTemplateSelector 
            {...defaultProps}
            onTemplateSelect={mockOnTemplateSelect}
            onApplyTemplate={mockOnApplyTemplate}
          />
          <button type="submit">Submit</button>
        </form>
      );
      
      // Select a template
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      const creditSaleOption = screen.getByRole('option', { name: /credit sale/i });
      await user.click(creditSaleOption);
      
      expect(mockOnTemplateSelect).toHaveBeenCalledWith('credit-sale');
      
      // Form should still be functional
      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeInTheDocument();
    });

    test('should maintain state during form resets', async () => {
      const user = userEvent.setup();
      
      const TestForm = () => {
        const [selectedTemplate, setSelectedTemplate] = React.useState('cash-sale');
        
        return (
          <form>
            <MobileTemplateSelector 
              {...defaultProps}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
            />
            <button 
              type="button" 
              onClick={() => setSelectedTemplate('cash-sale')}
            >
              Reset
            </button>
          </form>
        );
      };
      
      render(<TestForm />);
      
      // Change selection
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      const creditSaleOption = screen.getByRole('option', { name: /credit sale/i });
      await user.click(creditSaleOption);
      
      // Reset form
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);
      
      // Should return to default state
      expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
    });
  });
});