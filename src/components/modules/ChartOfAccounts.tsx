
import { useState, useMemo } from "react";
import { Search, Filter, Plus } from "lucide-react";
import AccountDetails from "./AccountDetails";
import CreateAccountModal from "./CreateAccountModal";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccounts, type Account } from "@/hooks/useAccounts";
import { formatCurrency, getCategoryOrder } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import ExportButtons from "@/components/exports/ExportButtons";
import { TransactionExportButton } from "@/components/exports/TransactionExportButton";

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { accounts, loading, error, fetchAccounts } = useAccounts();

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
    <div className="space-y-6 max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Chart of Accounts</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your company's account structure and balances</p>
        </div>
        
        {/* Action Buttons - Responsive Layout */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {/* Primary Action - Add Account */}
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="gap-2 bg-gradient-primary hover:shadow-glow transition-all w-full sm:w-auto order-1"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="sm:hidden">Add Account</span>
            <span className="hidden sm:inline">Add Account</span>
          </Button>
          
          {/* Secondary Actions - Export Buttons */}
          <div className="flex gap-2 order-2">
            <div className="flex-1 sm:flex-none">
              <ExportButtons reportTitle="Chart of Accounts" />
            </div>
            <div className="flex-1 sm:flex-none">
              <TransactionExportButton />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="p-4 md:p-6">
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



      {/* Empty State */}
      {accounts.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No accounts yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first account to get started with your Chart of Accounts
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="gap-2 bg-gradient-primary hover:shadow-glow transition-all w-full sm:w-auto"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Create First Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts Table */}
      {accounts.length > 0 && (
        <div className="space-y-6">
          {categories
            .filter(category => groupedAccounts[category])
            .map(category => (
            <Card key={category} className="shadow-card">
              <CardHeader className="pb-2 md:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg font-semibold">
                    {category}
                  </CardTitle>
                  <div className="text-right text-sm md:text-base text-muted-foreground">
                    <span className="mr-2">Total:</span>
                    <span className="font-bold text-foreground font-mono">{formatCurrency(totalsByCategory[category] || 0)}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-2 md:p-3">
                <div className="space-y-2">
                  {groupedAccounts[category]?.map((account) => (
                    <div
                      key={account.account_code}
                      className="grid grid-cols-3 items-center p-3 rounded-lg bg-muted/20 hover:bg-accent/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedAccount(account)}
                    >
                      {/* Left column: stacked code + name */}
                      <div className="pr-3">
                        <div className="font-mono text-sm font-semibold text-primary">{account.account_code}</div>
                        <div className="text-foreground font-medium leading-tight">{account.account_name}</div>
                      </div>
                      {/* Center column: normal balance as plain text */}
                      <div className="text-center text-sm text-muted-foreground">
                        {account.normal_balance}
                      </div>
                      {/* Right column: amount bold and right aligned */}
                      <div className="text-right font-mono font-semibold text-foreground">
                        {formatCurrency(account.current_balance)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // Refresh accounts list after successful creation
          fetchAccounts();
        }}
      />
    </div>
  );
}
