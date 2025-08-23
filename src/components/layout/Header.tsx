import { Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onToggleSidebar: () => void;
  companyName: string;
}

export default function Header({ onToggleSidebar, companyName }: HeaderProps) {
  return (
    <header className="h-16 bg-gradient-header border-b border-primary/20 flex items-center justify-between px-4 lg:px-6 shadow-elevated">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="text-primary-foreground hover:bg-primary-hover/20 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">Q</span>
          </div>
          <div>
            <h1 className="text-primary-foreground font-bold text-xl">{companyName}</h1>
            <p className="text-primary-foreground/80 text-sm">Accounting System</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-hover/20">
          <Settings className="h-5 w-5" />
        </Button>
        
        <div className="hidden md:flex items-center gap-2 text-primary-foreground/90 text-sm">
          <span>Welcome back!</span>
          <span className="font-medium">Administrator</span>
        </div>
      </div>
    </header>
  );
}