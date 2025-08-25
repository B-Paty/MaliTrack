/**
 * Header
 * Top bar with sidebar toggle, settings button, and company name.
 */
import { Menu, Settings, TrendingUp, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsDialog } from "./SettingsDialog";
import { useAuth } from "@/components/auth/AuthProvider";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onToggleSidebar: () => void;
  companyName: string;
}

export default function Header({ onToggleSidebar, companyName }: HeaderProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
              <User className="h-4 w-4" />
              <span className="hidden md:inline font-medium">{user?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}