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

describe('MobileTemplateSelector - LocalStorage Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Saving preferences', () => {
    test('should save template selection to localStorage with correct structure', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Select a template
      await user.click(screen.getByRole('button', { expanded: false }));
      await user.click(screen.getByRole('option', { name: /credit sale/i }));
      
      // Verify localStorage was called with correct data
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'journal-template-preferences',
        expect.stringMatching(/"lastSelectedTemplate":"credit-sale"/)
      );
      
      // Verify the saved data structure
      const savedData = JSON.parse(
        (localStorage.setItem as any).mock.calls[0][1]
      );
      expect(savedData).toEqual({
        lastSelectedTemplate: 'credit-sale',
        timestamp: expect.any(Number)
      });
    });

    test('should update timestamp when saving preferences', async () => {
      const user = userEvent.setup();
      const mockDate = new Date('2023-01-01T00:00:00Z');
      const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
      
      render(<MobileTemplateSelector {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { expanded: false }));
      await user.click(screen.getByRole('option', { name: /purchase/i }));
      
      const savedData = JSON.parse(
        (localStorage.setItem as any).mock.calls[0][1]
      );
      expect(savedData.timestamp).toBe(mockDate.getTime());
      
      dateSpy.mockRestore();
    });

    test('should save different templates correctly', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Select first template
      await user.click(screen.getByRole('button', { expanded: false }));
      await user.click(screen.getByRole('option', { name: /credit sale/i }));
      
      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        'journal-template-preferences',
        expect.stringMatching(/"lastSelectedTemplate":"credit-sale"/)
      );
      
      // Select different template
      await user.click(screen.getByRole('button', { expanded: false }));
      await user.click(screen.getByRole('option', { name: /purchase/i }));
      
      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        'journal-template-preferences',
        expect.stringMatching(/"lastSelectedTemplate":"purchase"/)
      );
    });
  });

  describe('Loading preferences', () => {
    test('should load valid template selection from localStorage on mount', () => {
      const preferences = {
        lastSelectedTemplate: 'purchase',
        timestamp: Date.now()
      };
      localStorage.setItem('journal-template-preferences', JSON.stringify(preferences));
      
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Should load the persisted template
      expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Purchase');
      expect(defaultProps.onTemplateSelect).toHaveBeenCalledWith('purchase');
    });

    test('should validate template exists before loading from localStorage', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const preferences = {
        lastSelectedTemplate: 'non-existent-template',
        timestamp: Date.now()
      };
      localStorage.setItem('journal-template-preferences', JSON.stringify(preferences));
      
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Should fallback to default template and clear localStorage
      expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Cash Sale');
      expect(localStorage.removeItem).toHaveBeenCalledWith('journal-template-preferences');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('no longer exists'),
        expect.any(String)
      );
      
      consoleWarnSpy.mockRestore();
    });

    test('should handle missing localStorage data gracefully', () => {
      // No localStorage data set
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Should use default template
      expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Cash Sale');
      expect(defaultProps.onTemplateSelect).toHaveBeenCalledWith('cash-sale');
    });

    test('should validate localStorage data structure', () => {
      // Test various invalid data structures
      const invalidDataCases = [
        null,
        'invalid-string',
        123,
        { invalidKey: 'value' },
        { lastSelectedTemplate: 123 }, // wrong type
        { timestamp: 'invalid' }, // wrong type
        { lastSelectedTemplate: 'valid', extraKey: 'value' } // extra keys should be ignored
      ];

      invalidDataCases.forEach((invalidData, index) => {
        localStorage.clear();
        vi.clearAllMocks();
        
        if (invalidData === null) {
          // Don't set anything in localStorage
        } else if (typeof invalidData === 'string' || typeof invalidData === 'number') {
          localStorage.setItem('journal-template-preferences', String(invalidData));
        } else {
          localStorage.setItem('journal-template-preferences', JSON.stringify(invalidData));
        }
        
        const { unmount } = render(<MobileTemplateSelector {...defaultProps} />);
        
        // Should fallback to default template for all invalid cases
        expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Cash Sale');
        
        unmount();
      });
    });
  });

  describe('Error handling', () => {
    test('should handle localStorage.getItem errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock localStorage.getItem to throw error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Should fallback to default template and log warning
      expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Cash Sale');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to load template preferences:',
        expect.any(Error)
      );
      
      // Restore original localStorage
      localStorage.getItem = originalGetItem;
      consoleWarnSpy.mockRestore();
    });

    test('should handle localStorage.setItem errors gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock localStorage.setItem to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('localStorage quota exceeded');
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
      
      // Template should still be selected in UI
      expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Credit Sale');
      
      // Restore original localStorage
      localStorage.setItem = originalSetItem;
      consoleWarnSpy.mockRestore();
    });

    test('should handle localStorage.removeItem errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Set invalid template in localStorage
      localStorage.setItem('journal-template-preferences', JSON.stringify({
        lastSelectedTemplate: 'invalid-template',
        timestamp: Date.now()
      }));
      
      // Mock localStorage.removeItem to throw error
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn().mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Should still fallback to default template
      expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Cash Sale');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to clear template preferences:',
        expect.any(Error)
      );
      
      // Restore original localStorage
      localStorage.removeItem = originalRemoveItem;
      consoleWarnSpy.mockRestore();
    });

    test('should handle JSON.parse errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Set invalid JSON in localStorage
      localStorage.setItem('journal-template-preferences', '{invalid-json}');
      
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Should fallback to default template and log warning
      expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Cash Sale');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to load template preferences:',
        expect.any(Error)
      );
      
      consoleWarnSpy.mockRestore();
    });

    test('should handle JSON.stringify errors gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock JSON.stringify to throw error
      const originalStringify = JSON.stringify;
      JSON.stringify = vi.fn().mockImplementation(() => {
        throw new Error('JSON.stringify failed');
      });
      
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Select a template
      await user.click(screen.getByRole('button', { expanded: false }));
      await user.click(screen.getByRole('option', { name: /credit sale/i }));
      
      // Should still work but log warning
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to save template preferences:',
        expect.any(Error)
      );
      
      // Restore original JSON.stringify
      JSON.stringify = originalStringify;
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    test('should handle empty templates array with localStorage data', () => {
      localStorage.setItem('journal-template-preferences', JSON.stringify({
        lastSelectedTemplate: 'cash-sale',
        timestamp: Date.now()
      }));
      
      render(
        <MobileTemplateSelector 
          {...defaultProps}
          templates={[]}
        />
      );
      
      // Should render nothing when no templates available
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('should handle template array changes with localStorage data', () => {
      localStorage.setItem('journal-template-preferences', JSON.stringify({
        lastSelectedTemplate: 'purchase',
        timestamp: Date.now()
      }));
      
      const { rerender } = render(<MobileTemplateSelector {...defaultProps} />);
      
      // Should load purchase template
      expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Purchase');
      
      // Remove purchase template from array
      const updatedTemplates = mockTemplates.filter(t => t.id !== 'purchase');
      rerender(
        <MobileTemplateSelector 
          {...defaultProps}
          templates={updatedTemplates}
        />
      );
      
      // Should fallback to available template and clear localStorage
      expect(screen.getByRole('button', { expanded: false })).toHaveTextContent('Cash Sale');
      expect(localStorage.removeItem).toHaveBeenCalledWith('journal-template-preferences');
    });

    test('should handle rapid template selections', async () => {
      const user = userEvent.setup();
      render(<MobileTemplateSelector {...defaultProps} />);
      
      // Rapidly select different templates
      await user.click(screen.getByRole('button', { expanded: false }));
      await user.click(screen.getByRole('option', { name: /credit sale/i }));
      
      await user.click(screen.getByRole('button', { expanded: false }));
      await user.click(screen.getByRole('option', { name: /purchase/i }));
      
      // Should handle all selections and save the last one
      expect(localStorage.setItem).toHaveBeenCalledTimes(2);
      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        'journal-template-preferences',
        expect.stringMatching(/"lastSelectedTemplate":"purchase"/)
      );
    });
  });
});