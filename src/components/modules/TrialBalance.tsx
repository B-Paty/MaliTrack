import { useMemo, useState } from "react";
import { Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFilteredAccounts } from "@/hooks/useFilteredAccounts";
import { formatCurrency, getCategoryOrder } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import ExportButtons from "@/components/exports/ExportButtons";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { useDateRange } from "@/contexts/DateRangeContext";

/**
 * TrialBalance
 * Summarizes accounts into debit/credit columns and checks balance.
 * - Reads accounts and places them in correct side
 * - Shows totals and balance status
 */
export default function TrialBalance() {
  const { accounts, loading, error } = useFilteredAccounts();
  const { dateRange } = useDateRange();

  const trialBalanceData = useMemo(() => {
    // Group accounts by category and calculate balances
    const categories: { [key: string]: typeof accounts } = {};
    let totalDebits = 0;
    let totalCredits = 0;

    accounts.forEach(account => {
      if (!categories[account.category]) {
        categories[account.category] = [];
      }
      categories[account.category].push(account);

      // Calculate debit/credit presentation based on account type and normal balance
      const balance = Math.abs(account.current_balance);
      
      if (balance > 0) {
        if (
          account.category === 'Current Asset' ||
          account.category === 'Fixed Asset' ||
          account.category === 'Expense' ||
          (account.category === 'Equity' && account.normal_balance === 'debit') // Dividends Paid
        ) {
          totalDebits += balance;
        } else {
          totalCredits += balance;
        }
      }
    });

    const sortedCategories = Object.keys(categories).sort((a, b) => 
      getCategoryOrder(a) - getCategoryOrder(b)
    );

    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    return {
      categories,
      sortedCategories,
      totalDebits,
      totalCredits,
      isBalanced
    };
  }, [accounts]);

  const getBalancePresentation = (account: typeof accounts[0]) => {
    const balance = Math.abs(account.current_balance);
    
    if (balance === 0) {
      return { debit: 0, credit: 0 };
    }

    // Determine how to present the balance based on account type
    if (
      account.category === 'Current Asset' ||
      account.category === 'Fixed Asset' ||
      account.category === 'Expense' ||
      (account.category === 'Equity' && account.normal_balance === 'debit') // Dividends Paid
    ) {
      return { debit: balance, credit: 0 };
    } else {
      return { debit: 0, credit: balance };
    }
  };

  const getCategoryTotal = (accountList: typeof accounts) => {
    let debitTotal = 0;
    let creditTotal = 0;
    
    accountList.forEach(account => {
      const presentation = getBalancePresentation(account);
      debitTotal += presentation.debit;
      creditTotal += presentation.credit;
    });
    
    return { debit: debitTotal, credit: creditTotal };
  };

  const categoryColors: { [key: string]: string } = {
    'Current Asset': 'bg-info/10 text-info border-info/20',
    'Fixed Asset': 'bg-info/20 text-info border-info/30',
    'Contra-Asset': 'bg-warning/10 text-warning border-warning/20',
    'Current Liability': 'bg-destructive/10 text-destructive border-destructive/20',
    'Long-term Liability': 'bg-destructive/20 text-destructive border-destructive/30',
    'Equity': 'bg-success/10 text-success border-success/20',
    'Revenue': 'bg-primary/10 text-primary border-primary/20',
    'Expense': 'bg-warning/20 text-warning border-warning/30',
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading trial balance...</p>
        </div>
      </div>
    );
  }



  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <DateRangePicker title="Trial Balance Period" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Trial Balance</h1>
          <p className="text-foreground/70 mt-2">Verify that total debits equal total credits across all accounts</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={trialBalanceData.isBalanced ? "default" : "destructive"} className="gap-2 text-sm px-4 py-2">
            {trialBalanceData.isBalanced ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Balanced
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                Out of Balance
              </>
            )}
          </Badge>
          
          <ExportButtons reportTitle="Trial Balance" />
        </div>
      </div>

      {/* Report Settings */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <p className="text-sm text-foreground/70 mb-2">Report Period</p>
              <p className="text-sm font-semibold text-foreground">
                {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-foreground/70 mb-2">Active Accounts</p>
              <p className="text-2xl font-bold text-foreground">{accounts.filter(acc => Math.abs(acc.current_balance) > 0).length}</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-foreground/70 mb-2">Balance Status</p>
              <Badge variant={trialBalanceData.isBalanced ? "default" : "destructive"} className="text-lg p-2">
                {trialBalanceData.isBalanced ? "In Balance" : "Out of Balance"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Trial Balance Report */}
      <div className="space-y-4">
        {trialBalanceData.sortedCategories.map(category => {
          const accountList = trialBalanceData.categories[category];
          const categoryTotals = getCategoryTotal(accountList);
          
          return (
            <Card key={category} className="shadow-card">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <Badge className={categoryColors[category]}>
                      {category}
                    </Badge>
                  </CardTitle>
                  <div className="flex gap-8 text-sm">
                    <div className="text-right">
                      <p className="text-foreground/80 dark:text-foreground">Category Debits</p>
                      <p className="font-bold text-foreground">{formatCurrency(categoryTotals.debit)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground/80 dark:text-foreground">Category Credits</p>
                      <p className="font-bold text-foreground">{formatCurrency(categoryTotals.credit)}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Account Code</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Account Name</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Debit Balance</th>
                        <th className="text-right py-3 px-4 font-semibold text-foreground">Credit Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accountList
                        .filter(account => Math.abs(account.current_balance) > 0)
                        .map((account, index) => {
                          const presentation = getBalancePresentation(account);
                          
                          return (
                            <tr
                              key={account.account_code}
                              className={cn(
                                "border-b border-border/50 hover:bg-accent/50 transition-colors",
                                index % 2 === 0 ? "bg-transparent" : "bg-muted/30"
                              )}
                            >
                              <td className="py-3 px-4">
                                <span className="font-mono font-semibold text-primary">
                                  {account.account_code}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-medium text-foreground">
                                  {account.account_name}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className={cn(
                                  "font-semibold",
                                  presentation.debit > 0 ? "text-foreground" : "text-muted-foreground"
                                )}>
                                  {presentation.debit > 0 ? formatCurrency(presentation.debit) : "—"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className={cn(
                                  "font-semibold",
                                  presentation.credit > 0 ? "text-foreground" : "text-muted-foreground"
                                )}>
                                  {presentation.credit > 0 ? formatCurrency(presentation.credit) : "—"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Grand Totals */}
      <Card className="shadow-elevated bg-gradient-secondary">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary/20">
                  <th className="text-left py-4 px-4 text-lg font-bold text-foreground" colSpan={2}>
                    TRIAL BALANCE TOTALS
                  </th>
                  <th className="text-right py-4 px-4 text-lg font-bold text-foreground">TOTAL DEBITS</th>
                  <th className="text-right py-4 px-4 text-lg font-bold text-foreground">TOTAL CREDITS</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gradient-primary/5">
                  <td colSpan={2} className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {trialBalanceData.isBalanced ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      )}
                      <span className="font-semibold">
                        Period: {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(trialBalanceData.totalDebits)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(trialBalanceData.totalCredits)}
                    </span>
                  </td>
                </tr>
                <tr className="bg-primary/10">
                  <td colSpan={2} className="py-2 px-4 text-sm font-medium text-foreground">
                    Difference (should be zero)
                  </td>
                  <td colSpan={2} className="py-2 px-4 text-right">
                    <span className={cn(
                      "text-lg font-bold",
                      trialBalanceData.isBalanced ? "text-success" : "text-destructive"
                    )}>
                      {formatCurrency(Math.abs(trialBalanceData.totalDebits - trialBalanceData.totalCredits))}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
