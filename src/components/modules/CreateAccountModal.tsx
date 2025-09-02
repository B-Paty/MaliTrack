/**
 * CreateAccountModal
 * Modal component for creating new accounts in the Chart of Accounts
 * - Form validation for account code uniqueness
 * - Category-based normal balance auto-assignment
 * - Integration with useAccounts hook
 */

import React, { useState, useEffect } from "react";
import { Plus, X, Building2, DollarSign, Hash, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccounts, type Account } from "@/hooks/useAccounts";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (account: Account) => void;
}

// Account categories with their normal balances
const ACCOUNT_CATEGORIES = [
  { value: 'Current Asset', label: 'Current Asset', normalBalance: 'debit' },
  { value: 'Fixed Asset', label: 'Fixed Asset', normalBalance: 'debit' },
  { value: 'Contra-Asset', label: 'Contra-Asset', normalBalance: 'credit' },
  { value: 'Current Liability', label: 'Current Liability', normalBalance: 'credit' },
  { value: 'Long-term Liability', label: 'Long-term Liability', normalBalance: 'credit' },
  { value: 'Equity', label: 'Equity', normalBalance: 'credit' },
  { value: 'Revenue', label: 'Revenue', normalBalance: 'credit' },
  { value: 'Expense', label: 'Expense', normalBalance: 'debit' },
];

export default function CreateAccountModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateAccountModalProps) {
  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    category: '',
    normal_balance: 'debit' as 'debit' | 'credit',
    current_balance: 0,
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { accounts, createAccount } = useAccounts();
  const { toast } = useToast();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        account_code: '',
        account_name: '',
        category: '',
        normal_balance: 'debit',
        current_balance: 0,
        description: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  // Auto-set normal balance when category changes
  useEffect(() => {
    if (formData.category) {
      const selectedCategory = ACCOUNT_CATEGORIES.find(cat => cat.value === formData.category);
      if (selectedCategory) {
        setFormData(prev => ({
          ...prev,
          normal_balance: selectedCategory.normalBalance as 'debit' | 'credit'
        }));
      }
    }
  }, [formData.category]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Account code validation
    if (!formData.account_code.trim()) {
      newErrors.account_code = 'Account code is required';
    } else if (!/^\d{4}$/.test(formData.account_code)) {
      newErrors.account_code = 'Account code must be 4 digits';
    } else if (accounts.some(acc => acc.account_code === formData.account_code)) {
      newErrors.account_code = 'Account code already exists';
    }

    // Account name validation
    if (!formData.account_name.trim()) {
      newErrors.account_name = 'Account name is required';
    } else if (formData.account_name.trim().length < 2) {
      newErrors.account_name = 'Account name must be at least 2 characters';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Balance validation
    if (isNaN(formData.current_balance) || formData.current_balance < 0) {
      newErrors.current_balance = 'Balance must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const newAccount = await createAccount({
        account_code: formData.account_code.trim(),
        account_name: formData.account_name.trim(),
        category: formData.category,
        normal_balance: formData.normal_balance,
        current_balance: formData.current_balance,
      });

      toast({
        title: 'Success',
        description: `Account ${formData.account_code} created successfully`,
      });

      onSuccess?.(newAccount);
      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create account. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5 text-primary" />
            Create New Account
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Account Code */}
            <div className="space-y-2">
              <Label htmlFor="account_code" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Account Code *
              </Label>
              <Input
                id="account_code"
                value={formData.account_code}
                onChange={(e) => handleInputChange('account_code', e.target.value)}
                placeholder="e.g., 1010"
                className={cn(errors.account_code && "border-destructive")}
                maxLength={4}
              />
              {errors.account_code && (
                <p className="text-sm text-destructive">{errors.account_code}</p>
              )}
              <p className="text-xs text-muted-foreground">
                4-digit numeric code (e.g., 1010, 2010)
              </p>
            </div>

            {/* Account Name */}
            <div className="space-y-2">
              <Label htmlFor="account_name" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Account Name *
              </Label>
              <Input
                id="account_name"
                value={formData.account_name}
                onChange={(e) => handleInputChange('account_name', e.target.value)}
                placeholder="e.g., Cash in Hand"
                className={cn(errors.account_name && "border-destructive")}
              />
              {errors.account_name && (
                <p className="text-sm text-destructive">{errors.account_name}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Category *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger className={cn(errors.category && "border-destructive")}>
                <SelectValue placeholder="Select account category" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category}</p>
            )}
          </div>

          {/* Normal Balance (Auto-set based on category) */}
          <div className="space-y-2">
            <Label htmlFor="normal_balance" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Normal Balance
            </Label>
            <Select
              value={formData.normal_balance}
              onValueChange={(value: 'debit' | 'credit') => handleInputChange('normal_balance', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debit">Debit</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Auto-set based on category, but can be changed if needed
            </p>
          </div>

          {/* Initial Balance */}
          <div className="space-y-2">
            <Label htmlFor="current_balance" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Initial Balance
            </Label>
            <Input
              id="current_balance"
              type="number"
              step="0.01"
              min="0"
              value={formData.current_balance}
              onChange={(e) => handleInputChange('current_balance', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={cn(errors.current_balance && "border-destructive")}
            />
            {errors.current_balance && (
              <p className="text-sm text-destructive">{errors.current_balance}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Starting balance for this account (optional)
            </p>
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Additional details about this account..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
