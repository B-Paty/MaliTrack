/**
 * Header
 * Top bar with sidebar toggle, company logo, settings button, and user controls.
 */
import { Menu, Settings, TrendingUp, LogOut, User, Moon, Sun, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsDialog } from "./SettingsDialog";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "./ThemeProvider";
import { useEnhancedCompanySettings } from "@/hooks/useEnhancedCompanySettings";
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
  companyName?: string; // Made optional since we'll get it from the hook
}

export default function Header({ onToggleSidebar, companyName }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { settings, getLogoForContext } = useEnhancedCompanySettings();
  
  // Get company name from settings or fallback to prop
  const displayCompanyName = settings?.company_name || companyName || 'QSA Solutions';
  const companyLogo = getLogoForContext('header');

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6 shadow-elevated backdrop-blur-sm sticky top-0 z-50">
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
          {/* Company Logo */}
          {companyLogo ? (
            <div className="flex-shrink-0">
              <img
                src={companyLogo}
                alt={`${displayCompanyName} Logo`}
                className="h-10 w-auto max-w-[120px] object-contain"
                onError={(e) => {
                  // Fallback to icon if logo fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Fallback Icon (hidden by default) */}
              <div className="hidden h-10 w-10 bg-gradient-primary rounded-xl items-center justify-center shadow-glow">
                <Building2 className="text-white h-5 w-5" />
              </div>
            </div>
          ) : (
            /* Default Icon when no logo */
            <div className="h-10 w-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Building2 className="text-white h-5 w-5" />
            </div>
          )}
          
          <div>
            <h1 className="text-primary font-bold text-xl tracking-tight">{displayCompanyName}</h1>
            <p className="text-muted-foreground text-sm font-medium">Modern Accounting Suite</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-fast"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
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