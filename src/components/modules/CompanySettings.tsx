import { useState } from "react";
import { Upload, Save, Building2, Palette, Image, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { defaultCompanySettings, type CompanySettings } from "@/data/chartOfAccounts";
import { useToast } from "@/hooks/use-toast";

export default function CompanySettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<CompanySettings>(defaultCompanySettings);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
    setSettings(prev => ({
      ...prev,
      logoFilename: undefined,
      logoPath: undefined
    }));
  };

  const handleSaveSettings = () => {
    if (!settings.companyName.trim()) {
      toast({
        title: "Validation Error",
        description: "Company name is required",
        variant: "destructive"
      });
      return;
    }

    // Simulate saving settings
    toast({
      title: "Settings Saved Successfully",
      description: "Company settings have been updated",
    });

    // If there's a new logo file, simulate upload
    if (logoFile) {
      setTimeout(() => {
        toast({
          title: "Logo Uploaded",
          description: `Logo "${logoFile.name}" has been saved successfully`,
        });
        
        setSettings(prev => ({
          ...prev,
          logoFilename: logoFile.name,
          logoPath: `/uploads/logos/${logoFile.name}`
        }));
        
        setLogoFile(null);
      }, 1000);
    }
  };

  const colorPresets = [
    { name: 'QSA Red (Default)', value: '#C81338' },
    { name: 'Professional Blue', value: '#1E3A8A' },
    { name: 'Corporate Green', value: '#059669' },
    { name: 'Executive Purple', value: '#7C3AED' },
    { name: 'Modern Orange', value: '#EA580C' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Company Settings</h1>
          <p className="text-muted-foreground">Manage your company information and branding</p>
        </div>
        
        <Button onClick={handleSaveSettings} className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>

      {/* Company Information */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Enter company name"
              />
            </div>
            
            <div>
              <Label htmlFor="primaryColor">Primary Brand Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  placeholder="#C81338"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          {/* Color Presets */}
          <div>
            <Label>Color Presets</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {colorPresets.map((preset) => (
                <Button
                  key={preset.value}
                  variant="outline"
                  size="sm"
                  onClick={() => setSettings(prev => ({ ...prev, primaryColor: preset.value }))}
                  className="gap-2"
                >
                  <div
                    className="w-4 h-4 rounded-full border border-border"
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
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Company Logo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Logo */}
          {(logoPreview || settings.logoPath) && (
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex-shrink-0">
                <img
                  src={logoPreview || settings.logoPath}
                  alt="Company Logo"
                  className="max-w-32 max-h-32 object-contain bg-white rounded border border-border"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Current Logo</h3>
                {settings.logoFilename && (
                  <Badge variant="secondary" className="mb-2">
                    {settings.logoFilename}
                  </Badge>
                )}
                <p className="text-sm text-muted-foreground mb-3">
                  This logo will appear on all exported reports and documents
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Logo
                </Button>
              </div>
            </div>
          )}

          {/* Upload New Logo */}
          <div>
            <Label htmlFor="logoUpload">Upload New Logo</Label>
            <div className="mt-2">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="logoUpload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
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
            
            <div className="mt-3 text-sm text-muted-foreground">
              <p><strong>Recommendations:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Use PNG format with transparent background for best results</li>
                <li>Optimal size: 200x60 pixels or similar aspect ratio</li>
                <li>Keep file size under 2MB for faster loading</li>
              </ul>
            </div>
          </div>

          {/* New Logo Preview */}
          {logoFile && (
            <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">New Logo Preview</h3>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{logoFile.name}</Badge>
                <Badge variant="outline">{(logoFile.size / 1024).toFixed(1)} KB</Badge>
                <Badge variant="outline">{logoFile.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Click "Save Settings" to upload this logo
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Settings */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Export & Report Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Report Headers</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Your logo and company name will automatically appear on all exported reports:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Trial Balance reports</li>
                <li>• Income Statements</li>
                <li>• Balance Sheets</li>
                <li>• Chart of Accounts exports</li>
              </ul>
            </div>
            
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Branding Preview</h3>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  {settings.companyName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{settings.companyName}</p>
                  <p className="text-sm text-muted-foreground">Professional Accounting System</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}