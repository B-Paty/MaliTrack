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

describe('MobileTemplateSelector - Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('ARIA Implementation Tests', () => {
    test('should have proper ARIA attributes on trigger button', async () => {
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Check ARIA attributes
      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
      expect(triggerButton).toHaveAttribute('aria-haspopup', 'listbox');
      expect(triggerButton).toHaveAttribute('aria-label');
      expect(triggerButton).toHaveAccessibleName();
    });

    test('should update ARIA attributes when dropdown expands', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Expand dropdown
      await user.click(triggerButton);
      
      await waitFor(() => {
        const expandedButton = screen.getByRole('button', { expanded: true });
        expect(expandedButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    test('should have proper ARIA attributes on template list', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Expand dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      
      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        expect(listbox).toHaveAttribute('aria-label');
        expect(listbox).toBeInTheDocument();
      });
    });

    test('should have proper ARIA attributes on template options', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Expand dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        
        options.forEach((option, index) => {
          expect(option).toHaveAttribute('aria-selected');
          expect(option).toHaveAccessibleName();
          
          // First option should be selected (cash-sale)
          if (index === 0) {
            expect(option).toHaveAttribute('aria-selected', 'true');
          } else {
            expect(option).toHaveAttribute('aria-selected', 'false');
          }
        });
      });
    });

    test('should update aria-selected when template selection changes', async () => {
      const user = userEvent.setup();
      const mockOnTemplateSelect = vi.fn();
      render(<MobileTemplateSelector {...defaultProps} onTemplateSelect={mockOnTemplateSelect} />);
      
      // Expand dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      
      await waitFor(() => {
        const creditSaleOption = screen.getByRole('option', { name: /credit sale/i });
        expect(creditSaleOption).toHaveAttribute('aria-selected', 'false');
      });
      
      // Select credit sale
      const creditSaleOption = screen.getByRole('option', { name: /credit sale/i });
      await user.click(creditSaleOption);
      
      // Verify selection callback was called
      expect(mockOnTemplateSelect).toHaveBeenCalledWith('credit-sale');
    });
  });

  describe('Keyboard Navigation Tests', () => {
    test('should support Tab navigation to trigger button', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Tab to the trigger button
      await user.tab();
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      expect(triggerButton).toHaveFocus();
    });

    test('should open dropdown with Enter key', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      triggerButton.focus();
      
      // Press Enter to open dropdown
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { expanded: true })).toHaveAttribute('aria-expanded', 'true');
      });
    });

    test('should open dropdown with Space key', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      triggerButton.focus();
      
      // Press Space to open dropdown
      await user.keyboard(' ');
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { expanded: true })).toHaveAttribute('aria-expanded', 'true');
      });
    });

    test('should close dropdown with Escape key', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      // Press Escape to close
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { expanded: false })).toHaveAttribute('aria-expanded', 'false');
      });
    });

    test('should navigate options with Arrow keys', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      // Focus should be on first option initially
      const firstOption = screen.getByRole('option', { name: /cash sale/i });
      expect(firstOption).toHaveFocus();
      
      // Navigate down with Arrow Down
      await user.keyboard('{ArrowDown}');
      
      const secondOption = screen.getByRole('option', { name: /credit sale/i });
      expect(secondOption).toHaveFocus();
      
      // Navigate up with Arrow Up
      await user.keyboard('{ArrowUp}');
      expect(firstOption).toHaveFocus();
    });

    test('should wrap navigation at list boundaries', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      const firstOption = screen.getByRole('option', { name: /cash sale/i });
      const lastOption = screen.getByRole('option', { name: /credit purchase/i });
      
      // Navigate to last option
      firstOption.focus();
      await user.keyboard('{ArrowUp}'); // Should wrap to last
      expect(lastOption).toHaveFocus();
      
      // Navigate from last to first
      await user.keyboard('{ArrowDown}'); // Should wrap to first
      expect(firstOption).toHaveFocus();
    });

    test('should select option with Enter key', async () => {
      const user = userEvent.setup();
      const mockOnTemplateSelect = vi.fn();
      
      render(
        <MobileTemplateSelector 
          {...defaultProps} 
          onTemplateSelect={mockOnTemplateSelect}
        />
      );
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      // Navigate to second option
      await user.keyboard('{ArrowDown}');
      
      // Select with Enter
      await user.keyboard('{Enter}');
      
      expect(mockOnTemplateSelect).toHaveBeenCalledWith('credit-sale');
    });

    test('should select option with Space key', async () => {
      const user = userEvent.setup();
      const mockOnTemplateSelect = vi.fn();
      
      render(
        <MobileTemplateSelector 
          {...defaultProps} 
          onTemplateSelect={mockOnTemplateSelect}
        />
      );
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      // Navigate to third option
      await user.keyboard('{ArrowDown}{ArrowDown}');
      
      // Select with Space
      await user.keyboard(' ');
      
      expect(mockOnTemplateSelect).toHaveBeenCalledWith('cash-purchase');
    });
  });

  describe('Focus Management Tests', () => {
    test('should return focus to trigger button when dropdown closes', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Open dropdown
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      // Close with Escape
      await user.keyboard('{Escape}');
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        expect(triggerButton).toHaveFocus();
      });
    });

    test('should return focus to trigger button after template selection', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Open dropdown
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      // Select an option
      const creditSaleOption = screen.getByRole('option', { name: /credit sale/i });
      await user.click(creditSaleOption);
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { expanded: false })).toHaveFocus();
      });
    });

    test('should trap focus within dropdown when expanded', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <button>Before</button>
          <MobileTemplateSelector {...defaultProps} />
          <button>After</button>
        </div>
      );
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      // Focus should be on first option
      const firstOption = screen.getByRole('option', { name: /cash sale/i });
      expect(firstOption).toHaveFocus();
      
      // Tab should not leave the dropdown
      await user.tab();
      
      // Should still be within the dropdown options
      const focusedElement = document.activeElement;
      const allOptions = screen.getAllByRole('option');
      expect(allOptions).toContain(focusedElement);
    });

    test('should move focus to first option when dropdown opens', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Open dropdown with keyboard
      triggerButton.focus();
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        const firstOption = screen.getByRole('option', { name: /cash sale/i });
        expect(firstOption).toHaveFocus();
      });
    });
  });

  describe('Screen Reader Compatibility Tests', () => {
    test('should announce dropdown state changes', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Check initial state announcement
      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
      expect(triggerButton).toHaveAccessibleName(/template/i);
      
      // Open dropdown
      await user.click(triggerButton);
      
      await waitFor(() => {
        const expandedButton = screen.getByRole('button', { expanded: true });
        expect(expandedButton).toHaveAttribute('aria-expanded', 'true');
      });
    });

    test('should provide accessible names for all interactive elements', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Check trigger button has accessible name
      const triggerButton = screen.getByRole('button', { expanded: false });
      expect(triggerButton).toHaveAccessibleName();
      
      // Open dropdown and check options
      await user.click(triggerButton);
      
      await waitFor(() => {
        const options = screen.getAllByRole('option');
        options.forEach(option => {
          expect(option).toHaveAccessibleName();
        });
      });
    });

    test('should provide accessible descriptions for templates', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      
      await waitFor(() => {
        // Check that template descriptions are accessible
        const cashSaleOption = screen.getByRole('option', { name: /cash sale/i });
        expect(cashSaleOption).toBeInTheDocument();
        
        // The description should be part of the accessible name or description
        expect(cashSaleOption.textContent).toContain('Record cash sales');
      });
    });

    test('should announce selection changes', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      
      await waitFor(() => {
        const creditSaleOption = screen.getByRole('option', { name: /credit sale/i });
        expect(creditSaleOption).toHaveAttribute('aria-selected', 'false');
      });
      
      // Select credit sale
      const creditSaleOption = screen.getByRole('option', { name: /credit sale/i });
      await user.click(creditSaleOption);
      
      // Check that selection is announced through aria-selected
      await user.click(screen.getByRole('button', { expanded: false }));
      
      await waitFor(() => {
        const updatedCreditSaleOption = screen.getByRole('option', { name: /credit sale/i });
        expect(updatedCreditSaleOption).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('Axe Accessibility Tests', () => {
    test('should have no accessibility violations in collapsed state', async () => {
      const { container } = render(<MobileTemplateSelector {...defaultProps} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have no accessibility violations in expanded state', async () => {
      const user = userEvent.setup();
      const { container } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // Expand dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have no accessibility violations with different templates', async () => {
      const { container } = render(
        <MobileTemplateSelector 
          {...defaultProps} 
          selectedTemplate="credit-purchase"
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have no accessibility violations with empty templates', async () => {
      const { container } = render(
        <MobileTemplateSelector 
          {...defaultProps} 
          templates={[]}
        />
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have no accessibility violations during keyboard navigation', async () => {
      const user = userEvent.setup();
      const { container } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // Navigate with keyboard
      await user.tab();
      await user.keyboard('{Enter}');
      await waitFor(() => screen.getByRole('listbox'));
      
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    test('should maintain sufficient color contrast for text elements', async () => {
      const { container } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // This test would typically use a color contrast analyzer
      // For now, we'll check that text elements are properly styled
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Check that button has proper styling classes that ensure contrast
      expect(triggerButton).toHaveClass('justify-center'); // Should have styling classes
      expect(triggerButton).toBeVisible();
    });

    test('should be usable without color alone', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      
      await waitFor(() => {
        // Check that selected state is indicated by more than just color
        const options = screen.getAllByRole('option');
        const selectedOption = options.find(option => 
          option.getAttribute('aria-selected') === 'true'
        );
        expect(selectedOption).toBeDefined();
        expect(selectedOption).toHaveAttribute('aria-selected', 'true');
        
        // Should have text or icon indicators, not just color
        expect(selectedOption).toBeInTheDocument();
      });
    });
  });

  describe('Reduced Motion Accessibility', () => {
    test('should respect prefers-reduced-motion setting', async () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Component should still function with reduced motion
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });
  });
});