/**
 * Period Closing Dialog
 * Allows users to close accounting periods (monthly/quarterly)
 */
import { useState, useMemo } from 'react';
import { Calendar, CheckCircle2, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePeriodClosing } from '@/hooks/usePeriodClosing';
import { useFilteredAccounts } from '@/hooks/useFilteredAccounts';
import { formatCurrency } from '@/lib/formatters';

export function PeriodClosingDialog() {
  const [open, setOpen] = useState(false);
  const [periodType, setPeriodType] = useState<'monthly' | 'quarterly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState('');
  const { closePeriod, loading, closings } = usePeriodClosing();
  const { accounts } = useFilteredAccounts();

  const netIncome = useMemo(() => {
    const revenue = accounts.filter(acc => acc.category === 'Revenue');
    const expenses = accounts.filter(acc => acc.category === 'Expense');
    const totalRevenue = revenue.reduce((sum, acc) => sum + Math.abs(acc.current_balance), 0);
    const totalExpenses = expenses.reduce((sum, acc) => sum + Math.abs(acc.current_balance), 0);
    return totalRevenue - totalExpenses;
  }, [accounts]);

  const getMonthOptions = () => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      months.push({
        value: monthStr,
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      });
    }
    return months;
  };

  const handleClose = async () => {
    if (!selectedMonth) return;

    const [year, month] = selectedMonth.split('-').map(Number);
    const periodStart = new Date(year, month - 1, 1).toISOString().split('T')[0];
    
    let periodEnd: string;
    if (periodType === 'monthly') {
      periodEnd = new Date(year, month, 0).toISOString().split('T')[0];
    } else {
      // Quarterly: end at the end of the 3rd month
      const quarterEndMonth = Math.ceil(month / 3) * 3;
      periodEnd = new Date(year, quarterEndMonth, 0).toISOString().split('T')[0];
    }

    await closePeriod(periodType, periodStart, periodEnd, netIncome);
    setOpen(false);
  };

  const isMonthClosed = (monthStr: string) => {
    return closings.some(c => c.period_end.startsWith(monthStr) && c.is_closed);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Lock className="h-4 w-4" />
          Close Period
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Close Accounting Period
          </DialogTitle>
          <DialogDescription>
            Lock your books for a specific period. This helps maintain data integrity.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="period-type">Period Type</Label>
            <Select value={periodType} onValueChange={(v: any) => setPeriodType(v)}>
              <SelectTrigger id="period-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period-month">Select Period</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="period-month">
                <SelectValue placeholder="Choose a month" />
              </SelectTrigger>
              <SelectContent>
                {getMonthOptions().map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    disabled={isMonthClosed(option.value)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      {isMonthClosed(option.value) && (
                        <Badge variant="secondary" className="ml-2">Closed</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Net Income for Period</span>
                  <span className={`text-sm font-semibold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(netIncome))}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Once closed, transactions in this period cannot be modified.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleClose} 
            disabled={!selectedMonth || loading}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {loading ? 'Closing...' : 'Close Period'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
