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

const menuItems = [
  { id: 'chart-of-accounts', label: 'Chart of Accounts', icon: Calculator },
  { id: 'journal-entry', label: 'Journal Entry', icon: PlusCircle },
  { id: 'trial-balance', label: 'Trial Balance', icon: BarChart3 },
  { id: 'financial-statements', label: 'Financial Statements', icon: TrendingUp },
  { id: 'company-settings', label: 'Company Settings', icon: Settings },
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
          "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:top-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:z-auto shadow-elevated",
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
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-11 transition-all duration-200",
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
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                );
              })}
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