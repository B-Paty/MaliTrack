import { useState, useMemo } from "react";
import { Plus, Trash2, Save, Calculator, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { chartOfAccounts, formatCurrency, type TransactionLine } from "@/data/chartOfAccounts";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface JournalEntryForm {
  transactionDate: string;
  description: string;
  lines: TransactionLine[];
}

export default function JournalEntry() {
  const { toast } = useToast();
  const [form, setForm] = useState<JournalEntryForm>({
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
    lines: [
      { id: '1', accountCode: '', accountName: '', debitAmount: 0, creditAmount: 0 },
      { id: '2', accountCode: '', accountName: '', debitAmount: 0, creditAmount: 0 }
    ]
  });

  const totals = useMemo(() => {
    const totalDebits = form.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
    const totalCredits = form.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
    return { totalDebits, totalCredits, isBalanced };
  }, [form.lines]);

  const addLine = () => {
    const newLine: TransactionLine = {
      id: Date.now().toString(),
      accountCode: '',
      accountName: '',
      debitAmount: 0,
      creditAmount: 0
    };
    setForm(prev => ({
      ...prev,
      lines: [...prev.lines, newLine]
    }));
  };

  const removeLine = (id: string) => {
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
      lines: prev.lines.filter(line => line.id !== id)
    }));
  };

  const updateLine = (id: string, field: keyof TransactionLine, value: any) => {
    setForm(prev => ({
      ...prev,
      lines: prev.lines.map(line => {
        if (line.id === id) {
          const updatedLine = { ...line, [field]: value };
          
          // Auto-populate account name when code is selected
          if (field === 'accountCode') {
            const account = chartOfAccounts.find(acc => acc.accountCode === value);
            updatedLine.accountName = account?.accountName || '';
          }
          
          // Ensure only debit OR credit is entered
          if (field === 'debitAmount' && value > 0) {
            updatedLine.creditAmount = 0;
          } else if (field === 'creditAmount' && value > 0) {
            updatedLine.debitAmount = 0;
          }
          
          return updatedLine;
        }
        return line;
      })
    }));
  };

  const handleSubmit = () => {
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
      line.accountCode && (line.debitAmount > 0 || line.creditAmount > 0)
    );

    if (validLines.length < 2) {
      toast({
        title: "Validation Error",
        description: "Journal entry must have at least 2 valid lines",
        variant: "destructive"
      });
      return;
    }

    // Simulate posting transaction
    toast({
      title: "Transaction Posted Successfully",
      description: `Reference: REF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`,
    });

    // Reset form
    setForm({
      transactionDate: new Date().toISOString().split('T')[0],
      description: '',
      lines: [
        { id: Date.now().toString(), accountCode: '', accountName: '', debitAmount: 0, creditAmount: 0 },
        { id: (Date.now() + 1).toString(), accountCode: '', accountName: '', debitAmount: 0, creditAmount: 0 }
      ]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Journal Entry</h1>
          <p className="text-muted-foreground">Record accounting transactions with detailed entries</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={totals.isBalanced ? "default" : "destructive"} className="gap-1">
            <Calculator className="h-3 w-3" />
            {totals.isBalanced ? "Balanced" : "Out of Balance"}
          </Badge>
        </div>
      </div>

      {/* Transaction Header */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Transaction Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Transaction Date</Label>
              <Input
                id="date"
                type="date"
                value={form.transactionDate}
                onChange={(e) => setForm(prev => ({ ...prev, transactionDate: e.target.value }))}
                min="2025-01-01"
                max="2026-12-31"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter transaction description..."
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                maxLength={255}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journal Lines */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Journal Lines</CardTitle>
            <Button onClick={addLine} variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Line
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground w-24">Account Code</th>
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Account Name</th>
                  <th className="text-right py-3 px-2 font-semibold text-muted-foreground w-32">Debit</th>
                  <th className="text-right py-3 px-2 font-semibold text-muted-foreground w-32">Credit</th>
                  <th className="text-center py-3 px-2 font-semibold text-muted-foreground w-16">Action</th>
                </tr>
              </thead>
              <tbody>
                {form.lines.map((line, index) => (
                  <tr key={line.id} className="border-b border-border/50 hover:bg-accent/50">
                    <td className="py-3 px-2">
                      <select
                        value={line.accountCode}
                        onChange={(e) => updateLine(line.id, 'accountCode', e.target.value)}
                        className="w-full h-9 px-2 border border-input bg-background rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select...</option>
                        {chartOfAccounts.map(account => (
                          <option key={account.accountCode} value={account.accountCode}>
                            {account.accountCode}
                          </option>
                        ))}
                      </select>
                    </td>
                    
                    <td className="py-3 px-2">
                      <Input
                        value={line.accountName}
                        readOnly
                        placeholder="Account name will appear here"
                        className="bg-muted/50"
                      />
                    </td>
                    
                    <td className="py-3 px-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.debitAmount || ''}
                        onChange={(e) => updateLine(line.id, 'debitAmount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="text-right"
                      />
                    </td>
                    
                    <td className="py-3 px-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.creditAmount || ''}
                        onChange={(e) => updateLine(line.id, 'creditAmount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="text-right"
                      />
                    </td>
                    
                    <td className="py-3 px-2 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLine(line.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
                <tr className="border-t-2 border-border bg-muted/30">
                  <td className="py-4 px-2 font-semibold text-foreground" colSpan={2}>
                    TOTALS
                  </td>
                  <td className="py-4 px-2 text-right">
                    <span className="font-bold text-lg text-foreground">
                      {formatCurrency(totals.totalDebits)}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <span className="font-bold text-lg text-foreground">
                      {formatCurrency(totals.totalCredits)}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <Badge variant={totals.isBalanced ? "default" : "destructive"} className="text-xs">
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
          disabled={!totals.isBalanced || !form.description.trim()}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Post Transaction
        </Button>
      </div>
    </div>
  );
}