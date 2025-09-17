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

describe('MobileTemplateSelector - Responsive Behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Viewport size handling', () => {
    test('should handle mobile viewport dimensions', () => {
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
      
      // Should render properly on mobile
      expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
      expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Cash Sale');
    });

    test('should handle tablet viewport dimensions', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024
      });
      
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Should render properly on tablet
      expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
    });

    test('should handle small mobile viewport dimensions', () => {
      // Mock very small mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 568
      });
      
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Should render properly on small mobile
      expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
    });

    test('should handle large mobile viewport dimensions', () => {
      // Mock large mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 414
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 896
      });
      
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Should render properly on large mobile
      expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
    });
  });

  describe('Window resize handling', () => {
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
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      
      fireEvent(window, new Event('resize'));
      
      // Should still be functional after resize
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    test('should recalculate dropdown position on resize', async () => {
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Mock initial position
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
      
      // Change button position and trigger resize
      triggerButton.getBoundingClientRect = vi.fn(() => ({
        top: 500,
        bottom: 548,
        left: 0,
        right: 375,
        width: 375,
        height: 48
      }));
      
      fireEvent(window, new Event('resize'));
      
      // Dropdown should still be visible and positioned correctly
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    test('should handle multiple rapid resize events', async () => {
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
      
      // Simulate multiple rapid resize events
      for (let i = 0; i < 5; i++) {
        fireEvent(window, new Event('resize'));
      }
      
      // Should handle all resize events without issues
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('Orientation change handling', () => {
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

    test('should recalculate positioning on orientation change', async () => {
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Mock portrait position
      triggerButton.getBoundingClientRect = vi.fn(() => ({
        top: 200,
        bottom: 248,
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
      
      // Simulate landscape orientation (wider, shorter)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 667
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 375
      });
      
      // Mock new position after orientation change
      triggerButton.getBoundingClientRect = vi.fn(() => ({
        top: 100,
        bottom: 148,
        left: 0,
        right: 667,
        width: 667,
        height: 48
      }));
      
      fireEvent(window, new Event('orientationchange'));
      
      // Should recalculate position and remain functional
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('Dropdown positioning optimization', () => {
    test('should position dropdown below for better thumb reach on mobile', async () => {
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
      
      // Mock button position in upper half of screen (good for thumb reach)
      triggerButton.getBoundingClientRect = vi.fn(() => ({
        top: 200, // Upper 30% of 667px screen
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

    test('should position dropdown above when button is in lower half and space allows', async () => {
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
      
      // Mock button position in lower half with sufficient space above
      triggerButton.getBoundingClientRect = vi.fn(() => ({
        top: 500, // Lower part of screen
        bottom: 548,
        left: 0,
        right: 375,
        width: 375,
        height: 48
      }));
      
      fireEvent.click(triggerButton);
      
      await waitFor(() => {
        const dropdown = screen.getByRole('listbox').closest('div');
        // Should position above when in lower half
        expect(dropdown).toHaveClass('bottom-full');
      });
    });

    test('should use standard positioning logic on desktop', async () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 768
      });
      
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Mock button position with plenty of space below
      triggerButton.getBoundingClientRect = vi.fn(() => ({
        top: 100,
        bottom: 148,
        left: 0,
        right: 300,
        width: 300,
        height: 48
      }));
      
      fireEvent.click(triggerButton);
      
      await waitFor(() => {
        const dropdownContainer = screen.getByRole('listbox').closest('[class*="absolute"]');
        // Should use standard positioning (below when space available)
        expect(dropdownContainer).toHaveClass('top-full');
      });
    });

    test('should handle edge case where dropdown doesnt fit in either direction', async () => {
      // Mock very small viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 400
      });
      
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Mock button position in middle with limited space both ways
      triggerButton.getBoundingClientRect = vi.fn(() => ({
        top: 200,
        bottom: 248,
        left: 0,
        right: 320,
        width: 320,
        height: 48
      }));
      
      fireEvent.click(triggerButton);
      
      await waitFor(() => {
        const dropdownContainer = screen.getByRole('listbox').closest('[class*="absolute"]');
        // Should still position somewhere (prefer below in this case)
        expect(dropdownContainer).toHaveClass('top-full');
      });
    });
  });

  describe('Breakpoint transitions', () => {
    test('should handle smooth transitions between breakpoints', () => {
      const { rerender } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // Should render consistently
      expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
      
      // Simulate breakpoint change
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      
      rerender(<MobileTemplateSelector {...defaultProps} />);
      
      // Should still render properly after breakpoint change
      expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
    });

    test('should maintain state during breakpoint transitions', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // Select a template
      await user.click(screen.getByRole('button', { expanded: false }));
      await user.click(screen.getByRole('option', { name: /credit sale/i }));
      
      // Verify selection
      expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Credit Sale');
      
      // Simulate breakpoint change
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
      
      rerender(<MobileTemplateSelector {...defaultProps} selectedTemplate="credit-sale" />);
      
      // Should maintain selected template after breakpoint change
      expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Credit Sale');
    });

    test('should handle rapid breakpoint changes', () => {
      const { rerender } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // Simulate multiple rapid breakpoint changes
      const viewports = [375, 768, 1024, 414, 320, 768];
      
      viewports.forEach(width => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width
        });
        
        rerender(<MobileTemplateSelector {...defaultProps} />);
        
        // Should remain functional at each breakpoint
        expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
      });
    });
  });

  describe('CSS and styling responsiveness', () => {
    test('should apply responsive CSS classes correctly', () => {
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const container = screen.getByRole('button', { expanded: false }).closest('div');
      
      // Should have touch-optimized classes
      expect(container).toHaveClass('touch-manipulation');
    });

    test('should handle CSS transitions during responsive changes', async () => {
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Open dropdown
      fireEvent.click(triggerButton);
      
      await waitFor(() => {
        const dropdownContainer = screen.getByRole('listbox').closest('[class*="absolute"]');
        expect(dropdownContainer).toHaveClass('opacity-100');
      });
      
      // Simulate viewport change
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      
      fireEvent(window, new Event('resize'));
      
      // Should maintain proper styling after resize
      const dropdownContainer = screen.getByRole('listbox').closest('[class*="absolute"]');
      expect(dropdownContainer).toHaveClass('opacity-100');
    });
  });
});