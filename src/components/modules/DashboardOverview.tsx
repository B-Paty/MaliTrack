/**
 * DashboardOverview
 * Shows top-level business metrics and shortcuts.
 * - Stats: totals from accounts + MoM from transactions
 * - Quick Actions: dispatch navigation events to switch modules
 * - Recent Activities: latest transactions
 * - Monthly Progress: this month's revenue and activity count
 */
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Users,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/formatters";

export default function DashboardOverview() {
  const { accounts, loading: accountsLoading } = useAccounts();
  const { transactions, loading: transactionsLoading } = useTransactions();

  const accountByCode = useMemo(() => {
    const map: Record<string, { category: string; normal_balance: 'debit' | 'credit' }> = {};
    accounts.forEach(acc => {
      map[acc.account_code] = { category: acc.category, normal_balance: acc.normal_balance } as any;
    });
    return map;
  }, [accounts]);

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const isInRange = (dateStr: string, start: Date, end: Date) => {
    const d = new Date(dateStr);
    return d >= start && d <= end;
  };

  const { totalRevenue, totalExpenses, revenueMoM, expensesMoM, revenueThisMonth, invoicesCountThisMonth } = useMemo(() => {
    // Totals
    const revenueAccounts = accounts.filter(acc => acc.category === 'Revenue');
    const expenseAccounts = accounts.filter(acc => acc.category === 'Expense');

    const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + acc.current_balance, 0);
    const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + acc.current_balance, 0);

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

    // Invoices are local-only; approximate using count of transactions this month as activity
    const invoicesCountThisMonth = transactions.filter(tx => isInRange(tx.transaction_date, startOfThisMonth, now)).length;

    return {
      totalRevenue,
      totalExpenses,
      revenueMoM: pct(revenueThis, revenuePrev),
      expensesMoM: pct(expensesThis, expensesPrev),
      revenueThisMonth,
      invoicesCountThisMonth
    };
  }, [accounts, transactions, accountByCode, now]);

  const fmtPct = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  const stats = [
    {
      title: "Total Revenue",
      value: accountsLoading ? "—" : formatCurrency(totalRevenue),
      change: transactionsLoading ? "—" : fmtPct(revenueMoM),
      trend: revenueMoM >= 0 ? "up" : "down",
      icon: DollarSign,
      color: "text-primary"
    },
    {
      title: "Active Clients",
      value: "—",
      change: "+0.0%",
      trend: "up", 
      icon: Users,
      color: "text-success"
    },
    {
      title: "Pending Invoices",
      value: String(invoicesCountThisMonth),
      change: "0.0%",
      trend: "down",
      icon: FileText,
      color: "text-warning"
    },
    {
      title: "Expenses",
      value: accountsLoading ? "—" : formatCurrency(totalExpenses),
      change: transactionsLoading ? "—" : fmtPct(expensesMoM),
      trend: expensesMoM >= 0 ? "up" : "down",
      icon: CreditCard,
      color: "text-muted-foreground"
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

  const quickActions = [
    { label: "Create Invoice", icon: FileText, action: "invoices" },
    { label: "Add Transaction", icon: CreditCard, action: "journal-entry" },
    { label: "View Reports", icon: TrendingUp, action: "financial-statements" },
    { label: "Manage Accounts", icon: Activity, action: "chart-of-accounts" }
  ];

  const navigateTo = (moduleId: string) => {
    window.dispatchEvent(new CustomEvent('qsa:navigate-module', { detail: moduleId }));
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-secondary rounded-2xl p-8 border border-primary/10 shadow-premium">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Welcome back, Administrator</h1>
            <p className="text-muted-foreground text-lg">Here's what's happening with your business today.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
          
          return (
            <Card key={index} className="bg-card border-primary/10 shadow-card hover:shadow-elevated transition-smooth rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="flex items-center text-sm">
                  <TrendIcon className={`mr-1 h-4 w-4 ${
                    stat.trend === "up" ? "text-success" : "text-destructive"
                  }`} />
                  <span className={`font-medium ${
                    stat.trend === "up" ? "text-success" : "text-destructive"
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="bg-card border-primary/10 shadow-card rounded-xl">
          <CardHeader>
            <CardTitle className="text-primary font-bold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Frequently used features for efficient workflow</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="justify-start h-12 text-left hover:bg-primary/5 hover:text-primary transition-fast rounded-xl border border-transparent hover:border-primary/20"
                  onClick={() => navigateTo(action.action)}
                >
                  <Icon className="mr-3 h-5 w-5 text-primary" />
                  <span className="font-medium">{action.label}</span>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="bg-card border-primary/10 shadow-card rounded-xl">
          <CardHeader>
            <CardTitle className="text-primary font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest transactions and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gradient-accent border border-primary/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{activity.amount}</p>
                  <Badge 
                    variant={"default"}
                    className={"bg-success text-success-foreground"}
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Progress */}
      <Card className="bg-brand-white border-primary/10 shadow-card rounded-xl">
        <CardHeader>
          <CardTitle className="text-primary font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Progress
          </CardTitle>
          <CardDescription>Track your business goals and achievements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">Revenue This Month</span>
              <span className="text-primary font-bold">{formatCurrency(revenueThisMonth)}</span>
            </div>
            <Progress value={Math.min(100, Math.max(0, (revenueThisMonth / Math.max(1, totalRevenue)) * 100))} className="h-3" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">Transactions Created</span>
              <span className="text-primary font-bold">{invoicesCountThisMonth}</span>
            </div>
            <Progress value={Math.min(100, invoicesCountThisMonth * 5)} className="h-3" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}