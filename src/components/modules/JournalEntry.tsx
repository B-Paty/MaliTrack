import { useState, useMemo, useEffect } from "react";
import { Plus, Trash2, Save, Calculator, Calendar, FileText, Zap, History, Lightbulb, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Autocomplete, type AutocompleteOption } from "@/components/ui/autocomplete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileTemplateSelector, type TransactionTemplate as MobileTransactionTemplate } from "@/components/ui/MobileTemplateSelector";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions, type TransactionLine } from "@/hooks/useTransactions";
import { useInventorySettings } from "@/hooks/useInventorySettings";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatCurrency, formatNumber, parseNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

/**
 * JournalEntry
 * Records balanced transactions.
 * - Collects lines with debit/credit
 * - Validates equality before save
 * - Creates header + lines in DB and refreshes
 */
interface JournalEntryForm {
  transactionDate: string;
  description: string;
  lines: TransactionLine[];
}

interface TransactionTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  lines: Omit<TransactionLine, 'account_name'>[];
  category: 'sales' | 'purchase' | 'cash' | 'expense' | 'transfer' | 'other';
}

// Base templates that work for both single and multiple inventory
const getBaseTemplates = (): TransactionTemplate[] => [
  {
    id: 'cash-sale',
    name: 'Cash Sale',
    description: 'Sale of goods/services for cash',
    icon: '💰',
    category: 'sales',
    lines: [
      { account_code: '1010', debit_amount: 0, credit_amount: 0 }, // Cash in Hand
      { account_code: '4010', debit_amount: 0, credit_amount: 0 }, // Sales Revenue
      { account_code: '5010', debit_amount: 0, credit_amount: 0 }, // Cost of Goods Sold
      { account_code: '1040', debit_amount: 0, credit_amount: 0 }, // Inventory
    ]
  },
  {
    id: 'credit-sale',
    name: 'Credit Sale',
    description: 'Sale of goods/services on credit',
    icon: '📋',
    category: 'sales',
    lines: [
      { account_code: '1030', debit_amount: 0, credit_amount: 0 }, // Accounts Receivable
      { account_code: '4010', debit_amount: 0, credit_amount: 0 }, // Sales Revenue
      { account_code: '5010', debit_amount: 0, credit_amount: 0 }, // Cost of Goods Sold
      { account_code: '1040', debit_amount: 0, credit_amount: 0 }, // Inventory
    ]
  },
  {
    id: 'cash-purchase',
    name: 'Cash Purchase',
    description: 'Purchase of goods/services with cash',
    icon: '🛒',
    category: 'purchase',
    lines: [
      { account_code: '1040', debit_amount: 0, credit_amount: 0 }, // Inventory
      { account_code: '1010', debit_amount: 0, credit_amount: 0 }, // Cash in Hand
    ]
  },
  {
    id: 'credit-purchase',
    name: 'Credit Purchase',
    description: 'Purchase of goods/services on credit',
    icon: '📝',
    category: 'purchase',
    lines: [
      { account_code: '1040', debit_amount: 0, credit_amount: 0 }, // Inventory
      { account_code: '2010', debit_amount: 0, credit_amount: 0 }, // Accounts Payable
    ]
  },
  {
    id: 'cash-receipt',
    name: 'Cash Receipt',
    description: 'Collection of accounts receivable',
    icon: '💵',
    category: 'cash',
    lines: [
      { account_code: '1010', debit_amount: 0, credit_amount: 0 }, // Cash in Hand
      { account_code: '1030', debit_amount: 0, credit_amount: 0 }, // Accounts Receivable
    ]
  },
  {
    id: 'cash-payment',
    name: 'Cash Payment',
    description: 'Payment of accounts payable',
    icon: '💸',
    category: 'cash',
    lines: [
      { account_code: '2010', debit_amount: 0, credit_amount: 0 }, // Accounts Payable
      { account_code: '1010', debit_amount: 0, credit_amount: 0 }, // Cash in Hand
    ]
  },
  {
    id: 'expense',
    name: 'Expense Payment',
    description: 'Payment of business expenses',
    icon: '📊',
    category: 'expense',
    lines: [
      { account_code: '5020', debit_amount: 0, credit_amount: 0 }, // Salaries & Wages
      { account_code: '1010', debit_amount: 0, credit_amount: 0 }, // Cash in Hand
    ]
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    description: 'Transfer between bank accounts',
    icon: '🏦',
    category: 'transfer',
    lines: [
      { account_code: '1020', debit_amount: 0, credit_amount: 0 }, // Bank Account
      { account_code: '1010', debit_amount: 0, credit_amount: 0 }, // Cash in Hand
    ]
  }
];

// Generate product-specific templates for multiple inventory
const getProductTemplates = (products: any[]): TransactionTemplate[] => {
  const templates: TransactionTemplate[] = [];
  
  products.forEach((product, index) => {
    const productCode = 6000 + index * 10;
    
    // Cash Sale for this product
    templates.push({
      id: `cash-sale-${product.id}`,
      name: `${product.name} Cash Sale`,
      description: `Sale of ${product.name} for cash`,
      icon: '💰',
      category: 'sales',
      lines: [
        { account_code: '1010', debit_amount: 0, credit_amount: 0 }, // Cash in Hand
        { account_code: (productCode + 1).toString(), debit_amount: 0, credit_amount: 0 }, // Product Sales Revenue
        { account_code: (productCode + 2).toString(), debit_amount: 0, credit_amount: 0 }, // Product COGS
        { account_code: productCode.toString(), debit_amount: 0, credit_amount: 0 }, // Product Inventory
      ]
    });
    
    // Credit Sale for this product
    templates.push({
      id: `credit-sale-${product.id}`,
      name: `${product.name} Credit Sale`,
      description: `Sale of ${product.name} on credit`,
      icon: '📋',
      category: 'sales',
      lines: [
        { account_code: '1030', debit_amount: 0, credit_amount: 0 }, // Accounts Receivable
        { account_code: (productCode + 1).toString(), debit_amount: 0, credit_amount: 0 }, // Product Sales Revenue
        { account_code: (productCode + 2).toString(), debit_amount: 0, credit_amount: 0 }, // Product COGS
        { account_code: productCode.toString(), debit_amount: 0, credit_amount: 0 }, // Product Inventory
      ]
    });
    
    // Cash Purchase for this product
    templates.push({
      id: `cash-purchase-${product.id}`,
      name: `${product.name} Cash Purchase`,
      description: `Purchase of ${product.name} with cash`,
      icon: '🛒',
      category: 'purchase',
      lines: [
        { account_code: productCode.toString(), debit_amount: 0, credit_amount: 0 }, // Product Inventory
        { account_code: '1010', debit_amount: 0, credit_amount: 0 }, // Cash in Hand
      ]
    });
    
    // Credit Purchase for this product
    templates.push({
      id: `credit-purchase-${product.id}`,
      name: `${product.name} Credit Purchase`,
      description: `Purchase of ${product.name} on credit`,
      icon: '📝',
      category: 'purchase',
      lines: [
        { account_code: productCode.toString(), debit_amount: 0, credit_amount: 0 }, // Product Inventory
        { account_code: '2010', debit_amount: 0, credit_amount: 0 }, // Accounts Payable
      ]
    });
  });
  
  return templates;
};

export default function JournalEntry() {
  const { toast } = useToast();
  const { user } = useAuth();
  const MAX_AMOUNT = 100_000_000; // maximum allowed amount per line (100M)
  const { accounts, loading: accountsLoading } = useAccounts();
  const { settings: inventorySettings } = useInventorySettings(user?.id || '');
  const { createTransaction, loading: transactionLoading } = useTransactions();
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [autoBalanceEnabled, setAutoBalanceEnabled] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Generate transaction templates based on inventory settings
  const transactionTemplates = useMemo(() => {
    const baseTemplates = getBaseTemplates();
    
    if (inventorySettings?.inventory_type === 'multiple' && inventorySettings.products) {
      // For multiple inventory, add product-specific templates
      const productTemplates = getProductTemplates(inventorySettings.products);
      return [...baseTemplates, ...productTemplates];
    }
    
    // For single inventory or no inventory settings, return only base templates
    return baseTemplates;
  }, [inventorySettings]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  
  // Prepare autocomplete options from accounts with better search matching
  const accountOptions: AutocompleteOption[] = useMemo(() => 
    accounts.map(account => ({
      value: account.account_code,
      label: account.account_name,
      description: `${account.category} • ${account.account_code} • Balance: ${formatCurrency(account.current_balance || 0)}`,
      keywords: `${account.account_code} ${account.account_name} ${account.category}`.toLowerCase()
    })), [accounts]
  );

  // Smart account suggestions based on context with improved matching
  const getSmartAccountSuggestions = (currentLineIndex: number, otherLines: TransactionLine[]) => {
    const currentLine = form.lines[currentLineIndex];
    const otherAccounts = otherLines.map(line => line.account_code).filter(Boolean);
    
    // Get all available accounts that haven't been used yet
    const availableAccounts = accounts.filter(acc => !otherAccounts.includes(acc.account_code));
    
    // Start with template-specific suggestions if we have a template
    let suggestions: AutocompleteOption[] = [];
    
    if (selectedTemplate) {
      const template = transactionTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        // Get template accounts and mark them as recommended
        const templateAccounts = template.lines
          .map(line => accounts.find(acc => acc.account_code === line.account_code))
          .filter(Boolean)
          .filter(acc => !otherAccounts.includes(acc!.account_code));
        
        suggestions = templateAccounts.map(account => ({
          value: account!.account_code,
          label: account!.account_name,
          description: `${account!.category} • ${account!.account_code} • Balance: ${formatCurrency(account!.current_balance || 0)} • Template suggestion`,
          keywords: `${account!.account_code} ${account!.account_name} ${account!.category}`.toLowerCase()
        }));
      }
    }
    
    // Add category-specific suggestions based on transaction type
    const relevantCategories = new Set<string>();
    if (selectedTemplate) {
      if (selectedTemplate.includes('sale')) {
        relevantCategories.add('Revenue');
        relevantCategories.add('Asset');
      } else if (selectedTemplate.includes('purchase')) {
        relevantCategories.add('Expense');
        relevantCategories.add('Liability');
        relevantCategories.add('Asset');
      } else if (selectedTemplate.includes('receipt') || selectedTemplate.includes('payment')) {
        relevantCategories.add('Asset');
        relevantCategories.add('Liability');
      } else if (selectedTemplate.includes('expense')) {
        relevantCategories.add('Expense');
        relevantCategories.add('Asset');
      } else if (selectedTemplate.includes('transfer')) {
        relevantCategories.add('Asset');
      }
    }
    
    // If no template or categories, include all accounts
    if (relevantCategories.size === 0) {
      relevantCategories.add('Asset');
      relevantCategories.add('Liability');
      relevantCategories.add('Equity');
      relevantCategories.add('Revenue');
      relevantCategories.add('Expense');
    }
    
    // Add common account suggestions from relevant categories
    const commonSuggestions = availableAccounts
      .filter(acc => relevantCategories.has(acc.category))
      .map(account => ({
        value: account.account_code,
        label: account.account_name,
        description: `${account.category} • ${account.account_code} • Balance: ${formatCurrency(account.current_balance || 0)}`,
        keywords: `${account.account_code} ${account.account_name} ${account.category}`.toLowerCase()
      }));
    
    // Combine and deduplicate suggestions
    const allSuggestions = [...suggestions, ...commonSuggestions];
    const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.value === suggestion.value)
    );
    
    // Always include all accounts for searching, but put relevant ones first
    const remainingAccounts = accountOptions.filter(option => 
      !uniqueSuggestions.some(s => s.value === option.value)
    );
    
    return [...uniqueSuggestions, ...remainingAccounts];
  };
  
  const [form, setForm] = useState<JournalEntryForm>({
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    lines: [
      { account_code: '', debit_amount: 0, credit_amount: 0 },
      { account_code: '', debit_amount: 0, credit_amount: 0 }
    ]
  });

  const totals = useMemo(() => {
    const totalDebits = form.lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0);
    const totalCredits = form.lines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
    const difference = totalDebits - totalCredits;
    return { totalDebits, totalCredits, isBalanced, difference };
  }, [form.lines]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + Enter: Submit transaction
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (totals.isBalanced && form.description.trim()) {
          handleSubmit();
        }
      }
      
      // Ctrl/Cmd + N: Add new line
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        addLine();
      }
      
      // Ctrl/Cmd + T: Toggle auto-balance
      if ((event.ctrlKey || event.metaKey) && event.key === 't') {
        event.preventDefault();
        setAutoBalanceEnabled(!autoBalanceEnabled);
      }
      
      // Ctrl/Cmd + K: Show keyboard shortcuts
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setShowKeyboardShortcuts(!showKeyboardShortcuts);
      }
      
      // Escape: Clear template selection
      if (event.key === 'Escape') {
        setSelectedTemplate('');
        setShowKeyboardShortcuts(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [totals.isBalanced, form.description, autoBalanceEnabled, showKeyboardShortcuts]);

  // Responsive behavior handling - dynamic switching between mobile and desktop layouts
  useEffect(() => {
    const checkIsMobile = () => {
      // Use the same breakpoint as Tailwind's md (768px)
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
    };

    // Check initial state
    checkIsMobile();

    // Add resize listener for dynamic switching
    const handleResize = () => {
      checkIsMobile();
    };

    window.addEventListener('resize', handleResize);
    
    // Also listen for orientation changes on mobile devices
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Auto-balancing logic
  const applyAutoBalance = (lines: TransactionLine[], changedIndex: number, changedField: 'debit_amount' | 'credit_amount', changedValue: number) => {
    if (!autoBalanceEnabled) return lines;

    const updatedLines = [...lines];
    const totalDebits = updatedLines.reduce((sum, line, index) => {
      if (index === changedIndex && changedField === 'debit_amount') {
        return sum + changedValue;
      }
      return sum + (line.debit_amount || 0);
    }, 0);
    
    const totalCredits = updatedLines.reduce((sum, line, index) => {
      if (index === changedIndex && changedField === 'credit_amount') {
        return sum + changedValue;
      }
      return sum + (line.credit_amount || 0);
    }, 0);

    const difference = totalDebits - totalCredits;
    
    // Find the last empty line to auto-balance
    const lastEmptyIndex = updatedLines.findIndex((line, index) => 
      index !== changedIndex && 
      line.account_code && 
      (line.debit_amount === 0 || line.credit_amount === 0)
    );

    if (lastEmptyIndex !== -1 && Math.abs(difference) > 0.01) {
      const lastLine = updatedLines[lastEmptyIndex];
      const account = accounts.find(acc => acc.account_code === lastLine.account_code);
      
      if (account) {
        if (account.normal_balance === 'debit' && difference > 0) {
          // Need to credit this account
          updatedLines[lastEmptyIndex] = {
            ...lastLine,
            debit_amount: 0,
            credit_amount: Math.abs(difference)
          };
        } else if (account.normal_balance === 'credit' && difference < 0) {
          // Need to debit this account
          updatedLines[lastEmptyIndex] = {
            ...lastLine,
            debit_amount: Math.abs(difference),
            credit_amount: 0
          };
        }
      }
    }

    return updatedLines;
  };

  const applyTemplate = (templateId: string) => {
    const template = transactionTemplates.find(t => t.id === templateId);
    if (!template) return;

    const templateLines: TransactionLine[] = template.lines.map(line => ({
      ...line,
      account_name: accounts.find(acc => acc.account_code === line.account_code)?.account_name || ''
    }));

    setForm(prev => ({
      ...prev,
      description: template.description,
      lines: templateLines
    }));

    setSelectedTemplate(templateId);
    
    toast({
      title: "Template Applied",
      description: `${template.name} template loaded successfully`,
    });
  };

  const addLine = () => {
    const newLine: TransactionLine = {
      account_code: '',
      debit_amount: 0,
      credit_amount: 0
    };
    setForm(prev => ({
      ...prev,
      lines: [...prev.lines, newLine]
    }));
  };

  const removeLine = (index: number) => {
    if (form.lines.length <= 2) {
      toast({
        title: "Cannot remove line",
        description: "Journal entry must have at least 2 lines",
        variant: "destructive"
      });
      return;
    }
    
    setForm(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }));
  };

  const updateLine = (index: number, field: keyof TransactionLine, value: string | number) => {
    setForm(prev => {
      const updatedLines = prev.lines.map((line, i) => {
        if (i === index) {
          const updatedLine = { ...line };
          
          // Handle account code updates
          if (field === 'account_code') {
            updatedLine.account_code = value as string;
            const account = accounts.find(acc => acc.account_code === value);
            updatedLine.account_name = account?.account_name || '';
            return updatedLine;
          }
          
          // Handle amount updates
          if (field === 'debit_amount' || field === 'credit_amount') {
            // For string inputs (from typing), only validate format
            if (typeof value === 'string') {
              // Allow empty or valid number format (digits and commas)
              if (value === '' || /^[0-9,]*$/.test(value)) {
                const numValue = parseNumber(value);
                updatedLine[field] = numValue;
                
                // Only clear the opposite field and apply auto-balance if we have a real value
                if (numValue > 0) {
                  updatedLine[field === 'debit_amount' ? 'credit_amount' : 'debit_amount'] = 0;
                }
              }
              // If invalid format, keep existing value
              return updatedLine;
            }
            
            // For number inputs (from auto-balance), apply directly with clamping
            const numValue = Math.min(value as number, MAX_AMOUNT);
            updatedLine[field] = numValue;
            if (numValue > 0) {
              updatedLine[field === 'debit_amount' ? 'credit_amount' : 'debit_amount'] = 0;
            }
          }
          
          return updatedLine;
        }
        return line;
      });

      // Only apply auto-balancing if we have a complete valid number
      // and auto-balance is enabled
      if ((field === 'debit_amount' || field === 'credit_amount') && 
          typeof value === 'string' && 
          value !== '' && 
          autoBalanceEnabled) {
        const numValue = parseNumber(value);
        if (numValue > 0) {
          const autoBalancedLines = applyAutoBalance(updatedLines, index, field as 'debit_amount' | 'credit_amount', numValue);
          return {
            ...prev,
            lines: autoBalancedLines
          };
        }
      }

      return {
        ...prev,
        lines: updatedLines
      };
    });
  };

  // Enhanced validation with detailed error messages
  const validateTransaction = () => {
    const errors: Record<string, string> = {};
    
    // Validate description
    if (!form.description.trim()) {
      errors.description = 'Transaction description is required';
    } else if (form.description.length < 3) {
      errors.description = 'Description must be at least 3 characters long';
    }
    
    // Validate transaction date
    if (!form.transactionDate) {
      errors.transactionDate = 'Transaction date is required';
    } else {
      const transactionDate = new Date(form.transactionDate);
      const today = new Date();
      if (transactionDate > today) {
        errors.transactionDate = 'Transaction date cannot be in the future';
      }
    }
    
    // Validate lines
    const validLines = form.lines.filter(line => 
      line.account_code && (line.debit_amount > 0 || line.credit_amount > 0)
    );
    
    if (validLines.length === 0) {
      errors.lines = 'At least one line with account and amount is required';
    } else if (validLines.length < 2) {
      errors.lines = 'At least two lines are required for a valid transaction';
    }
    
    // Check for duplicate accounts
    const accountCodes = validLines.map(line => line.account_code);
    const duplicates = accountCodes.filter((code, index) => accountCodes.indexOf(code) !== index);
    if (duplicates.length > 0) {
      errors.duplicateAccounts = `Duplicate accounts found: ${duplicates.join(', ')}`;
    }
    
    // Check for zero amounts
    const zeroAmountLines = validLines.filter(line => 
      line.debit_amount === 0 && line.credit_amount === 0
    );
    if (zeroAmountLines.length > 0) {
      errors.zeroAmounts = 'All lines must have either a debit or credit amount';
    }
    
    // Check balance
    if (!totals.isBalanced) {
      const difference = Math.abs(totals.difference);
      errors.balance = `Transaction is not balanced. Difference: ${formatCurrency(difference)}`;
    }
    
    // Check for invalid amounts
    const invalidAmounts = validLines.filter(line => 
      line.debit_amount < 0 || line.credit_amount < 0
    );
    if (invalidAmounts.length > 0) {
      errors.invalidAmounts = 'Amounts cannot be negative';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    // Clear previous validation errors
    setValidationErrors({});
    
    // Validate transaction
    if (!validateTransaction()) {
      const firstError = Object.values(validationErrors)[0];
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: firstError,
      });
      return;
    }

    const validLines = form.lines.filter(line => 
      line.account_code && (line.debit_amount > 0 || line.credit_amount > 0)
    );

    try {
      await createTransaction({
        transaction_date: form.transactionDate,
        description: form.description,
        lines: validLines,
      });

      // Reset form
      setForm({
        transactionDate: new Date().toISOString().split('T')[0],
        description: '',
        lines: [
          { account_code: '', debit_amount: 0, credit_amount: 0 },
          { account_code: '', debit_amount: 0, credit_amount: 0 }
        ]
      });
      
      // Clear template selection
      setSelectedTemplate('');
      
      // Clear validation errors
      setValidationErrors({});

      toast({
        title: 'Success',
        description: 'Transaction recorded successfully',
      });
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  if (accountsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Journal Entry
          </h1>
          <p className="text-muted-foreground mt-2">Record accounting transactions with real-time balance updates</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={totals.isBalanced ? "default" : "destructive"} className="gap-1 text-sm px-3 py-1">
            <Calculator className="h-4 w-4" />
            {totals.isBalanced ? "Balanced" : "Out of Balance"}
          </Badge>
          {!totals.isBalanced && autoBalanceEnabled && (
            <Badge variant="outline" className="gap-1 text-sm px-3 py-1">
              <Zap className="h-4 w-4" />
              Auto-Balance: {formatCurrency(Math.abs(totals.difference))}
            </Badge>
          )}
        </div>
      </div>

      {/* Transaction Templates */}
      <Card className="shadow-card border-0 bg-gradient-accent/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Quick Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Grid View */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3">
            {transactionTemplates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                onClick={() => applyTemplate(template.id)}
                className="h-auto p-4 flex flex-col items-center gap-2 dark:hover:bg-transparent dark:bg-transparent"
              >
                <span className="text-2xl">{template.icon}</span>
                <div className="text-center">
                  <div className="font-semibold text-sm">{template.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{template.description}</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Mobile Dropdown View */}
          <div className="md:hidden">
            <MobileTemplateSelector
              templates={transactionTemplates as MobileTransactionTemplate[]}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              onApplyTemplate={applyTemplate}
            />
          </div>
        </CardContent>
      </Card>

      {/* Auto-Balance Toggle */}
      <Card className="shadow-card border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <Label className="text-sm font-semibold text-foreground">Auto-Balance</Label>
                <p className="text-xs text-muted-foreground">Automatically calculate missing amounts to balance the transaction</p>
              </div>
            </div>
            <Button
              variant={autoBalanceEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoBalanceEnabled(!autoBalanceEnabled)}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              {autoBalanceEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts - Desktop Only */}
      <Card className="shadow-card border-0 hidden md:block">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Keyboard className="h-5 w-5 text-primary" />
              <div>
                <Label className="text-sm font-semibold text-foreground">Keyboard Shortcuts</Label>
                <p className="text-xs text-muted-foreground">Use keyboard shortcuts for faster data entry</p>
              </div>
            </div>
            <Button
              variant={showKeyboardShortcuts ? "default" : "outline"}
              size="sm"
              onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
              className="gap-2 hover:bg-transparent hover:text-foreground"
            >
              <Keyboard className="h-4 w-4" />
              {showKeyboardShortcuts ? "Hide" : "Show"} Shortcuts
            </Button>
          </div>
          
          {showKeyboardShortcuts && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Submit Transaction</span>
                  <Badge variant="outline" className="font-mono">Ctrl+Enter</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Add New Line</span>
                  <Badge variant="outline" className="font-mono">Ctrl+N</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Toggle Auto-Balance</span>
                  <Badge variant="outline" className="font-mono">Ctrl+T</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Show/Hide Shortcuts</span>
                  <Badge variant="outline" className="font-mono">Ctrl+K</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Clear Template</span>
                  <Badge variant="outline" className="font-mono">Escape</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Focus Next Field</span>
                  <Badge variant="outline" className="font-mono">Tab</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions Quick-Fill */}
      {recentTransactions.length > 0 && (
        <Card className="shadow-card border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <History className="h-5 w-5 text-primary" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentTransactions.slice(0, 6).map((transaction, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => {
                    setForm(prev => ({
                      ...prev,
                      description: transaction.description,
                      lines: transaction.lines.map(line => ({
                        ...line,
                        account_name: accounts.find(acc => acc.account_code === line.account_code)?.account_name || ''
                      }))
                    }));
                    toast({
                      title: "Transaction Loaded",
                      description: `Loaded "${transaction.description}" from recent transactions`,
                    });
                  }}
                  className="h-auto p-3 flex flex-col items-start gap-2 transition-all"
                >
                  <div className="font-semibold text-sm text-left">{transaction.description}</div>
                  <div className="text-xs text-muted-foreground text-left">
                    {transaction.lines.length} lines • {formatCurrency(transaction.lines.reduce((sum, line) => sum + (line.debit_amount || 0), 0))}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Header */}
      <Card className="shadow-card border-0 bg-gradient-secondary/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-primary" />
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-sm font-semibold text-foreground">Transaction Date *</Label>
              <Input
                id="date"
                type="date"
                value={form.transactionDate}
                onChange={(e) => setForm(prev => ({ ...prev, transactionDate: e.target.value }))}
                min="2025-01-01"
                max={new Date().toISOString().split('T')[0]}
                className={cn(
                  "mt-1.5 h-11",
                  validationErrors.transactionDate && "border-destructive focus:ring-destructive/20"
                )}
              />
              {validationErrors.transactionDate && (
                <p className="text-sm text-destructive mt-1">{validationErrors.transactionDate}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-foreground">Description *</Label>
              <Input
                id="description"
                placeholder="Enter transaction description..."
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                maxLength={255}
                className={cn(
                  "mt-1.5 h-11",
                  validationErrors.description && "border-destructive focus:ring-destructive/20"
                )}
              />
              {validationErrors.description && (
                <p className="text-sm text-destructive mt-1">{validationErrors.description}</p>
              )}
            </div>
          </div>
          
          {/* Validation Error Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-destructive rounded-full"></div>
                <h4 className="font-semibold text-destructive">Please fix the following issues:</h4>
              </div>
              <ul className="space-y-1 text-sm text-destructive">
                {Object.entries(validationErrors).map(([key, error]) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="text-destructive/70">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Journal Lines */}
      <Card className="shadow-elevated border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-foreground">Journal Lines</CardTitle>
            <Button onClick={addLine} variant="outline" size="sm" className="gap-2 transition-shadow">
              <Plus className="h-4 w-4" />
              Add Line
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-primary/20">
                  <th className="text-left py-4 px-3 font-bold text-muted-foreground w-48">Account Code/Name</th>
                  <th className="text-left py-4 px-3 font-bold text-muted-foreground">Account Name</th>
                  <th className="text-right py-4 px-3 font-bold text-muted-foreground w-36">Debit (TZS)</th>
                  <th className="text-right py-4 px-3 font-bold text-muted-foreground w-36">Credit (TZS)</th>
                  <th className="text-center py-4 px-3 font-bold text-muted-foreground w-16">Action</th>
                </tr>
              </thead>
              <tbody>
                {form.lines.map((line, index) => {
                  const account = accounts.find(acc => acc.account_code === line.account_code);
                  const isAutoBalanced = autoBalanceEnabled && 
                    ((line.debit_amount > 0 && line.credit_amount === 0) || 
                     (line.credit_amount > 0 && line.debit_amount === 0));
                  
                  return (
                    <tr key={index} className={cn(
                      "border-b border-border/50 transition-colors",
                      isAutoBalanced && "bg-primary/5"
                    )}>
                      <td className="py-4 px-3">
                        <Autocomplete
                          options={getSmartAccountSuggestions(index, form.lines.filter((_, i) => i !== index))}
                          value={line.account_code}
                          onValueChange={(value) => updateLine(index, 'account_code', value)}
                          placeholder="Type account code or name..."
                          className="h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          maxSuggestions={8}
                        />
                      </td>
                      
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={line.account_name || ''}
                            readOnly
                            placeholder="Account name will appear here"
                            className="bg-muted/50 h-11 font-medium"
                          />
                          {account && (
                            <Badge variant="outline" className="text-xs">
                              {account.normal_balance}
                            </Badge>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-3">
                        <div className="relative">
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9,]*"
                            value={line.debit_amount > 0 ? formatNumber(line.debit_amount) : ''}
                            onChange={(e) => updateLine(index, 'debit_amount', e.target.value)}
                            placeholder="0"
                            className={cn(
                              "text-right font-mono h-11 focus:ring-2 focus:ring-primary/20",
                              isAutoBalanced && line.debit_amount > 0 && "bg-primary/10 border-primary/30"
                            )}
                          />
                          {isAutoBalanced && line.debit_amount > 0 && (
                            <div className="absolute -top-1 -right-1">
                              <Badge variant="default" className="text-xs px-1 py-0">
                                <Zap className="h-3 w-3" />
                              </Badge>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-3">
                        <div className="relative">
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9,]*"
                            value={line.credit_amount > 0 ? formatNumber(line.credit_amount) : ''}
                            onChange={(e) => updateLine(index, 'credit_amount', e.target.value)}
                            placeholder="0"
                            className={cn(
                              "text-right font-mono h-11 focus:ring-2 focus:ring-primary/20",
                              isAutoBalanced && line.credit_amount > 0 && "bg-primary/10 border-primary/30"
                            )}
                          />
                          {isAutoBalanced && line.credit_amount > 0 && (
                            <div className="absolute -top-1 -right-1">
                              <Badge variant="default" className="text-xs px-1 py-0">
                                <Zap className="h-3 w-3" />
                              </Badge>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-3 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLine(index)}
                          className="h-9 w-9 text-muted-foreground hover:text-destructive transition-colors"
                          disabled={form.lines.length <= 2}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              
              {/* Totals Row */}
              <tfoot>
                <tr className="border-t-2 border-primary bg-gradient-primary/5">
                  <td className="py-5 px-3 font-bold text-foreground text-lg" colSpan={2}>
                    TOTALS
                  </td>
                  <td className="py-5 px-3 text-right">
                    <span className="font-bold text-xl text-foreground">
                      {formatCurrency(totals.totalDebits)}
                    </span>
                  </td>
                  <td className="py-5 px-3 text-right">
                    <span className="font-bold text-xl text-foreground">
                      {formatCurrency(totals.totalCredits)}
                    </span>
                  </td>
                  <td className="py-5 px-3 text-center">
                    <Badge variant={totals.isBalanced ? "default" : "destructive"} className="text-sm px-3">
                      {totals.isBalanced ? "✓" : "⚠"}
                    </Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {form.lines.map((line, index) => {
              const account = accounts.find(acc => acc.account_code === line.account_code);
              const isAutoBalanced = autoBalanceEnabled && 
                ((line.debit_amount > 0 && line.credit_amount === 0) || 
                 (line.credit_amount > 0 && line.debit_amount === 0));
              
              return (
                <Card key={index} className={cn(
                  "p-4 border-2 transition-all",
                  isAutoBalanced ? "border-primary/30 bg-primary/5" : "border-border"
                )}>
                  <div className="space-y-3">
                    {/* Account Selection */}
                    <div>
                      <Label className="text-sm font-semibold text-foreground">Account</Label>
                      <Autocomplete
                        options={getSmartAccountSuggestions(index, form.lines.filter((_, i) => i !== index))}
                        value={line.account_code}
                        onValueChange={(value) => updateLine(index, 'account_code', value)}
                        placeholder="Type account code or name..."
                        className="mt-1 h-11 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        maxSuggestions={8}
                      />
                    </div>
                    
                    {/* Account Name */}
                    <div>
                      <Label className="text-sm font-semibold text-foreground">Account Name</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={line.account_name || ''}
                          readOnly
                          placeholder="Account name will appear here"
                          className="bg-muted/50 h-11 font-medium"
                        />
                        {account && (
                          <Badge variant="outline" className="text-xs">
                            {account.normal_balance}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Amounts */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-semibold text-foreground">Debit (TZS)</Label>
                        <div className="relative mt-1">
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9,]*"
                            value={line.debit_amount > 0 ? formatNumber(line.debit_amount) : ''}
                            onChange={(e) => updateLine(index, 'debit_amount', e.target.value)}
                            placeholder="0"
                            className={cn(
                              "text-right font-mono h-11 focus:ring-2 focus:ring-primary/20",
                              isAutoBalanced && line.debit_amount > 0 && "bg-primary/10 border-primary/30"
                            )}
                          />
                          {isAutoBalanced && line.debit_amount > 0 && (
                            <div className="absolute -top-1 -right-1">
                              <Badge variant="default" className="text-xs px-1 py-0">
                                <Zap className="h-3 w-3" />
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-semibold text-foreground">Credit (TZS)</Label>
                        <div className="relative mt-1">
                          <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9,]*"
                            value={line.credit_amount > 0 ? formatNumber(line.credit_amount) : ''}
                            onChange={(e) => updateLine(index, 'credit_amount', e.target.value)}
                            placeholder="0"
                            className={cn(
                              "text-right font-mono h-11 focus:ring-2 focus:ring-primary/20",
                              isAutoBalanced && line.credit_amount > 0 && "bg-primary/10 border-primary/30"
                            )}
                          />
                          {isAutoBalanced && line.credit_amount > 0 && (
                            <div className="absolute -top-1 -right-1">
                              <Badge variant="default" className="text-xs px-1 py-0">
                                <Zap className="h-3 w-3" />
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(index)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        disabled={form.lines.length <= 2}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Line
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
            
            {/* Mobile Totals */}
            <Card className="p-4 border-2 border-primary bg-gradient-primary/5">
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-foreground">Transaction Totals</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Total Debits</div>
                    <div className="font-bold text-xl text-foreground">
                      {formatCurrency(totals.totalDebits)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Total Credits</div>
                    <div className="font-bold text-xl text-foreground">
                      {formatCurrency(totals.totalCredits)}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Badge variant={totals.isBalanced ? "default" : "destructive"} className="text-sm px-4 py-2">
                    {totals.isBalanced ? "✓ Balanced" : "⚠ Out of Balance"}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!totals.isBalanced || !form.description.trim() || transactionLoading}
          className="gap-2 h-12 px-8 bg-gradient-primary hover:shadow-glow transition-all"
        >
          {transactionLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {transactionLoading ? 'Posting Transaction...' : 'Post Transaction'}
        </Button>
      </div>
    </div>
  );
}