import { useState, useMemo } from "react";
import { Plus, Trash2, Save, Calculator, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions, type TransactionLine } from "@/hooks/useTransactions";
import { formatCurrency, formatNumber, parseNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface JournalEntryForm {
  transactionDate: string;
  description: string;
  lines: TransactionLine[];
}

export default function JournalEntry() {
  const { toast } = useToast();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { createTransaction, loading: transactionLoading } = useTransactions();
  
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
    return { totalDebits, totalCredits, isBalanced };
  }, [form.lines]);

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

  const updateLine = (index: number, field: keyof TransactionLine, value: any) => {
    setForm(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => {
        if (i === index) {
          const updatedLine = { ...line, [field]: value };
          
          // Auto-populate account name when code is selected
          if (field === 'account_code') {
            const account = accounts.find(acc => acc.account_code === value);
            updatedLine.account_name = account?.account_name || '';
          }
          
          // Ensure only debit OR credit is entered
          if (field === 'debit_amount') {
            const numValue = typeof value === 'string' ? parseNumber(value) : value;
            updatedLine.debit_amount = numValue;
            if (numValue > 0) {
              updatedLine.credit_amount = 0;
            }
          } else if (field === 'credit_amount') {
            const numValue = typeof value === 'string' ? parseNumber(value) : value;
            updatedLine.credit_amount = numValue;
            if (numValue > 0) {
              updatedLine.debit_amount = 0;
            }
          }
          
          return updatedLine;
        }
        return line;
      })
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a transaction description",
        variant: "destructive"
      });
      return;
    }

    if (!totals.isBalanced) {
      toast({
        title: "Validation Error",
        description: "Debits must equal credits",
        variant: "destructive"
      });
      return;
    }

    const validLines = form.lines.filter(line => 
      line.account_code && (line.debit_amount > 0 || line.credit_amount > 0)
    );

    if (validLines.length < 2) {
      toast({
        title: "Validation Error",
        description: "Journal entry must have at least 2 valid lines",
        variant: "destructive"
      });
      return;
    }

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
        </div>
      </div>

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
              <Label htmlFor="date" className="text-sm font-semibold text-foreground">Transaction Date</Label>
              <Input
                id="date"
                type="date"
                value={form.transactionDate}
                onChange={(e) => setForm(prev => ({ ...prev, transactionDate: e.target.value }))}
                min="2025-01-01"
                max="2026-12-31"
                className="mt-1.5 h-11"
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-foreground">Description</Label>
              <Input
                id="description"
                placeholder="Enter transaction description..."
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                maxLength={255}
                className="mt-1.5 h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journal Lines */}
      <Card className="shadow-elevated border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-foreground">Journal Lines</CardTitle>
            <Button onClick={addLine} variant="outline" size="sm" className="gap-2 hover:shadow-md transition-shadow">
              <Plus className="h-4 w-4" />
              Add Line
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-primary/20">
                  <th className="text-left py-4 px-3 font-bold text-muted-foreground w-32">Account Code</th>
                  <th className="text-left py-4 px-3 font-bold text-muted-foreground">Account Name</th>
                  <th className="text-right py-4 px-3 font-bold text-muted-foreground w-36">Debit (TZS)</th>
                  <th className="text-right py-4 px-3 font-bold text-muted-foreground w-36">Credit (TZS)</th>
                  <th className="text-center py-4 px-3 font-bold text-muted-foreground w-16">Action</th>
                </tr>
              </thead>
              <tbody>
                {form.lines.map((line, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-4 px-3">
                      <select
                        value={line.account_code}
                        onChange={(e) => updateLine(index, 'account_code', e.target.value)}
                        className="w-full h-11 px-3 border border-input bg-background rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">Select...</option>
                        {accounts.map(account => (
                          <option key={account.account_code} value={account.account_code}>
                            {account.account_code}
                          </option>
                        ))}
                      </select>
                    </td>
                    
                    <td className="py-4 px-3">
                      <Input
                        value={line.account_name || ''}
                        readOnly
                        placeholder="Account name will appear here"
                        className="bg-muted/50 h-11 font-medium"
                      />
                    </td>
                    
                    <td className="py-4 px-3">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.debit_amount > 0 ? formatNumber(line.debit_amount) : ''}
                        onChange={(e) => updateLine(index, 'debit_amount', e.target.value)}
                        placeholder="0.00"
                        className="text-right font-mono h-11 focus:ring-2 focus:ring-primary/20"
                      />
                    </td>
                    
                    <td className="py-4 px-3">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.credit_amount > 0 ? formatNumber(line.credit_amount) : ''}
                        onChange={(e) => updateLine(index, 'credit_amount', e.target.value)}
                        placeholder="0.00"
                        className="text-right font-mono h-11 focus:ring-2 focus:ring-primary/20"
                      />
                    </td>
                    
                    <td className="py-4 px-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLine(index)}
                        className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        disabled={form.lines.length <= 2}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
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