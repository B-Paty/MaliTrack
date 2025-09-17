/**
 * DashboardOverview - Clean Shadcn Style
 * Professional dashboard with minimal colors and clean design
 * - Simple header with user greeting
 * - Clean metrics cards without excessive colors
 * - Minimal quick actions
 * - Professional recent activities list
 */
import { 
  TrendingUp, 
  TrendingDown,
  CreditCard, 
  Users,
  FileText,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight,
  Receipt,
  PieChart,
  Banknote
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMemo } from "react";
import { useFilteredAccounts } from "@/hooks/useFilteredAccounts";
import { useFilteredTransactions } from "@/hooks/useFilteredTransactions";
import { useMajorClients } from "@/hooks/useMajorClients";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export default function DashboardOverview() {
  const { accounts, loading: accountsLoading } = useFilteredAccounts();
  const { transactions, loading: transactionsLoading } = useFilteredTransactions();
  const { clients, loading: clientsLoading } = useMajorClients();

  const accountByCode = useMemo(() => {
    const map: Record<string, { category: string; normal_balance: 'debit' | 'credit' }> = {};
    accounts.forEach(acc => {
      map[acc.account_code] = { category: acc.category, normal_balance: acc.normal_balance };
    });
    return map;
  }, [accounts]);

  const now = useMemo(() => new Date(), []);
  const startOfThisMonth = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1), [now]);

  const isInRange = (dateStr: string, start: Date, end: Date) => {
    const d = new Date(dateStr);
    return d >= start && d <= end;
  };

  const { totalRevenue, totalExpenses, revenueMoM, expensesMoM, revenueThisMonth, invoicesCountThisMonth } = useMemo(() => {
    // Totals from filtered period
    const revenueAccounts = accounts.filter(acc => acc.category === 'Revenue');
    const expenseAccounts = accounts.filter(acc => acc.category === 'Expense');

    const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + Math.abs(acc.current_balance), 0);
    const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + Math.abs(acc.current_balance), 0);

    // MoM calculations
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    let revenueThis = 0, revenuePrev = 0;
    let expensesThis = 0, expensesPrev = 0;
    let revenueThisMonth = 0;

    transactions.forEach(tx => {
      const inThis = isInRange(tx.transaction_date, startOfThisMonth, now);
      const inPrev = isInRange(tx.transaction_date, startOfPrevMonth, endOfPrevMonth);

      tx.lines.forEach(line => {
        const meta = accountByCode[line.account_code];
        if (!meta) return;
        if (meta.category === 'Revenue') {
          const delta = (line.credit_amount || 0) - (line.debit_amount || 0);
          if (inThis) { revenueThis += delta; revenueThisMonth += delta; }
          if (inPrev) revenuePrev += delta;
        } else if (meta.category === 'Expense') {
          const delta = (line.debit_amount || 0) - (line.credit_amount || 0);
          if (inThis) expensesThis += delta;
          if (inPrev) expensesPrev += delta;
        }
      });
    });

    const pct = (current: number, prev: number) => {
      if (!isFinite(prev) || Math.abs(prev) < 1e-9) return 0;
      return ((current - prev) / prev) * 100;
    };

    // Use filtered transactions count for activity
    const invoicesCountThisMonth = transactions.length;

    return {
      totalRevenue,
      totalExpenses,
      revenueMoM: pct(revenueThis, revenuePrev),
      expensesMoM: pct(expensesThis, expensesPrev),
      revenueThisMonth: totalRevenue, // For the selected period
      invoicesCountThisMonth
    };
  }, [accounts, transactions, accountByCode, now, startOfThisMonth]);

  const fmtPct = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  const stats = [
    {
      title: "Total Revenue",
      value: accountsLoading ? "—" : formatCurrency(totalRevenue),
      change: transactionsLoading ? "—" : fmtPct(revenueMoM),
      trend: revenueMoM >= 0 ? "up" : "down",
      icon: Banknote
    },
    {
      title: "Active Clients",
      value: clientsLoading ? "—" : String(clients.length),
      change: "+0.0%",
      trend: "up", 
      icon: Users
    },
    {
      title: "Pending Invoices",
      value: String(invoicesCountThisMonth),
      change: "0.0%",
      trend: "down",
      icon: FileText
    },
    {
      title: "Expenses",
      value: accountsLoading ? "—" : formatCurrency(totalExpenses),
      change: transactionsLoading ? "—" : fmtPct(expensesMoM),
      trend: expensesMoM >= 0 ? "up" : "down",
      icon: CreditCard
    }
  ];

  const recentActivities = useMemo(() => {
    const items = transactions
      .slice()
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
      .slice(0, 5)
      .map(tx => {
        // Calculate total transaction amount (total debits should equal total credits)
        const totalDebits = tx.lines.reduce((s, l) => s + (l.debit_amount || 0), 0);
        return {
          type: 'journal',
          description: tx.description || `Transaction ${tx.reference_number}`,
          amount: formatCurrency(totalDebits),
          time: new Date(tx.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          status: 'completed' as const,
        };
      });
    return items;
  }, [transactions]);

  const navigateTo = (moduleId: string) => {
    window.dispatchEvent(new CustomEvent('qsa:navigate-module', { detail: moduleId }));
  };

  return (
    <div className="flex-1 space-y-4 p-3 sm:p-4 md:p-8 pt-4 sm:pt-6 w-full min-w-0">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Welcome back, Administrator</h2>
          <p className="text-sm text-muted-foreground">Here's your business update</p>
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
            <AvatarFallback className="text-xs">A</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Clean Metrics Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === "up";
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          const isLoading = stat.value === "—";
          
          return (
            <Card key={index} className="p-3 sm:p-4">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-0">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <div className="text-lg sm:text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-6 w-16 sm:h-8 sm:w-20 bg-muted rounded animate-pulse"></div>
                  ) : (
                    stat.value
                  )}
                </div>
                {!isLoading && (
                  <p className="text-xs text-muted-foreground">
                    <span className={cn(
                      isPositive ? "text-green-600" : "text-red-600"
                    )}>
                      {stat.change}
                    </span>
                    <span className="ml-1">from last month</span>
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-4 lg:grid lg:gap-4 lg:grid-cols-7 lg:space-y-0">
        {/* Quick Actions */}
        <Card className="w-full lg:col-span-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Frequently used features for efficient workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full">
              {[
                { label: "Invoices", icon: Receipt, action: "invoices" },
                { label: "Journal", icon: FileText, action: "journal-entry" },
                { label: "Reports", icon: PieChart, action: "financial-statements" }
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-12 sm:h-16 flex-col gap-1 sm:gap-2 hover:bg-transparent hover:text-foreground w-full"
                    onClick={() => navigateTo(action.action)}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="w-full lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base truncate">Recent Activities</CardTitle>
                <CardDescription className="text-xs truncate">Latest transactions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs flex-shrink-0">
                View all
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2 sm:space-y-3">
              {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center w-full min-w-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-xs font-medium leading-none truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-2 w-2 mr-1 flex-shrink-0" />
                      <span className="truncate">{activity.time}</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs font-medium">{activity.amount}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-4">
                  <Activity className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No recent activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}