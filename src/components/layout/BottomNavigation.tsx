import { 
  Home, 
  Calculator, 
  PlusCircle, 
  FileText,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const quickAccessItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'journal-entry', label: 'Journal', icon: PlusCircle },
  { id: 'invoices', label: 'Invoices', icon: FileText },
  { id: 'chart-of-accounts', label: 'Accounts', icon: Calculator },
  { id: 'company-settings', label: 'Settings', icon: Settings },
];

export default function BottomNavigation({ activeModule, onModuleChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {quickAccessItems.map(item => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onModuleChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-1 min-w-0 flex-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="text-xs truncate">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
