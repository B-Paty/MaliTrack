import { CalendarIcon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDateRange } from "@/contexts/DateRangeContext";
import { Badge } from "@/components/ui/badge";

interface DateRangePickerProps {
  title?: string;
  showCard?: boolean;
}

export function DateRangePicker({ title = "Date Range Filter", showCard = true }: DateRangePickerProps) {
  const { dateRange, setDateRange, resetToDefault } = useDateRange();

  const handleStartDateChange = (value: string) => {
    setDateRange({ ...dateRange, startDate: value });
  };

  const handleEndDateChange = (value: string) => {
    setDateRange({ ...dateRange, endDate: value });
  };

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Current Period</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {new Date(dateRange.startDate).toLocaleDateString()} - {new Date(dateRange.endDate).toLocaleDateString()}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="start-date" className="text-sm font-semibold">From Date</Label>
          <Input
            id="start-date"
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="mt-1.5"
          />
        </div>
        
        <div>
          <Label htmlFor="end-date" className="text-sm font-semibold">To Date</Label>
          <Input
            id="end-date"
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="mt-1.5"
          />
        </div>
        
        <div className="flex items-end">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefault}
            className="gap-2 h-10"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
        </div>
      </div>
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card className="shadow-card border-primary/10">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarIcon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}