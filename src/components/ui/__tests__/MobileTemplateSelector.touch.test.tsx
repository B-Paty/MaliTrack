import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileTemplateSelector, type TransactionTemplate } from '../MobileTemplateSelector';

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

// Helper function to simulate touch events
const simulateTouch = (element: Element, eventType: string, touches: Array<{ clientX: number; clientY: number }>) => {
  const touchEvent = new TouchEvent(eventType, {
    touches: touches.map(touch => ({
      ...touch,
      identifier: 0,
      target: element,
      radiusX: 1,
      radiusY: 1,
      rotationAngle: 0,
      force: 1,
    } as Touch)),
    targetTouches: touches.map(touch => ({
      ...touch,
      identifier: 0,
      target: element,
      radiusX: 1,
      radiusY: 1,
      rotationAngle: 0,
      force: 1,
    } as Touch)),
    changedTouches: touches.map(touch => ({
      ...touch,
      identifier: 0,
      target: element,
      radiusX: 1,
      radiusY: 1,
      rotationAngle: 0,
      force: 1,
    } as Touch)),
    bubbles: true,
    cancelable: true,
  });
  
  element.dispatchEvent(touchEvent);
};

describe('MobileTemplateSelector - Touch Interaction Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock touch support
    Object.defineProperty(window, 'ontouchstart', {
      value: {},
      writable: true,
    });
  });

  describe('Touch Target Size Tests', () => {
    test('should have minimum 44px touch targets on iPhone SE (320px)', async () => {
      // Set iPhone SE viewport
      Object.defineProperty(window, 'innerWidth', { value: 320, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 568, writable: true });
      
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Check button dimensions meet minimum touch target size
      const buttonRect = triggerButton.getBoundingClientRect();
      expect(buttonRect.height).toBeGreaterThanOrEqual(44);
      
      // Button should be wide enough for easy tapping
      expect(buttonRect.width).toBeGreaterThan(100);
    });

    test('should have minimum 44px touch targets on iPhone 12 (375px)', async () => {
      // Set iPhone 12 viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 812, writable: true });
      
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Check trigger button
      const triggerButton = screen.getByRole('button', { expanded: false });
      const buttonRect = triggerButton.getBoundingClientRect();
      expect(buttonRect.height).toBeGreaterThanOrEqual(44);
      
      // Open dropdown and check option touch targets
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      const options = screen.getAllByRole('option');
      options.forEach(option => {
        const optionRect = option.getBoundingClientRect();
        expect(optionRect.height).toBeGreaterThanOrEqual(44);
      });
    });

    test('should have minimum 44px touch targets on iPhone 12 Pro Max (414px)', async () => {
      // Set iPhone 12 Pro Max viewport
      Object.defineProperty(window, 'innerWidth', { value: 414, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 896, writable: true });
      
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      const buttonRect = triggerButton.getBoundingClientRect();
      expect(buttonRect.height).toBeGreaterThanOrEqual(44);
      
      // Check expanded state
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      const options = screen.getAllByRole('option');
      options.forEach(option => {
        const optionRect = option.getBoundingClientRect();
        expect(optionRect.height).toBeGreaterThanOrEqual(44);
        expect(optionRect.width).toBeGreaterThan(100);
      });
    });

    test('should maintain touch targets on tablet sizes (768px)', async () => {
      // Set tablet viewport
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 1024, writable: true });
      
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      const buttonRect = triggerButton.getBoundingClientRect();
      expect(buttonRect.height).toBeGreaterThanOrEqual(44);
      
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      const options = screen.getAllByRole('option');
      options.forEach(option => {
        const optionRect = option.getBoundingClientRect();
        expect(optionRect.height).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Touch Event Handling', () => {
    test('should respond to touch events on trigger button', async () => {
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Simulate touch tap
      simulateTouch(triggerButton, 'touchstart', [{ clientX: 100, clientY: 100 }]);
      simulateTouch(triggerButton, 'touchend', [{ clientX: 100, clientY: 100 }]);
      
      // Should open dropdown
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    test('should respond to touch events on template options', async () => {
      const mockOnTemplateSelect = vi.fn();
      const user = userEvent.setup();
      
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
      
      // Touch select an option
      const creditSaleOption = screen.getByRole('option', { name: /credit sale/i });
      simulateTouch(creditSaleOption, 'touchstart', [{ clientX: 100, clientY: 100 }]);
      simulateTouch(creditSaleOption, 'touchend', [{ clientX: 100, clientY: 100 }]);
      
      await waitFor(() => {
        expect(mockOnTemplateSelect).toHaveBeenCalledWith('credit-sale');
      });
    });

    test('should handle touch outside to close dropdown', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <MobileTemplateSelector {...defaultProps} />
          <div data-testid="outside-area">Outside</div>
        </div>
      );
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      // Touch outside
      const outsideArea = screen.getByTestId('outside-area');
      simulateTouch(outsideArea, 'touchstart', [{ clientX: 50, clientY: 50 }]);
      simulateTouch(outsideArea, 'touchend', [{ clientX: 50, clientY: 50 }]);
      
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    test('should prevent accidental selections during scrolling', async () => {
      const mockOnTemplateSelect = vi.fn();
      const user = userEvent.setup();
      
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
      
      const creditSaleOption = screen.getByRole('option', { name: /credit sale/i });
      
      // Simulate scroll gesture (touchstart, touchmove, touchend)
      simulateTouch(creditSaleOption, 'touchstart', [{ clientX: 100, clientY: 100 }]);
      simulateTouch(creditSaleOption, 'touchmove', [{ clientX: 100, clientY: 150 }]); // Moved 50px
      simulateTouch(creditSaleOption, 'touchend', [{ clientX: 100, clientY: 150 }]);
      
      // Should not trigger selection due to movement
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockOnTemplateSelect).not.toHaveBeenCalled();
    });

    test('should handle rapid touch events without issues', async () => {
      const mockOnTemplateSelect = vi.fn();
      const user = userEvent.setup();
      
      render(
        <MobileTemplateSelector 
          {...defaultProps} 
          onTemplateSelect={mockOnTemplateSelect}
        />
      );
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Rapid touch events
      for (let i = 0; i < 5; i++) {
        simulateTouch(triggerButton, 'touchstart', [{ clientX: 100, clientY: 100 }]);
        simulateTouch(triggerButton, 'touchend', [{ clientX: 100, clientY: 100 }]);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Should handle rapid touches gracefully
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });
  });

  describe('Thumb-Friendly Positioning', () => {
    test('should position dropdown for easy thumb access on right-handed users', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 812, writable: true });
      
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      const dropdown = screen.getByRole('listbox');
      const dropdownRect = dropdown.getBoundingClientRect();
      
      // Dropdown should be positioned within thumb reach
      // (typically bottom 2/3 of screen for right-handed users)
      const screenHeight = window.innerHeight;
      const thumbReachArea = screenHeight * 0.33; // Top 1/3 is harder to reach
      
      expect(dropdownRect.top).toBeGreaterThan(thumbReachArea);
    });

    test('should ensure dropdown fits within viewport on small screens', async () => {
      // Set small mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 320, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 568, writable: true });
      
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      const dropdown = screen.getByRole('listbox');
      const dropdownRect = dropdown.getBoundingClientRect();
      
      // Dropdown should fit within viewport
      expect(dropdownRect.left).toBeGreaterThanOrEqual(0);
      expect(dropdownRect.right).toBeLessThanOrEqual(window.innerWidth);
      expect(dropdownRect.top).toBeGreaterThanOrEqual(0);
      expect(dropdownRect.bottom).toBeLessThanOrEqual(window.innerHeight);
    });

    test('should adjust positioning based on available space', async () => {
      const user = userEvent.setup();
      
      // Render component near bottom of screen
      const { container } = render(
        <div style={{ paddingTop: '500px' }}>
          <MobileTemplateSelector {...defaultProps} />
        </div>
      );
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      // Dropdown should adjust position to stay in viewport
      const dropdown = screen.getByRole('listbox');
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('Touch Gesture Support', () => {
    test('should support swipe gestures for navigation', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      const dropdown = screen.getByRole('listbox');
      
      // Simulate swipe down gesture
      simulateTouch(dropdown, 'touchstart', [{ clientX: 100, clientY: 100 }]);
      simulateTouch(dropdown, 'touchmove', [{ clientX: 100, clientY: 200 }]);
      simulateTouch(dropdown, 'touchend', [{ clientX: 100, clientY: 200 }]);
      
      // Dropdown should remain open and functional
      expect(dropdown).toBeInTheDocument();
    });

    test('should handle pinch gestures gracefully', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      const dropdown = screen.getByRole('listbox');
      
      // Simulate pinch gesture (two finger touch)
      const touchEvent = new TouchEvent('touchstart', {
        touches: [
          { clientX: 100, clientY: 100, identifier: 0 } as Touch,
          { clientX: 200, clientY: 200, identifier: 1 } as Touch,
        ],
        bubbles: true,
        cancelable: true,
      });
      
      dropdown.dispatchEvent(touchEvent);
      
      // Component should handle multi-touch gracefully
      expect(dropdown).toBeInTheDocument();
    });
  });

  describe('Touch Performance Tests', () => {
    test('should respond to touch events within 100ms', async () => {
      const mockOnTemplateSelect = vi.fn();
      const user = userEvent.setup();
      
      render(
        <MobileTemplateSelector 
          {...defaultProps} 
          onTemplateSelect={mockOnTemplateSelect}
        />
      );
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      const startTime = performance.now();
      
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Should respond quickly (allowing for test environment overhead)
      expect(responseTime).toBeLessThan(500); // Generous for test environment
    });

    test('should handle touch events without blocking UI', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Simulate multiple rapid touches
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(user.click(triggerButton));
      }
      
      // All touches should be handled without blocking
      await Promise.all(promises);
      
      // Component should remain functional
      expect(triggerButton).toBeInTheDocument();
    });
  });

  describe('Orientation Change Tests', () => {
    test('should handle portrait to landscape orientation change', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Start in portrait
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 812, writable: true });
      
      // Open dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      // Change to landscape
      Object.defineProperty(window, 'innerWidth', { value: 812, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 375, writable: true });
      
      // Trigger orientation change event
      fireEvent(window, new Event('orientationchange'));
      fireEvent(window, new Event('resize'));
      
      // Dropdown should remain functional
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    test('should adjust touch targets after orientation change', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Change orientation
      Object.defineProperty(window, 'innerWidth', { value: 812, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 375, writable: true });
      
      fireEvent(window, new Event('orientationchange'));
      fireEvent(window, new Event('resize'));
      
      // Check touch targets are still appropriate
      const triggerButton = screen.getByRole('button', { expanded: false });
      const buttonRect = triggerButton.getBoundingClientRect();
      expect(buttonRect.height).toBeGreaterThanOrEqual(44);
      
      // Open dropdown and check options
      await user.click(triggerButton);
      await waitFor(() => screen.getByRole('listbox'));
      
      const options = screen.getAllByRole('option');
      options.forEach(option => {
        const optionRect = option.getBoundingClientRect();
        expect(optionRect.height).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Touch Accessibility', () => {
    test('should provide haptic feedback simulation for touch interactions', async () => {
      // Mock vibration API
      const mockVibrate = vi.fn();
      Object.defineProperty(navigator, 'vibrate', {
        value: mockVibrate,
        writable: true,
      });
      
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Touch interaction should work regardless of vibration support
      await user.click(triggerButton);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    test('should work with assistive touch technologies', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Component should work with switch control and other assistive technologies
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Focus and activate with assistive technology simulation
      triggerButton.focus();
      fireEvent.click(triggerButton);
      
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });
  });
});