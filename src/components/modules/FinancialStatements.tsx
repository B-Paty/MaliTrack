/**
 * FinancialStatements
 * Builds Income Statement and Balance Sheet from account balances.
 * - Uses account categories to compute totals and net income
 * - Exports a styled PDF using html2canvas + jsPDF
 */
import { useState, useMemo, useRef } from "react";
import { FileText, Download, Calendar, Building2, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useFilteredAccounts } from "@/hooks/useFilteredAccounts";
import { useEnhancedCompanySettings } from "@/hooks/useEnhancedCompanySettings";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { PDFExporter } from "@/lib/pdfExporter";
import { useToast } from "@/hooks/use-toast";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { useDateRange } from "@/contexts/DateRangeContext";

type StatementType = 'income' | 'balance' | 'cash';

export default function FinancialStatements() {
  const { accounts, loading: accountsLoading } = useFilteredAccounts();
  const { settings, getLogoForContext } = useEnhancedCompanySettings();
  const { toast } = useToast();
  const { dateRange } = useDateRange();
  
  const [selectedStatement, setSelectedStatement] = useState<StatementType>('income');
  const [exporting, setExporting] = useState(false);

  // Use the global date range
  const dateFrom = dateRange.startDate;
  const dateTo = dateRange.endDate;

  // Calculate statement data
  const statementData = useMemo(() => {
    if (!accounts.length) return null;

    const revenue = accounts.filter(acc => acc.category === 'Revenue');
    const expenses = accounts.filter(acc => acc.category === 'Expense');
    const assets = accounts.filter(acc => acc.category.includes('Asset'));
    const liabilities = accounts.filter(acc => acc.category.includes('Liability'));
    const equity = accounts.filter(acc => acc.category === 'Equity');

    const totalRevenue = revenue.reduce((sum, acc) => sum + Math.abs(acc.current_balance), 0);
    const totalExpenses = expenses.reduce((sum, acc) => sum + Math.abs(acc.current_balance), 0);
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
        await exporter.exportFinancialStatement(selectedStatement, statementData, { from: dateFrom, to: dateTo }, undefined, settings);
        
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

    const companyLogo = getLogoForContext('preview');
    const companyName = settings?.company_name || 'QSA Solutions';

    return (
      <div className="space-y-6">
        <div className="text-center border-b border-border pb-6">
          {/* Company Logo */}
          {companyLogo && (
            <div className="flex justify-center mb-4">
              <img 
                src={companyLogo} 
                alt={`${companyName} Logo`}
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  console.warn('Failed to load company logo:', e);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Company Name with Branding */}
          <h2 className="text-2xl font-bold" style={{ 
            color: settings?.primary_color || '#a1052d' 
          }}>
            {companyName}
          </h2>
          
          <h3 className="text-xl font-semibold text-muted-foreground mt-2">Income Statement</h3>
          <p className="text-muted-foreground mt-1">
            For the period from {formatDate(dateFrom)} to {formatDate(dateTo)}
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold border-b pb-2" style={{ 
            color: settings?.primary_color || '#a1052d',
            borderColor: settings?.primary_color || '#a1052d'
          }}>
            REVENUE
          </h4>
          {statementData.revenue.map(account => (
            <div key={account.account_code} className="flex justify-between py-2">
              <span className="text-foreground">{account.account_name}</span>
              <span className="font-mono text-foreground">{formatCurrency(Math.abs(account.current_balance))}</span>
            </div>
          ))}
          <div className="flex justify-between py-2 border-t border-border font-semibold">
            <span className="text-foreground">Total Revenue</span>
            <span className="font-mono text-foreground">{formatCurrency(statementData.totalRevenue)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold border-b pb-2" style={{ 
            color: settings?.primary_color || '#a1052d',
            borderColor: settings?.primary_color || '#a1052d'
          }}>
            EXPENSES
          </h4>
          {statementData.expenses.map(account => (
            <div key={account.account_code} className="flex justify-between py-2">
              <span className="text-foreground">{account.account_name}</span>
              <span className="font-mono text-foreground">{formatCurrency(Math.abs(account.current_balance))}</span>
            </div>
          ))}
          <div className="flex justify-between py-2 border-t border-border font-semibold">
            <span className="text-foreground">Total Expenses</span>
            <span className="font-mono text-foreground">{formatCurrency(statementData.totalExpenses)}</span>
          </div>
        </div>

        <div className="border-t-2 pt-4" style={{ 
          borderColor: settings?.primary_color || '#a1052d' 
        }}>
          <div className="flex justify-between py-3 text-xl font-bold">
            <span className="text-foreground">
              {statementData.netIncome >= 0 ? 'NET INCOME' : 'NET LOSS'}
            </span>
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

    const companyLogo = getLogoForContext('preview');
    const companyName = settings?.company_name || 'QSA Solutions';

    return (
      <div className="space-y-6">
        <div className="text-center border-b border-border pb-6">
          {/* Company Logo */}
          {companyLogo && (
            <div className="flex justify-center mb-4">
              <img 
                src={companyLogo} 
                alt={`${companyName} Logo`}
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  console.warn('Failed to load company logo:', e);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Company Name with Branding */}
          <h2 className="text-2xl font-bold" style={{ 
            color: settings?.primary_color || '#a1052d' 
          }}>
            {companyName}
          </h2>
          
          <h3 className="text-xl font-semibold text-muted-foreground mt-2">Balance Sheet</h3>
          <p className="text-muted-foreground mt-1">As of {formatDate(dateTo)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold border-b pb-2" style={{ 
              color: settings?.primary_color || '#a1052d',
              borderColor: settings?.primary_color || '#a1052d'
            }}>
              ASSETS
            </h4>
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
              <h4 className="text-lg font-semibold border-b pb-2" style={{ 
                color: settings?.primary_color || '#a1052d',
                borderColor: settings?.primary_color || '#a1052d'
              }}>
                LIABILITIES
              </h4>
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
              <h4 className="text-lg font-semibold border-b pb-2" style={{ 
                color: settings?.primary_color || '#a1052d',
                borderColor: settings?.primary_color || '#a1052d'
              }}>
                EQUITY
              </h4>
              {statementData.equity.map(account => (
                <div key={account.account_code} className="flex justify-between py-2">
                  <span className="text-foreground">{account.account_name}</span>
                  <span className="font-mono text-foreground">{formatCurrency(account.current_balance)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2">
                <span className="text-foreground">
                  {statementData.netIncome >= 0 ? 'Retained Earnings (Current Period)' : 'Accumulated Loss'}
                </span>
                <span className={`font-mono ${
                  statementData.netIncome >= 0 ? 'text-foreground' : 'text-destructive'
                }`}>
                  {formatCurrency(statementData.netIncome)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t border-border font-semibold">
                <span className="text-foreground">Total Equity</span>
                <span className="font-mono text-foreground">{formatCurrency(statementData.totalEquity)}</span>
              </div>
            </div>

            <div className="border-t-2 pt-4" style={{ 
              borderColor: settings?.primary_color || '#a1052d' 
            }}>
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
      {/* Date Range Filter */}
      <DateRangePicker title="Financial Statements Period" />

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
