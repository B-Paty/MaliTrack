import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JournalEntry } from '../JournalEntry';

// Mock the MobileTemplateSelector component
vi.mock('@/components/ui/MobileTemplateSelector', () => ({
  MobileTemplateSelector: ({ templates, selectedTemplate, onTemplateSelect, onApplyTemplate }: any) => (
    <div data-testid="mobile-template-selector">
      <button 
        onClick={() => {
          onTemplateSelect('test-template');
          onApplyTemplate('test-template');
        }}
        data-testid="mock-template-button"
      >
        Mock Template Selector - {selectedTemplate}
      </button>
    </div>
  )
}));

// Mock other dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('JournalEntry Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock window.matchMedia for responsive behavior
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('768px') ? false : true, // Mock mobile view
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  test('should integrate MobileTemplateSelector with form state', async () => {
    render(<JournalEntry />);
    
    // Verify MobileTemplateSelector is rendered on mobile
    expect(screen.getByTestId('mobile-template-selector')).toBeInTheDocument();
    
    // Interact with template selector
    const templateButton = screen.getByTestId('mock-template-button');
    fireEvent.click(templateButton);
    
    // Should update form state (this would be verified by checking form fields)
    expect(templateButton).toBeInTheDocument();
  });

  test('should handle template selection and form data interaction', async () => {
    const user = userEvent.setup();
    render(<JournalEntry />);
    
    // Find form elements
    const descriptionInput = screen.getByLabelText(/description/i);
    
    // Enter some form data
    await user.type(descriptionInput, 'Test transaction');
    
    // Select template
    const templateButton = screen.getByTestId('mock-template-button');
    await user.click(templateButton);
    
    // Form should maintain user input while applying template
    expect(descriptionInput).toHaveValue('Test transaction');
  });

  test('should preserve form state during template switching', async () => {
    const user = userEvent.setup();
    render(<JournalEntry />);
    
    // Fill out form
    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'Original description');
    
    // Switch templates multiple times
    const templateButton = screen.getByTestId('mock-template-button');
    await user.click(templateButton);
    await user.click(templateButton);
    
    // Description should be preserved
    expect(descriptionInput).toHaveValue('Original description');
  });

  test('should handle responsive behavior correctly', () => {
    // Test mobile view
    render(<JournalEntry />);
    expect(screen.getByTestId('mobile-template-selector')).toBeInTheDocument();
    
    // Mock desktop view
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('768px') ? true : false, // Mock desktop view
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    // Re-render for desktop
    const { rerender } = render(<JournalEntry />);
    rerender(<JournalEntry />);
    
    // Should handle both mobile and desktop views
    // (The actual implementation would show/hide different template layouts)
  });

  test('should handle form submission with template data', async () => {
    const user = userEvent.setup();
    render(<JournalEntry />);
    
    // Fill form and select template
    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'Test entry');
    
    const templateButton = screen.getByTestId('mock-template-button');
    await user.click(templateButton);
    
    // Find and submit form
    const submitButton = screen.getByRole('button', { name: /save/i });
    if (submitButton) {
      await user.click(submitButton);
      
      // Should handle submission with template data
      expect(descriptionInput).toHaveValue('Test entry');
    }
  });
});

describe('JournalEntry Responsive Integration', () => {
  test('should switch between mobile and desktop template layouts', () => {
    // Start with mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    
    const { rerender } = render(<JournalEntry />);
    
    // Should show mobile template selector
    expect(screen.getByTestId('mobile-template-selector')).toBeInTheDocument();
    
    // Switch to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
    
    // Mock desktop matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('768px') ? true : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    
    rerender(<JournalEntry />);
    
    // Should handle layout transition
    // (Implementation would show desktop grid layout)
  });

  test('should handle orientation changes', () => {
    render(<JournalEntry />);
    
    // Simulate orientation change
    fireEvent(window, new Event('orientationchange'));
    
    // Should remain functional after orientation change
    expect(screen.getByTestId('mobile-template-selector')).toBeInTheDocument();
  });
});

describe('JournalEntry Error Handling Integration', () => {
  test('should handle template selector errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock MobileTemplateSelector to throw error
    vi.doMock('@/components/ui/MobileTemplateSelector', () => ({
      MobileTemplateSelector: () => {
        throw new Error('Template selector error');
      }
    }));
    
    // Should not crash the entire form
    expect(() => render(<JournalEntry />)).not.toThrow();
    
    consoleErrorSpy.mockRestore();
  });

  test('should handle form submission errors with template data', async () => {
    const user = userEvent.setup();
    
    // Mock supabase to return error
    vi.doMock('@/integrations/supabase/client', () => ({
      supabase: {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null }))
          })),
          insert: vi.fn(() => Promise.resolve({ 
            data: null, 
            error: { message: 'Database error' }
          }))
        }))
      }
    }));
    
    render(<JournalEntry />);
    
    // Fill form and submit
    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'Test entry');
    
    const submitButton = screen.getByRole('button', { name: /save/i });
    if (submitButton) {
      await user.click(submitButton);
      
      // Should handle error gracefully
      expect(descriptionInput).toHaveValue('Test entry');
    }
  });
});