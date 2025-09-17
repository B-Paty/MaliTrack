import { test, expect } from '@playwright/test';
import { render, screen } from '@testing-library/react';
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

describe('MobileTemplateSelector - Visual Regression Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock viewport for mobile testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });
  });

  describe('Mobile collapsed state screenshots', () => {
    test('should match collapsed state on iPhone SE (320px)', async () => {
      // Set iPhone SE viewport
      Object.defineProperty(window, 'innerWidth', { value: 320 });
      
      const { container } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // Wait for component to render
      await screen.findByRole('button', { expanded: false });
      
      // Take screenshot of collapsed state
      expect(container).toMatchSnapshot('mobile-template-selector-collapsed-320px.png');
    });

    test('should match collapsed state on iPhone 12 (375px)', async () => {
      // Set iPhone 12 viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      const { container } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // Wait for component to render
      await screen.findByRole('button', { expanded: false });
      
      // Take screenshot of collapsed state
      expect(container).toMatchSnapshot('mobile-template-selector-collapsed-375px.png');
    });

    test('should match collapsed state on iPhone 12 Pro Max (414px)', async () => {
      // Set iPhone 12 Pro Max viewport
      Object.defineProperty(window, 'innerWidth', { value: 414 });
      
      const { container } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // Wait for component to render
      await screen.findByRole('button', { expanded: false });
      
      // Take screenshot of collapsed state
      expect(container).toMatchSnapshot('mobile-template-selector-collapsed-414px.png');
    });

    test('should match collapsed state with different selected templates', async () => {
      const { container, rerender } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // Screenshot with cash-sale selected
      await screen.findByRole('button', { expanded: false });
      expect(container).toMatchSnapshot('mobile-template-selector-cash-sale-selected.png');
      
      // Screenshot with credit-sale selected
      rerender(<MobileTemplateSelector {...defaultProps} selectedTemplate="credit-sale" />);
      await screen.findByRole('button', { expanded: false });
      expect(container).toMatchSnapshot('mobile-template-selector-credit-sale-selected.png');
      
      // Screenshot with purchase selected
      rerender(<MobileTemplateSelector {...defaultProps} selectedTemplate="cash-purchase" />);
      await screen.findByRole('button', { expanded: false });
      expect(container).toMatchSnapshot('mobile-template-selector-purchase-selected.png');
    });
  });

  describe('Mobile expanded state screenshots', () => {
    test('should match expanded state on iPhone SE (320px)', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 320 });
      
      const user = userEvent.setup();
      const { container } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // Expand dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      
      // Wait for expansion animation
      await screen.findByRole('listbox');
      
      // Take screenshot of expanded state
      expect(container).toMatchSnapshot('mobile-template-selector-expanded-320px.png');
    });

    test('should match expanded state on iPhone 12 (375px)', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      const user = userEvent.setup();
      const { container } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // Expand dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      
      // Wait for expansion animation
      await screen.findByRole('listbox');
      
      // Take screenshot of expanded state
      expect(container).toMatchSnapshot('mobile-template-selector-expanded-375px.png');
    });

    test('should match expanded state on iPhone 12 Pro Max (414px)', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 414 });
      
      const user = userEvent.setup();
      const { container } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // Expand dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      
      // Wait for expansion animation
      await screen.findByRole('listbox');
      
      // Take screenshot of expanded state
      expect(container).toMatchSnapshot('mobile-template-selector-expanded-414px.png');
    });

    test('should match expanded state with scrollable content', async () => {
      // Add more templates to test scrolling
      const manyTemplates = [
        ...mockTemplates,
        {
          id: 'cash-receipt',
          name: 'Cash Receipt',
          icon: '🧾',
          description: 'Record cash receipts',
          accounts: [
            { account: '1010', type: 'debit', amount: '' },
            { account: '1020', type: 'credit', amount: '' }
          ]
        },
        {
          id: 'cash-payment',
          name: 'Cash Payment',
          icon: '💸',
          description: 'Record cash payments',
          accounts: [
            { account: '2010', type: 'debit', amount: '' },
            { account: '1010', type: 'credit', amount: '' }
          ]
        },
        {
          id: 'expense-payment',
          name: 'Expense Payment',
          icon: '📊',
          description: 'Record expense payments',
          accounts: [
            { account: '6010', type: 'debit', amount: '' },
            { account: '1010', type: 'credit', amount: '' }
          ]
        }
      ];
      
      const user = userEvent.setup();
      const { container } = render(
        <MobileTemplateSelector 
          {...defaultProps} 
          templates={manyTemplates}
        />
      );
      
      // Expand dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      
      // Wait for expansion animation
      await screen.findByRole('listbox');
      
      // Take screenshot of expanded state with scrollable content
      expect(container).toMatchSnapshot('mobile-template-selector-expanded-scrollable.png');
    });
  });

  describe('Animation and transition screenshots', () => {
    test('should capture smooth expand animation', async () => {
      const user = userEvent.setup();
      const { container } = render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Capture before expansion
      expect(container).toMatchSnapshot('mobile-template-selector-before-expand.png');
      
      // Start expansion
      await user.click(triggerButton);
      
      // Capture during expansion (mid-animation)
      // Note: This is challenging to capture consistently, so we'll capture after animation
      await screen.findByRole('listbox');
      expect(container).toMatchSnapshot('mobile-template-selector-after-expand.png');
    });

    test('should capture template selection visual feedback', async () => {
      const user = userEvent.setup();
      const { container } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // Expand dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await screen.findByRole('listbox');
      
      // Capture expanded state
      expect(container).toMatchSnapshot('mobile-template-selector-before-selection.png');
      
      // Select a different template
      const creditSaleOption = screen.getByRole('option', { name: /credit sale/i });
      await user.click(creditSaleOption);
      
      // Capture after selection (should show new selected template)
      await screen.findByRole('button', { expanded: false });
      expect(container).toMatchSnapshot('mobile-template-selector-after-selection.png');
    });
  });

  describe('Error and edge case screenshots', () => {
    test('should match appearance with empty templates', async () => {
      const { container } = render(
        <MobileTemplateSelector 
          {...defaultProps} 
          templates={[]}
        />
      );
      
      // Should show fallback state
      expect(container).toMatchSnapshot('mobile-template-selector-empty-templates.png');
    });

    test('should match appearance with single template', async () => {
      const { container } = render(
        <MobileTemplateSelector 
          {...defaultProps} 
          templates={[mockTemplates[0]]}
        />
      );
      
      // Should show single template without dropdown
      expect(container).toMatchSnapshot('mobile-template-selector-single-template.png');
    });

    test('should match appearance with invalid selected template', async () => {
      const { container } = render(
        <MobileTemplateSelector 
          {...defaultProps} 
          selectedTemplate="invalid-template"
        />
      );
      
      // Should fallback to first template
      await screen.findByRole('button', { expanded: false });
      expect(container).toMatchSnapshot('mobile-template-selector-invalid-selection.png');
    });
  });

  describe('Focus and hover state screenshots', () => {
    test('should match focused trigger button appearance', async () => {
      const { container } = render(<MobileTemplateSelector {...defaultProps} />);
      
      const triggerButton = screen.getByRole('button', { expanded: false });
      
      // Focus the button
      triggerButton.focus();
      
      // Capture focused state
      expect(container).toMatchSnapshot('mobile-template-selector-focused-trigger.png');
    });

    test('should match focused template option appearance', async () => {
      const user = userEvent.setup();
      const { container } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // Expand dropdown
      const triggerButton = screen.getByRole('button', { expanded: false });
      await user.click(triggerButton);
      await screen.findByRole('listbox');
      
      // Focus first template option
      const firstOption = screen.getByRole('option', { name: /cash sale/i });
      firstOption.focus();
      
      // Capture focused option state
      expect(container).toMatchSnapshot('mobile-template-selector-focused-option.png');
    });
  });
});