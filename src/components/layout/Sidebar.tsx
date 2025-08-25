import { useState } from "react";
import { 
  Calculator, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Settings,
  ChevronLeft,
  Building2,
  PlusCircle,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    label: "Overview",
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    ]
  },
  {
    label: "Core Accounting",
    items: [
      { id: 'chart-of-accounts', label: 'Chart of Accounts', icon: Calculator },
      { id: 'journal-entry', label: 'Journal Entry', icon: PlusCircle },
    ]
  },
  {
    label: "Business Operations",
    items: [
      { id: 'invoices', label: 'Invoices', icon: FileText },
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
      { id: 'tax-settings', label: 'Tax Settings', icon: Settings },
      { id: 'company-settings', label: 'Company Settings', icon: Building2 },
    ]
  }
];

export default function Sidebar({ isOpen, onClose, activeModule, onModuleChange }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 bg-brand-white border-r border-primary/10 z-50 transform transition-smooth duration-300 ease-in-out lg:relative lg:top-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:z-auto shadow-premium",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-brand-white" />
                </div>
                <span className="font-bold text-primary text-lg">Navigation</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="lg:hidden text-muted-foreground hover:text-primary hover:bg-primary/5"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-6 pb-24">
              {menuGroups.map((group, index) => (
                <div key={index} className="space-y-2">
                  <div className="px-3 mb-3">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-primary/20 pb-1">{group.label}</h3>
                  </div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeModule === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 h-11 px-3 text-sm font-medium transition-fast rounded-xl",
                          isActive 
                            ? "bg-gradient-primary text-brand-white shadow-glow-strong hover:bg-gradient-primary" 
                            : "text-muted-foreground hover:text-primary hover:bg-primary/5 hover:shadow-card"
                        )}
                        onClick={() => {
                          onModuleChange(item.id);
                          // Close sidebar on mobile after selection
                          if (window.innerWidth < 1024) {
                            onClose();
                          }
                        }}
                      >
                        <Icon className={cn("h-5 w-5", isActive ? "text-brand-white" : "text-primary")} />
                        <span>{item.label}</span>
                      </Button>
                    );
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-primary/10">
            <div className="bg-gradient-accent rounded-xl p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Building2 className="h-3 w-3 text-brand-white" />
                </div>
                <p className="text-sm font-bold text-primary">QSA Solutions</p>
              </div>
              <p className="text-xs text-muted-foreground font-medium">Premium Accounting Suite</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}