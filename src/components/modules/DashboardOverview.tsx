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

export default function DashboardOverview() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1%",
      trend: "up",
      icon: DollarSign,
      color: "text-primary"
    },
    {
      title: "Active Clients",
      value: "2,350",
      change: "+180.1%",
      trend: "up", 
      icon: Users,
      color: "text-success"
    },
    {
      title: "Pending Invoices",
      value: "12",
      change: "-19%",
      trend: "down",
      icon: FileText,
      color: "text-warning"
    },
    {
      title: "Expenses",
      value: "$3,456.89",
      change: "+2.5%",
      trend: "up",
      icon: CreditCard,
      color: "text-muted-foreground"
    }
  ];

  const recentActivities = [
    {
      type: "payment",
      description: "Payment received from Acme Corp",
      amount: "$2,500.00",
      time: "2 hours ago",
      status: "completed"
    },
    {
      type: "invoice",
      description: "Invoice #INV-001 sent to Tech Solutions",
      amount: "$1,200.00",
      time: "4 hours ago",
      status: "pending"
    },
    {
      type: "expense",
      description: "Office supplies expense recorded",
      amount: "$156.50",
      time: "6 hours ago",
      status: "completed"
    },
    {
      type: "journal",
      description: "Journal entry for monthly depreciation",
      amount: "$500.00",
      time: "1 day ago",
      status: "completed"
    }
  ];

  const quickActions = [
    { label: "Create Invoice", icon: FileText, action: "invoices" },
    { label: "Add Transaction", icon: CreditCard, action: "journal-entry" },
    { label: "View Reports", icon: TrendingUp, action: "financial-statements" },
    { label: "Manage Accounts", icon: Activity, action: "chart-of-accounts" }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-card rounded-2xl p-8 border border-primary/10 shadow-premium">
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
            <Card key={index} className="bg-brand-white border-primary/10 shadow-card hover:shadow-elevated transition-smooth rounded-xl">
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
        <Card className="bg-brand-white border-primary/10 shadow-card rounded-xl">
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
                >
                  <Icon className="mr-3 h-5 w-5 text-primary" />
                  <span className="font-medium">{action.label}</span>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="bg-brand-white border-primary/10 shadow-card rounded-xl">
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
                    {activity.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-warning" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{activity.amount}</p>
                  <Badge 
                    variant={activity.status === "completed" ? "default" : "secondary"}
                    className={activity.status === "completed" ? "bg-success text-success-foreground" : ""}
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
              <span className="font-medium text-foreground">Revenue Goal</span>
              <span className="text-primary font-bold">$45,231 / $50,000</span>
            </div>
            <Progress value={90} className="h-3" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">Client Acquisition</span>
              <span className="text-primary font-bold">23 / 25</span>
            </div>
            <Progress value={92} className="h-3" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">Invoice Processing</span>
              <span className="text-primary font-bold">156 / 200</span>
            </div>
            <Progress value={78} className="h-3" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}