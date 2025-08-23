import { useState } from "react";
import { Moon, Sun, Monitor, Palette, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTheme } from "./ThemeProvider";

interface SettingsDialogProps {
  children: React.ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const themes = [
    {
      name: "Light",
      value: "light" as const,
      icon: Sun,
      description: "Light mode",
    },
    {
      name: "Dark",
      value: "dark" as const,
      icon: Moon,
      description: "Dark mode",
    },
    {
      name: "System",
      value: "system" as const,
      icon: Monitor,
      description: "System preference",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Settings
          </DialogTitle>
          <DialogDescription>
            Customize your experience with QSA Accounting System.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Palette className="h-4 w-4" />
              Theme Preference
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                return (
                  <Button
                    key={themeOption.value}
                    variant={theme === themeOption.value ? "default" : "outline"}
                    className="justify-start h-12"
                    onClick={() => setTheme(themeOption.value)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{themeOption.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {themeOption.description}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}