/**
 * Header
 * Top bar with sidebar toggle, settings button, and company name.
 */
import { Menu, Settings, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsDialog } from "./SettingsDialog";

interface HeaderProps {
  onToggleSidebar: () => void;
  companyName: string;
}

export default function Header({ onToggleSidebar, companyName }: HeaderProps) {
  return (
    <header className="h-16 bg-brand-white border-b border-primary/10 flex items-center justify-between px-4 lg:px-6 shadow-elevated backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-primary hover:bg-primary/5 hover:text-primary lg:hidden transition-fast"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <TrendingUp className="text-brand-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-primary font-bold text-xl tracking-tight">{companyName}</h1>
            <p className="text-muted-foreground text-sm font-medium">Modern Accounting Suite</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SettingsDialog>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-fast"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </SettingsDialog>
        
        <div className="hidden md:flex items-center gap-3 text-muted-foreground text-sm">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="font-medium text-foreground">Administrator</span>
        </div>
      </div>
    </header>
  );
}