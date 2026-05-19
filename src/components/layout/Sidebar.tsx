/**
 * Sidebar
 * Left navigation grouped by module categories.
 * - Collapsible on mobile
 * - Highlights active module and calls onModuleChange
 */
import { useState, useEffect } from "react";
import { 
  Calculator, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Settings,
  ChevronLeft,
  Building2,
  PlusCircle,
  Sparkles,
  Shield,
  UserCheck,
  Search,
  Package,
  ShoppingCart,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    icon: React.ComponentType<{ className?: string }>;
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
      { id: 'major-client', label: 'Major Client', icon: UserCheck },
      { id: 'invoices', label: 'Invoices', icon: FileText },
      { id: 'sales-module', label: 'Sales Module', icon: ShoppingCart },
      { id: 'inventory-management', label: 'Inventory Management', icon: Package },
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
  },
  {
    label: "Security & Monitoring",
    items: [
      { id: 'security', label: 'Security Dashboard', icon: Shield },
    ]
  },
  {
    label: "Support",
    items: [
      { id: 'help', label: 'Help & Support', icon: HelpCircle },
    ]
  }
];

export default function Sidebar({ isOpen, onClose, activeModule, onModuleChange }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);
  
  const filteredMenuGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/20 backdrop-blur-sm"
          onClick={onClose}
          style={{ 
            overscrollBehavior: 'contain',
            touchAction: 'none'
          }}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 h-[calc(100vh-4rem)] w-72 bg-background z-50 transition-transform duration-300 ease-in-out overflow-hidden overscroll-contain shadow-elevated backdrop-blur-sm rounded-tr-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ 
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
          left: '0px',
          marginLeft: '0px',
          paddingLeft: '0px',
          borderTopRightRadius: '1rem',
          borderBottomRightRadius: '0px',
          borderTopLeftRadius: '0px',
          borderBottomLeftRadius: '0px'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-primary/10">
            <div className="flex items-center justify-between mb-4">
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
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4 overscroll-contain">
            <div
              className="space-y-6 pb-24 overscroll-none"
              style={{ 
                overscrollBehavior: 'contain',
                touchAction: 'pan-y'
              }}
            >
              {filteredMenuGroups.map((group, index) => (
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

          {/* Footer - Hidden on mobile */}
          <div className="p-4 border-t border-primary/10 hidden lg:block">
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