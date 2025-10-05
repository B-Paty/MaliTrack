/**
 * Enhanced Company Settings Component
 * Comprehensive branding and company information management
 */

import React, { useState, useEffect } from "react";
import {
  Upload, Save, Building2, Palette, Image, Trash2, Eye, Download,
  Phone, Mail, Globe, MapPin, Hash, Sparkles, CreditCard, Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useEnhancedCompanySettings } from "@/hooks/useEnhancedCompanySettings";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";
import { useTheme } from "@/components/layout/ThemeProvider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import InventorySettings from "@/components/modules/InventorySettings";
import { useAuth } from "@/components/auth/AuthProvider";

interface ColorPresetCardProps {
  preset: {
    name: string;
    primaryColor: string;
    secondaryColor?: string;
    accentColor?: string;
    description: string;
  };
  isSelected: boolean;
  onSelect: (preset: ColorPresetCardProps['preset']) => void;
}

const ColorPresetCard = ({ preset, isSelected, onSelect }: ColorPresetCardProps) => (
  <div
    className={cn(
      "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
      isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
    )}
    onClick={() => onSelect(preset)}
  >
    <div className="flex items-center gap-3 mb-2">
      <div
        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
        style={{ backgroundColor: preset.primaryColor }}
      />
      <h4 className="font-semibold text-sm">{preset.name}</h4>
    </div>
    <p className="text-xs text-muted-foreground">{preset.description}</p>
  </div>
);

export default function EnhancedCompanySettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { theme } = useTheme();
  const {
    settings,
    loading,
    brandingPresets,
    updateSettings,
    applyPreset,
    removeLogo,
    getLogoForContext
  } = useEnhancedCompanySettings();
  const { paymentSettings, savePaymentSettings } = usePaymentSettings();

  const [localSettings, setLocalSettings] = useState(settings);
  const [localPayments, setLocalPayments] = useState(paymentSettings);

  const [activeTab, setActiveTab] = useState("company");
  
  // Determine current theme for logo selection
  const currentTheme = theme === "system" 
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme;

  // Update local settings when database settings change
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    setLocalPayments(paymentSettings);
  }, [paymentSettings]);



  const handleSaveSettings = async () => {
    try {
      // Save settings (logo is handled by static file system)
      await updateSettings(localSettings!, undefined);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleSavePaymentSettings = async () => {
    try {
      await savePaymentSettings(localPayments);
      toast({
        title: "Success",
        description: "Payment settings saved successfully",
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handlePresetSelect = async (preset: ColorPresetCardProps['preset']) => {
    setLocalSettings(prev => prev ? {
      ...prev,
      primary_color: preset.primaryColor,
      secondary_color: preset.secondaryColor,
      accent_color: preset.accentColor
    } : null);
    
    // Apply immediately for preview
    await applyPreset(preset);
  };

  const handleRemoveLogo = async () => {
    try {
      // Remove logo reference from database settings
      // Note: The actual logo file remains in /public/images/logo/ folder
      await removeLogo();
    } catch (error) {
      // Error handled in hook
    }
  };

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

  const currentLogo = getLogoForContext('preview', currentTheme);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Company Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your company information, branding, and export preferences
          </p>
        </div>
        
        <Button 
          onClick={handleSaveSettings} 
          className="gap-2 h-12 px-8 bg-gradient-primary hover:shadow-glow transition-all"
        >
          <Save className="h-5 w-5" />
          Save Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-2 mb-4 md:mb-6 h-auto p-2">
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="export">Export Settings</TabsTrigger>
        </TabsList>

        {/* Company Information Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card className="shadow-elevated border-0 bg-gradient-secondary/50">
            {/* Heading removed per mobile/desktop simplification */}
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="companyName" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    value={localSettings?.company_name || ''}
                    onChange={(e) => localSettings && setLocalSettings({ 
                      ...localSettings, 
                      company_name: e.target.value 
                    })}
                    placeholder="Enter company name"
                    className="mt-1.5 h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={localSettings?.email || ''}
                    onChange={(e) => localSettings && setLocalSettings({ 
                      ...localSettings, 
                      email: e.target.value 
                    })}
                    placeholder="company@example.com"
                    className="mt-1.5 h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={localSettings?.phone || ''}
                    onChange={(e) => localSettings && setLocalSettings({ 
                      ...localSettings, 
                      phone: e.target.value 
                    })}
                    placeholder="+255 XXX XXX XXX"
                    className="mt-1.5 h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="website" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={localSettings?.website || ''}
                    onChange={(e) => localSettings && setLocalSettings({ 
                      ...localSettings, 
                      website: e.target.value 
                    })}
                    placeholder="https://www.company.com"
                    className="mt-1.5 h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="taxId" className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Tax ID / Registration Number
                  </Label>
                  <Input
                    id="taxId"
                    value={localSettings?.tax_id || ''}
                    onChange={(e) => localSettings && setLocalSettings({ 
                      ...localSettings, 
                      tax_id: e.target.value 
                    })}
                    placeholder="Tax identification number"
                    className="mt-1.5 h-11"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Business Address
                </Label>
                <Textarea
                  id="address"
                  value={localSettings?.address || ''}
                  onChange={(e) => localSettings && setLocalSettings({ 
                    ...localSettings, 
                    address: e.target.value 
                  })}
                  placeholder="Enter your business address"
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card className="shadow-elevated border-0">
            {/* Heading removed per simplification */}
            <CardContent className="space-y-6">
              {/* Color Presets */}
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Brand Presets
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {brandingPresets.map((preset) => (
                    <ColorPresetCard
                      key={preset.name}
                      preset={preset}
                      isSelected={localSettings?.primary_color === preset.primaryColor}
                      onSelect={handlePresetSelect}
                    />
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="primaryColor" className="text-sm font-semibold text-foreground">
                    Primary Color
                  </Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={localSettings?.primary_color || '#a1052d'}
                      onChange={(e) => localSettings && setLocalSettings({ 
                        ...localSettings, 
                        primary_color: e.target.value 
                      })}
                      className="w-16 h-11 p-1 border rounded-md"
                    />
                    <Input
                      value={localSettings?.primary_color || '#a1052d'}
                      onChange={(e) => localSettings && setLocalSettings({ 
                        ...localSettings, 
                        primary_color: e.target.value 
                      })}
                      placeholder="#a1052d"
                      className="flex-1 h-11 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondaryColor" className="text-sm font-semibold text-foreground">
                    Secondary Color
                  </Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={localSettings?.secondary_color || '#ffffff'}
                      onChange={(e) => localSettings && setLocalSettings({ 
                        ...localSettings, 
                        secondary_color: e.target.value 
                      })}
                      className="w-16 h-11 p-1 border rounded-md"
                    />
                    <Input
                      value={localSettings?.secondary_color || '#ffffff'}
                      onChange={(e) => localSettings && setLocalSettings({ 
                        ...localSettings, 
                        secondary_color: e.target.value 
                      })}
                      placeholder="#ffffff"
                      className="flex-1 h-11 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accentColor" className="text-sm font-semibold text-foreground">
                    Accent Color
                  </Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Input
                      id="accentColor"
                      type="color"
                      value={localSettings?.accent_color || '#f3f4f6'}
                      onChange={(e) => localSettings && setLocalSettings({ 
                        ...localSettings, 
                        accent_color: e.target.value 
                      })}
                      className="w-16 h-11 p-1 border rounded-md"
                    />
                    <Input
                      value={localSettings?.accent_color || '#f3f4f6'}
                      onChange={(e) => localSettings && setLocalSettings({ 
                        ...localSettings, 
                        accent_color: e.target.value 
                      })}
                      placeholder="#f3f4f6"
                      className="flex-1 h-11 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Color Preview */}
              <div className="p-6 bg-muted/30 rounded-lg border border-border/50">
                <h4 className="font-semibold text-foreground mb-4">Color Preview</h4>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: localSettings?.primary_color || '#a1052d' }}
                    />
                    <span className="text-sm font-medium">Primary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: localSettings?.secondary_color || '#ffffff' }}
                    />
                    <span className="text-sm font-medium">Secondary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: localSettings?.accent_color || '#f3f4f6' }}
                    />
                    <span className="text-sm font-medium">Accent</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logo Tab */}
        <TabsContent value="logo" className="space-y-6">
          <Card className="shadow-elevated border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Image className="h-5 w-5 text-primary" />
                Company Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Logo */}
              {currentLogo && (
                <div className="flex items-start gap-6 p-6 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex-shrink-0">
                    <img
                      src={currentLogo}
                      alt="Company Logo"
                      className="max-w-40 max-h-40 object-contain bg-white rounded-lg border border-border shadow-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-3 text-lg">
                      Current Logo (Static)
                    </h3>
                    {settings?.logo_filename && (
                      <Badge variant="secondary" className="mb-3 text-sm px-3 py-1">
                        {settings.logo_filename}
                      </Badge>
                    )}
                    <p className="text-sm text-muted-foreground mb-4">
                      This logo is loaded from the static file system and will appear on all exported reports and financial statements
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

              {/* Static Logo Display */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-foreground">
                    Current Logo (Static File System)
                  </Label>
                  <div className="mt-3 p-4 bg-muted/30 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                    <div className="flex items-center justify-center gap-4">
                      {/* Logo Preview */}
                      <div className="flex-shrink-0">
                        {settings?.logo_path ? (
                          <img
                            src={settings.logo_path}
                            alt="Company Logo"
                            className="h-16 w-auto max-w-[200px] object-contain rounded-lg shadow-sm"
                            onError={(e) => {
                              // Fallback to icon if logo fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        {/* Fallback Icon */}
                        <div className="hidden h-16 w-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                          <Building2 className="h-8 w-8 text-primary-foreground" />
                        </div>
                      </div>

                      {/* Logo Info */}
                      <div className="flex-1 text-center">
                        <div className="text-sm text-muted-foreground mb-2">
                          Logo Path: <code className="bg-muted px-2 py-1 rounded text-xs">{settings?.logo_path || 'Not configured'}</code>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Static File System
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Static Logo Instructions */}
                <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">📁 Static Logo Setup</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">To change the logo:</p>
                      <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Place your logo file in: <code className="bg-muted px-1 rounded text-xs">/public/images/logo/</code></li>
                        <li>Update the filename in: <code className="bg-muted px-1 rounded text-xs">src/config/logoConfig.ts</code></li>
                        <li>Restart the development server to see changes</li>
                      </ol>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Supported formats:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>PNG (recommended for transparency)</li>
                        <li>JPG/JPEG (for photos)</li>
                        <li>SVG (for vector graphics)</li>
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Recommended specs:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Dimensions: 200x80 pixels (max)</li>
                        <li>Transparent background preferred</li>
                        <li>High resolution for crisp display</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Logo Position */}
                <div>
                  <Label className="text-sm font-semibold text-foreground">Logo Position</Label>
                  <Select
                    value={localSettings?.logo_position || 'left'}
                    onValueChange={(value: 'left' | 'center' | 'right') => 
                      localSettings && setLocalSettings({ 
                        ...localSettings, 
                        logo_position: value 
                      })
                    }
                  >
                    <SelectTrigger className="mt-1.5 h-11">
                      <SelectValue placeholder="Select logo position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left Aligned</SelectItem>
                      <SelectItem value="center">Center Aligned</SelectItem>
                      <SelectItem value="right">Right Aligned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card className="shadow-elevated border-0">
            {/* Heading removed per simplification */}
            <CardContent className="space-y-6">
              {/* Bank Payment Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Bank Payment Details
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable bank payment option and configure account details
                    </p>
                  </div>
                  <Switch
                    checked={localPayments?.bank?.enabled || false}
                    onCheckedChange={(checked) =>
                      setLocalPayments(prev => prev ? {
                        ...prev,
                        bank: { ...prev.bank, enabled: checked }
                      } : prev)
                    }
                  />
                </div>

                {localPayments?.bank?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <Label htmlFor="bankName" className="text-sm font-medium">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={localPayments.bank.bankName || ''}
                        onChange={(e) => setLocalPayments(prev => prev ? {
                          ...prev,
                          bank: { ...prev.bank, bankName: e.target.value }
                        } : prev)}
                        placeholder="e.g., CRDB Bank"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountName" className="text-sm font-medium">Account Name</Label>
                      <Input
                        id="accountName"
                        value={localPayments.bank.accountName || ''}
                        onChange={(e) => setLocalPayments(prev => prev ? {
                          ...prev,
                          bank: { ...prev.bank, accountName: e.target.value }
                        } : prev)}
                        placeholder="e.g., QSA Solutions Ltd"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="accountNumber" className="text-sm font-medium">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={localPayments.bank.accountNumber || ''}
                        onChange={(e) => setLocalPayments(prev => prev ? {
                          ...prev,
                          bank: { ...prev.bank, accountNumber: e.target.value }
                        } : prev)}
                        placeholder="e.g., 201234567890"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Vodacom Payment Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Vodacom Lipa Namba
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable Vodacom M-Pesa payment option
                    </p>
                  </div>
                  <Switch
                    checked={localPayments?.vodacom?.enabled || false}
                    onCheckedChange={(checked) =>
                      setLocalPayments(prev => prev ? {
                        ...prev,
                        vodacom: { ...prev.vodacom, enabled: checked }
                      } : prev)
                    }
                  />
                </div>

                {localPayments?.vodacom?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                    <div>
                      <Label htmlFor="businessName" className="text-sm font-medium">Business Name</Label>
                      <Input
                        id="businessName"
                        value={localPayments.vodacom.businessName || ''}
                        onChange={(e) => setLocalPayments(prev => prev ? {
                          ...prev,
                          vodacom: { ...prev.vodacom, businessName: e.target.value }
                        } : prev)}
                        placeholder="e.g., QSA Solutions"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lipaNamba" className="text-sm font-medium">Lipa Namba</Label>
                      <Input
                        id="lipaNamba"
                        value={localPayments.vodacom.lipaNamba || ''}
                        onChange={(e) => setLocalPayments(prev => prev ? {
                          ...prev,
                          vodacom: { ...prev.vodacom, lipaNamba: e.target.value }
                        } : prev)}
                        placeholder="e.g., 255712345678"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePaymentSettings} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Payment Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Settings Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {user && <InventorySettings userId={user.id} />}
        </TabsContent>

        {/* Export Settings Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card className="shadow-elevated border-0">
            {/* Heading removed per simplification */}
            <CardContent className="space-y-6">
              <div className="p-6 bg-muted/30 rounded-lg border border-border/50">
                <h3 className="font-semibold text-foreground mb-4 text-lg">📊 Branded Exports</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your company logo and brand colors will automatically be applied to all exported reports:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">PDF Reports</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Company logo in header</li>
                      <li>• Brand colors for headers and borders</li>
                      <li>• Professional multi-page layout</li>
                      <li>• Company information footer</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Excel Reports</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Embedded company logo</li>
                      <li>• Brand color schemes</li>
                      <li>• Multiple worksheet options</li>
                      <li>• Advanced formatting</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">✅ Ready for Professional Exports</h4>
                <p className="text-sm text-muted-foreground">
                  Your branding settings are automatically applied to all report exports. 
                  No additional configuration needed!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
