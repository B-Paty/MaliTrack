import { useState, useMemo } from "react";
import { FileText, Download, Calendar, Building2, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAccounts } from "@/hooks/useAccounts";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { PDFExporter } from "@/lib/pdfExporter";
import { useToast } from "@/hooks/use-toast";

type StatementType = 'income' | 'balance' | 'cash';

export default function FinancialStatements() {
  const { accounts, loading: accountsLoading } = useAccounts();
  const { settings } = useCompanySettings();
  const { toast } = useToast();
  
  const [selectedStatement, setSelectedStatement] = useState<StatementType>('income');
  const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [exporting, setExporting] = useState(false);

  // Calculate statement data
  const statementData = useMemo(() => {
    if (!accounts.length) return null;

    const revenue = accounts.filter(acc => acc.category === 'Revenue');
    const expenses = accounts.filter(acc => acc.category === 'Expense');
    const assets = accounts.filter(acc => acc.category.includes('Asset'));
    const liabilities = accounts.filter(acc => acc.category.includes('Liability'));
    const equity = accounts.filter(acc => acc.category === 'Equity');

    const totalRevenue = revenue.reduce((sum, acc) => sum + acc.current_balance, 0);
    const totalExpenses = expenses.reduce((sum, acc) => sum + acc.current_balance, 0);
    const netIncome = totalRevenue - totalExpenses;

    const totalAssets = assets.reduce((sum, acc) => 
      acc.normal_balance === 'debit' ? sum + acc.current_balance : sum - acc.current_balance, 0
    );
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.current_balance, 0);
    const totalEquity = equity.reduce((sum, acc) => sum + acc.current_balance, 0) + netIncome;

    return {
      revenue,
      expenses,
      assets,
      liabilities,
      equity,
      totalRevenue,
      totalExpenses,
      netIncome,
      totalAssets,
      totalLiabilities,
      totalEquity
    };
  }, [accounts]);

  const handleExport = async () => {
    if (!statementData) {
      toast({
        variant: 'destructive',
        title: 'Export Error',
        description: 'No financial data to export',
      });
      return;
    }
    
    setExporting(true);
    try {
      const exporter = new PDFExporter({
        title: selectedStatement === 'income' ? 'Income Statement' : 
               selectedStatement === 'balance' ? 'Balance Sheet' : 'Cash Flow Statement',
        companyName: settings?.company_name || 'QSA Solutions',
        reportDate: selectedStatement === 'balance' ? dateTo : dateFrom,
        pageSize: 'a4',
        orientation: 'portrait'
      });
      
      if (selectedStatement === 'income' || selectedStatement === 'balance') {
        exporter.exportFinancialStatement(selectedStatement, statementData, { from: dateFrom, to: dateTo });
        
        toast({
          title: 'Success',
          description: `${selectedStatement === 'income' ? 'Income Statement' : 'Balance Sheet'} exported successfully`,
        });
      }
    } catch (error) {
      console.error('Financial Statements export failed:', error);
      toast({
        variant: 'destructive',
        title: 'Export Error',
        description: error instanceof Error ? error.message : 'Failed to export PDF',
      });
    } finally {
      setExporting(false);
    }
  };

  const renderIncomeStatement = () => {
    if (!statementData) return null;

    return (
      <div className="space-y-6">
        <div className="text-center border-b border-border pb-6">
          <h2 className="text-2xl font-bold text-foreground">{settings?.company_name || 'QSA Solutions'}</h2>
          <h3 className="text-xl font-semibold text-muted-foreground mt-2">Income Statement</h3>
          <p className="text-muted-foreground mt-1">
            For the period from {formatDate(dateFrom)} to {formatDate(dateTo)}
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground border-b border-border pb-2">REVENUE</h4>
          {statementData.revenue.map(account => (
            <div key={account.account_code} className="flex justify-between py-2">
              <span className="text-foreground">{account.account_name}</span>
              <span className="font-mono text-foreground">{formatCurrency(account.current_balance)}</span>
            </div>
          ))}
          <div className="flex justify-between py-2 border-t border-border font-semibold">
            <span className="text-foreground">Total Revenue</span>
            <span className="font-mono text-foreground">{formatCurrency(statementData.totalRevenue)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-foreground border-b border-border pb-2">EXPENSES</h4>
          {statementData.expenses.map(account => (
            <div key={account.account_code} className="flex justify-between py-2">
              <span className="text-foreground">{account.account_name}</span>
              <span className="font-mono text-foreground">{formatCurrency(account.current_balance)}</span>
            </div>
          ))}
          <div className="flex justify-between py-2 border-t border-border font-semibold">
            <span className="text-foreground">Total Expenses</span>
            <span className="font-mono text-foreground">{formatCurrency(statementData.totalExpenses)}</span>
          </div>
        </div>

        <div className="border-t-2 border-primary pt-4">
          <div className="flex justify-between py-3 text-xl font-bold">
            <span className="text-foreground">NET INCOME</span>
            <span className={`font-mono flex items-center gap-2 ${
              statementData.netIncome >= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {statementData.netIncome >= 0 ? 
                <TrendingUp className="h-5 w-5" /> : 
                <TrendingDown className="h-5 w-5" />
              }
              {formatCurrency(Math.abs(statementData.netIncome))}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderBalanceSheet = () => {
    if (!statementData) return null;

    return (
      <div className="space-y-6">
        <div className="text-center border-b border-border pb-6">
          <h2 className="text-2xl font-bold text-foreground">{settings?.company_name || 'QSA Solutions'}</h2>
          <h3 className="text-xl font-semibold text-muted-foreground mt-2">Balance Sheet</h3>
          <p className="text-muted-foreground mt-1">As of {formatDate(dateTo)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground border-b border-border pb-2">ASSETS</h4>
            {statementData.assets.map(account => (
              <div key={account.account_code} className="flex justify-between py-2">
                <span className="text-foreground">{account.account_name}</span>
                <span className="font-mono text-foreground">
                  {formatCurrency(account.normal_balance === 'debit' ? account.current_balance : -account.current_balance)}
                </span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-t border-border font-semibold">
              <span className="text-foreground">Total Assets</span>
              <span className="font-mono text-foreground">{formatCurrency(statementData.totalAssets)}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground border-b border-border pb-2">LIABILITIES</h4>
              {statementData.liabilities.map(account => (
                <div key={account.account_code} className="flex justify-between py-2">
                  <span className="text-foreground">{account.account_name}</span>
                  <span className="font-mono text-foreground">{formatCurrency(account.current_balance)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 border-t border-border font-semibold">
                <span className="text-foreground">Total Liabilities</span>
                <span className="font-mono text-foreground">{formatCurrency(statementData.totalLiabilities)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground border-b border-border pb-2">EQUITY</h4>
              {statementData.equity.map(account => (
                <div key={account.account_code} className="flex justify-between py-2">
                  <span className="text-foreground">{account.account_name}</span>
                  <span className="font-mono text-foreground">{formatCurrency(account.current_balance)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2">
                <span className="text-foreground">Retained Earnings (Current Period)</span>
                <span className="font-mono text-foreground">{formatCurrency(statementData.netIncome)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-border font-semibold">
                <span className="text-foreground">Total Equity</span>
                <span className="font-mono text-foreground">{formatCurrency(statementData.totalEquity)}</span>
              </div>
            </div>

            <div className="border-t-2 border-primary pt-4">
              <div className="flex justify-between py-2 font-semibold text-lg">
                <span className="text-foreground">Total Liabilities & Equity</span>
                <span className="font-mono text-foreground">{formatCurrency(statementData.totalLiabilities + statementData.totalEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (accountsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading financial data...</p>
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
            Financial Statements
          </h1>
          <p className="text-muted-foreground mt-2">Generate comprehensive financial reports</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-sm px-3 py-1">
            <Calendar className="h-4 w-4" />
            {formatDate(dateFrom)} - {formatDate(dateTo)}
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <Card className="shadow-card border-0 bg-gradient-secondary/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-5 w-5 text-primary" />
            Statement Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="statement-type" className="text-sm font-semibold text-foreground">Statement Type</Label>
              <Select value={selectedStatement} onValueChange={(value: StatementType) => setSelectedStatement(value)}>
                <SelectTrigger className="mt-1.5 h-11">
                  <SelectValue placeholder="Select statement type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income Statement</SelectItem>
                  <SelectItem value="balance">Balance Sheet</SelectItem>
                  <SelectItem value="cash" disabled>Cash Flow (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date-from" className="text-sm font-semibold text-foreground">From Date</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
            
            <div>
              <Label htmlFor="date-to" className="text-sm font-semibold text-foreground">To Date</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statement Content */}
      <Card className="shadow-elevated border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              {selectedStatement === 'income' ? 'Income Statement' : 
               selectedStatement === 'balance' ? 'Balance Sheet' : 'Cash Flow Statement'}
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-2 hover:shadow-md transition-shadow" onClick={handleExport} disabled={exporting}>
              <Download className="h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="bg-white rounded-lg p-8 border border-border/20">
          {selectedStatement === 'income' && renderIncomeStatement()}
          {selectedStatement === 'balance' && renderBalanceSheet()}
          {selectedStatement === 'cash' && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cash Flow Statement coming soon...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
