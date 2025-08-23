import { useState } from "react";
import { 
  Calculator, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Settings,
  ChevronLeft,
  Building2,
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

// Group type for menu organization
type MenuGroup = {
  label: string;
  items: Array<{
    id: string;
    label: string;
    icon: any;
  }>;
};

const menuGroups: MenuGroup[] = [
  {
    label: "Core Accounting",
    items: [
      { id: 'chart-of-accounts', label: 'Chart of Accounts', icon: Calculator },
      { id: 'journal-entry', label: 'Journal Entry', icon: PlusCircle },
    ]
  },
  {
    label: "Reports & Analysis",
    items: [
      { id: 'trial-balance', label: 'Trial Balance', icon: BarChart3 },
      { id: 'financial-statements', label: 'Financial Statements', icon: TrendingUp },
    ]
  },
  {
    label: "Settings & Configuration",
    items: [
      { id: 'tax-settings', label: 'Tax Settings', icon: FileText },
      { id: 'company-settings', label: 'Company Settings', icon: Settings },
    ]
  }
];

export default function Sidebar({ isOpen, onClose, activeModule, onModuleChange }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:top-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:z-auto shadow-elevated",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Modules</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="lg:hidden"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-2 px-3">
            <div className="space-y-4">
              {menuGroups.map((group, index) => (
                <div key={index} className="space-y-1">
                  <div className="px-2 mb-1">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{group.label}</h3>
                  </div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeModule === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-2 h-9 px-2 text-sm transition-all duration-200",
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-glow" 
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                        onClick={() => {
                          onModuleChange(item.id);
                          // Close sidebar on mobile after selection
                          if (window.innerWidth < 1024) {
                            onClose();
                          }
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                      </Button>
                    );
                  })}
                </div>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="bg-gradient-secondary rounded-lg p-3">
              <p className="text-sm font-medium text-foreground mb-1">QSA Solutions</p>
              <p className="text-xs text-muted-foreground">Professional Accounting System</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}