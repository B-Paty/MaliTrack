import { useState, useMemo } from "react";
import { ArrowLeft, Calendar, FileText, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Account } from "@/hooks/useAccounts";

interface AccountDetailsProps {
  account: Account;
  onBack: () => void;
}

export default function AccountDetails({ account, onBack }: AccountDetailsProps) {
  const { transactions, loading } = useTransactions();
  const [dateFilter, setDateFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Filter transactions for this account
  const accountTransactions = useMemo(() => {
    if (!transactions) return [];
    
    const filtered = transactions.filter(transaction => 
      transaction.lines.some(line => line.account_code === account.account_code)
    ).map(transaction => ({
      ...transaction,
      accountLine: transaction.lines.find(line => line.account_code === account.account_code)!
    }));

    // Apply filters
    let result = filtered;

    if (dateFilter) {
      result = result.filter(t => t.transaction_date >= dateFilter);
    }

    if (searchFilter) {
      result = result.filter(t => 
        t.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.reference_number?.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }

    return result.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  }, [transactions, account.account_code, dateFilter, searchFilter]);

  // Calculate running balance
  const transactionsWithBalance = useMemo(() => {
    let runningBalance = 0;
    return accountTransactions.reverse().map(transaction => {
      const line = transaction.accountLine;
      const change = account.normal_balance === 'debit' 
        ? line.debit_amount - line.credit_amount
        : line.credit_amount - line.debit_amount;
      
      runningBalance += change;
      
      return {
        ...transaction,
        balanceChange: change,
        runningBalance
      };
    }).reverse();
  }, [accountTransactions, account.normal_balance]);

  const totalDebits = accountTransactions.reduce((sum, t) => sum + t.accountLine.debit_amount, 0);
  const totalCredits = accountTransactions.reduce((sum, t) => sum + t.accountLine.credit_amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading account details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="gap-2 hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Accounts
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Account Details
            </h1>
            <p className="text-muted-foreground mt-2">Transaction history and balance details</p>
          </div>
        </div>
      </div>

      {/* Account Summary */}
      <Card className="shadow-elevated border-0 bg-gradient-secondary/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Eye className="h-5 w-5 text-primary" />
            Account Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-semibold">Account Code</p>
              <p className="text-2xl font-mono font-bold text-primary">{account.account_code}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-semibold">Account Name</p>
              <p className="text-lg font-semibold text-foreground">{account.account_name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-semibold">Category</p>
              <Badge variant="outline" className="text-sm">{account.category}</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-semibold">Current Balance</p>
              <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                {account.current_balance >= 0 ? 
                  <TrendingUp className="h-5 w-5 text-success" /> : 
                  <TrendingDown className="h-5 w-5 text-destructive" />
                }
                {formatCurrency(Math.abs(account.current_balance))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card border-0">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground font-semibold mb-2">Total Transactions</p>
            <p className="text-3xl font-bold text-foreground">{accountTransactions.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground font-semibold mb-2">Total Debits</p>
            <p className="text-xl font-bold text-success">{formatCurrency(totalDebits)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-0">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground font-semibold mb-2">Total Credits</p>
            <p className="text-xl font-bold text-info">{formatCurrency(totalCredits)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-card border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-primary" />
            Filter Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date-filter" className="text-sm font-semibold text-foreground">From Date</Label>
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>
            <div>
              <Label htmlFor="search-filter" className="text-sm font-semibold text-foreground">Search Description</Label>
              <Input
                id="search-filter"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search transactions..."
                className="mt-1.5 h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="shadow-elevated border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-primary" />
            Transaction History ({transactionsWithBalance.length} transactions)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsWithBalance.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions found for this account</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="text-left py-4 px-3 font-bold text-muted-foreground">Date</th>
                    <th className="text-left py-4 px-3 font-bold text-muted-foreground">Reference</th>
                    <th className="text-left py-4 px-3 font-bold text-muted-foreground">Description</th>
                    <th className="text-right py-4 px-3 font-bold text-muted-foreground">Debit</th>
                    <th className="text-right py-4 px-3 font-bold text-muted-foreground">Credit</th>
                    <th className="text-right py-4 px-3 font-bold text-muted-foreground">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionsWithBalance.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="py-4 px-3 text-foreground">
                        {formatDate(transaction.transaction_date)}
                      </td>
                      <td className="py-4 px-3">
                        <Badge variant="outline" className="font-mono text-xs">
                          {transaction.reference_number}
                        </Badge>
                      </td>
                      <td className="py-4 px-3 text-foreground max-w-xs">
                        <p className="truncate">{transaction.description}</p>
                      </td>
                      <td className="py-4 px-3 text-right font-mono">
                        {transaction.accountLine.debit_amount > 0 ? (
                          <span className="text-success font-semibold">
                            {formatCurrency(transaction.accountLine.debit_amount)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-4 px-3 text-right font-mono">
                        {transaction.accountLine.credit_amount > 0 ? (
                          <span className="text-info font-semibold">
                            {formatCurrency(transaction.accountLine.credit_amount)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-4 px-3 text-right font-mono">
                        <span className={`font-bold ${
                          transaction.runningBalance >= 0 ? 'text-foreground' : 'text-destructive'
                        }`}>
                          {formatCurrency(Math.abs(transaction.runningBalance))}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}