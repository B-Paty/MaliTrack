/**
 * Enhanced Header Component
 * Professional header with company branding, logo, and user controls
 */

import React from "react";
import {
  Menu, TrendingUp, LogOut, User, Moon, Sun,
  Building2, Sparkles, Settings, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "./ThemeProvider";
import { useEnhancedCompanySettings } from "@/hooks/useEnhancedCompanySettings";
import { cn } from "@/lib/utils";

interface EnhancedHeaderProps {
  onToggleSidebar: () => void;
  className?: string;
}

export default function EnhancedHeader({ onToggleSidebar, className }: EnhancedHeaderProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { settings, getLogoForContext, fetchSettings, loading } = useEnhancedCompanySettings();

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleTheme = () => {
    // Always toggle between light and dark (skip system)
    const currentTheme = theme === "system" 
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  const companyLogo = getLogoForContext('header');
  const companyName = settings?.company_name || 'MaliTrack';



  const handleRefresh = () => {
    fetchSettings();
  };

  return (
    <header 
      className={cn(
        "h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6 shadow-elevated backdrop-blur-sm sticky top-0 z-50 md:rounded-none rounded-b-2xl",
        className
      )}
      style={{
        paddingTop: 'var(--safe-area-top, 0px)',
      }}
    >
      {/* Left Section: Menu + Company Branding */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden text-muted-foreground hover:text-primary hover:bg-primary/5 transition-fast"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Company Branding */}
        <div className="flex items-center gap-3">
          {/* Company Logo */}
          {companyLogo ? (
            <div className="flex-shrink-0">
              <img
                src={companyLogo}
                alt={`${companyName} Logo`}
                className="h-8 w-auto max-w-[120px] object-contain"
                onError={(e) => {
                  // Fallback to icon if logo fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Fallback Icon (hidden by default) */}
              <div className="hidden h-8 w-8 bg-gradient-primary rounded-lg items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
            </div>
          ) : (
            /* Default Icon when no logo */
            <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
          )}

          {/* Company Name - Desktop Only */}
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold text-foreground">
              {companyName}
            </h1>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground border-border">
                <Sparkles className="h-3 w-3 mr-1" />
                Accounting System
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Controls */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-fast"
        >
          {theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches) 
            ? <Sun className="h-5 w-5" /> 
            : <Moon className="h-5 w-5" />
          }
        </Button>

        {/* Refresh Settings */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={loading}
          className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-fast"
          title="Refresh company settings"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-fast"
            >
              <div className="h-7 w-7 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="hidden md:inline font-medium max-w-32 truncate">
                {user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* User Info */}
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {companyName}
              </p>
            </div>
            
            <DropdownMenuSeparator />
            
            {/* Quick Actions */}
            <DropdownMenuItem>
              <TrendingUp className="mr-2 h-4 w-4" />
              Dashboard
            </DropdownMenuItem>
            
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Sign Out */}
            <DropdownMenuItem 
              onClick={handleSignOut} 
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
