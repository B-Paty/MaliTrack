
import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import AccountDetails from "./AccountDetails";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccounts, type Account } from "@/hooks/useAccounts";
import { formatCurrency, getCategoryOrder } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import ExportButtons from "@/components/exports/ExportButtons";

/**
 * ChartOfAccounts
 * Displays and manages the list of accounts.
 * - Reads accounts via useAccounts
 * - Allows create/update/delete
 * - Shows balances in Tsh
 */
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

export default function ChartOfAccounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const { accounts, loading, error } = useAccounts();

  const categories = Array.from(new Set(accounts.map(account => account.category)))
    .sort((a, b) => getCategoryOrder(a) - getCategoryOrder(b));

  const filteredAccounts = useMemo(() => {
    return accounts
      .filter(account => {
        const matchesSearch = 
          account.account_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.account_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "" || account.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => a.account_code.localeCompare(b.account_code));
  }, [accounts, searchTerm, selectedCategory]);

  const groupedAccounts = useMemo(() => {
    const grouped: { [key: string]: Account[] } = {};
    filteredAccounts.forEach(account => {
      if (!grouped[account.category]) {
        grouped[account.category] = [];
      }
      grouped[account.category].push(account);
    });
    return grouped;
  }, [filteredAccounts]);

  const totalsByCategory = useMemo(() => {
    const totals: { [key: string]: number } = {};
    Object.entries(groupedAccounts).forEach(([category, accounts]) => {
      totals[category] = accounts.reduce((sum, account) => sum + account.current_balance, 0);
    });
    return totals;
  }, [groupedAccounts]);



  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading accounts...</p>
        </div>
      </div>
    );
  }

  console.log('ChartOfAccounts render - accounts:', accounts.length, 'error:', error);

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

  // Show account details if an account is selected
  if (selectedAccount) {
    return (
      <AccountDetails 
        account={selectedAccount}
        onBack={() => setSelectedAccount(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chart of Accounts</h1>
          <p className="text-muted-foreground">Manage your company's account structure and balances</p>
        </div>
        
        <div className="flex gap-2">
          <ExportButtons reportTitle="Chart of Accounts" />
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts by code or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="sm:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 px-3 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Accounts Table */}
      <div className="space-y-6">
        {categories
          .filter(category => groupedAccounts[category])
          .map(category => (
            <Card key={category} className="shadow-card">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <Badge className={categoryColors[category]}>
                      {category}
                    </Badge>
                    <span className="text-lg">
                      {groupedAccounts[category]?.length || 0} accounts
                    </span>
                  </CardTitle>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Category Total</p>
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(totalsByCategory[category] || 0)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Account Code</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Account Name</th>
                        <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Current Balance</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Normal Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedAccounts[category]?.map((account, index) => (
                        <tr
                          key={account.account_code}
                          className={cn(
                            "border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer",
                            index % 2 === 0 ? "bg-transparent" : "bg-muted/30"
                          )}
                          onClick={() => setSelectedAccount(account)}
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
                              account.current_balance > 0 ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {formatCurrency(account.current_balance)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={account.normal_balance === 'debit' ? 'secondary' : 'outline'}>
                              {account.normal_balance}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
