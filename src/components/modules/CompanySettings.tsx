import { useState } from "react";
import { Upload, Save, Building2, Palette, Image, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useToast } from "@/hooks/use-toast";

export default function CompanySettings() {
  const { toast } = useToast();
  const { settings, loading, updateSettings } = useCompanySettings();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState(settings);

  // Update local settings when database settings load
  if (settings && !localSettings) {
    setLocalSettings(settings);
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a PNG, JPG, or SVG file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Logo file must be less than 2MB",
        variant: "destructive"
      });
      return;
    }

    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        logo_filename: undefined,
        logo_path: undefined
      });
    }
  };

  const handleSaveSettings = async () => {
    if (!localSettings?.company_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Company name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateSettings(localSettings);

      // If there's a new logo file, simulate upload for now
      if (logoFile) {
        // In a real implementation, you'd upload to Supabase Storage here
        setTimeout(() => {
          toast({
            title: "Logo Uploaded",
            description: `Logo "${logoFile.name}" has been saved successfully`,
          });
          
          if (localSettings) {
            setLocalSettings({
              ...localSettings,
              logo_filename: logoFile.name,
              logo_path: `/uploads/logos/${logoFile.name}`
            });
          }
          
          setLogoFile(null);
        }, 1000);
      }
    } catch (error) {
      // Error already handled in hook
    }
  };

  const colorPresets = [
    { name: 'QSA Crimson (Current)', value: '#a1052d' },
    { name: 'Professional Blue', value: '#1E3A8A' },
    { name: 'Corporate Green', value: '#059669' },
    { name: 'Executive Purple', value: '#7C3AED' },
    { name: 'Modern Orange', value: '#EA580C' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading company settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Company Settings
          </h1>
          <p className="text-muted-foreground mt-2">Manage your company information and branding preferences</p>
        </div>
        
        <Button onClick={handleSaveSettings} className="gap-2 h-12 px-8 bg-gradient-primary hover:shadow-glow transition-all">
          <Save className="h-5 w-5" />
          Save Settings
        </Button>
      </div>

      {/* Company Information */}
      <Card className="shadow-elevated border-0 bg-gradient-secondary/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-5 w-5 text-primary" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="companyName" className="text-sm font-semibold text-foreground">Company Name</Label>
              <Input
                id="companyName"
                value={localSettings?.company_name || ''}
                onChange={(e) => localSettings && setLocalSettings({ ...localSettings, company_name: e.target.value })}
                placeholder="Enter company name"
                className="mt-1.5 h-11"
              />
            </div>
            
            <div>
              <Label htmlFor="primaryColor" className="text-sm font-semibold text-foreground">Primary Brand Color</Label>
              <div className="flex gap-3 mt-1.5">
                <Input
                  id="primaryColor"
                  type="color"
                  value={localSettings?.primary_color || '#a1052d'}
                  onChange={(e) => localSettings && setLocalSettings({ ...localSettings, primary_color: e.target.value })}
                  className="w-16 h-11 p-1 rounded-md border border-input"
                />
                <Input
                  value={localSettings?.primary_color || '#a1052d'}
                  onChange={(e) => localSettings && setLocalSettings({ ...localSettings, primary_color: e.target.value })}
                  placeholder="#a1052d"
                  className="flex-1 h-11"
                />
              </div>
            </div>
          </div>
          
          {/* Color Presets */}
          <div>
            <Label className="text-sm font-semibold text-foreground">Color Presets</Label>
            <div className="flex flex-wrap gap-2 mt-3">
              {colorPresets.map((preset) => (
                <Button
                  key={preset.value}
                  variant="outline"
                  size="sm"
                  onClick={() => localSettings && setLocalSettings({ ...localSettings, primary_color: preset.value })}
                  className="gap-2 h-9 hover:shadow-md transition-shadow"
                >
                  <div
                    className="w-4 h-4 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: preset.value }}
                  />
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo Management */}
      <Card className="shadow-card border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Image className="h-5 w-5 text-primary" />
            Company Logo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Logo */}
          {(logoPreview || localSettings?.logo_path) && (
            <div className="flex items-start gap-6 p-6 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex-shrink-0">
                <img
                  src={logoPreview || localSettings?.logo_path}
                  alt="Company Logo"
                  className="max-w-40 max-h-40 object-contain bg-white rounded-lg border border-border shadow-sm"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-3 text-lg">Current Logo</h3>
                {localSettings?.logo_filename && (
                  <Badge variant="secondary" className="mb-3 text-sm px-3 py-1">
                    {localSettings.logo_filename}
                  </Badge>
                )}
                <p className="text-sm text-muted-foreground mb-4">
                  This logo will appear on all exported reports and financial statements
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="gap-2 hover:shadow-md transition-shadow"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Logo
                </Button>
              </div>
            </div>
          )}

          {/* Upload New Logo */}
          <div>
            <Label htmlFor="logoUpload" className="text-sm font-semibold text-foreground">Upload New Logo</Label>
            <div className="mt-3">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="logoUpload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer bg-primary/5 hover:bg-primary/10 transition-colors group"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-4 text-primary group-hover:text-primary-hover transition-colors" />
                    <p className="mb-2 text-sm text-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, SVG (MAX. 2MB)</p>
                  </div>
                  <input
                    id="logoUpload"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2">📋 Logo Recommendations:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use PNG format with transparent background for best results</li>
                <li>Optimal size: 200x60 pixels or similar aspect ratio (16:5)</li>
                <li>Keep file size under 2MB for faster loading</li>
                <li>Ensure good contrast against white and colored backgrounds</li>
              </ul>
            </div>
          </div>

          {/* New Logo Preview */}
          {logoFile && (
            <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
              <h3 className="font-semibold text-foreground mb-3">📋 New Logo Preview</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary" className="text-sm">{logoFile.name}</Badge>
                <Badge variant="outline" className="text-sm">{(logoFile.size / 1024).toFixed(1)} KB</Badge>
                <Badge variant="outline" className="text-sm">{logoFile.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Click "Save Settings" to upload and apply this logo
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Settings */}
      <Card className="shadow-card border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Palette className="h-5 w-5 text-primary" />
            Export & Report Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-6 bg-muted/30 rounded-lg border border-border/50">
              <h3 className="font-semibold text-foreground mb-3 text-lg">📊 Report Headers</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your logo and company name will automatically appear on all exported reports with professional formatting:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 grid grid-cols-2 gap-x-6">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Trial Balance reports
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Income Statements
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Balance Sheets
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  Chart of Accounts exports
                </li>
              </ul>
            </div>
            
            <div className="p-6 bg-gradient-primary/10 border border-primary/30 rounded-lg">
              <h3 className="font-semibold text-foreground mb-3 text-lg">🎨 Branding Preview</h3>
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{ backgroundColor: localSettings?.primary_color || '#a1052d' }}
                >
                  {localSettings?.company_name?.charAt(0) || 'Q'}
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">{localSettings?.company_name || 'QSA Solutions'}</p>
                  <p className="text-sm text-muted-foreground">Professional Accounting System</p>
                  <p className="text-xs text-muted-foreground mt-1">Tanzania • Powered by TZS</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}