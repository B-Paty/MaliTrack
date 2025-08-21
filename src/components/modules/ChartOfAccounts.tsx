import { useState, useMemo } from "react";
import { Search, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { chartOfAccounts, getCategoryOrder, formatCurrency, type Account } from "@/data/chartOfAccounts";
import { cn } from "@/lib/utils";

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

  const categories = Array.from(new Set(chartOfAccounts.map(account => account.category)))
    .sort((a, b) => getCategoryOrder(a) - getCategoryOrder(b));

  const filteredAccounts = useMemo(() => {
    return chartOfAccounts
      .filter(account => {
        const matchesSearch = 
          account.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.accountName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "" || account.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => a.accountCode.localeCompare(b.accountCode));
  }, [searchTerm, selectedCategory]);

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
      totals[category] = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
    });
    return totals;
  }, [groupedAccounts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chart of Accounts</h1>
          <p className="text-muted-foreground">Manage your company's account structure and balances</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
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
                          key={account.accountCode}
                          className={cn(
                            "border-b border-border/50 hover:bg-accent/50 transition-colors",
                            index % 2 === 0 ? "bg-transparent" : "bg-muted/30"
                          )}
                        >
                          <td className="py-3 px-4">
                            <span className="font-mono font-semibold text-primary">
                              {account.accountCode}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-foreground">
                              {account.accountName}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={cn(
                              "font-semibold",
                              account.currentBalance > 0 ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {formatCurrency(account.currentBalance)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={account.normalBalance === 'debit' ? 'secondary' : 'outline'}>
                              {account.normalBalance}
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