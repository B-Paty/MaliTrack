/**
 * Export Buttons Component
 * Comprehensive export interface with branding support
 */

import React, { useState } from "react";
import {
  Download, FileText, Table, FileSpreadsheet, Eye,
  Settings, Palette, Image, Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAccounts } from "@/hooks/useAccounts";
import { useEnhancedCompanySettings } from "@/hooks/useEnhancedCompanySettings";
import { ExportData, ExportOptions } from "@/types/branding";
import { savePDFReport } from "@/lib/enhancedPdfExporter";
import { saveExcelReport, saveCSVReport } from "@/lib/enhancedExcelExporter";
import { formatCurrency } from "@/lib/formatters";

interface ExportButtonsProps {
  className?: string;
  reportTitle?: string;
  showPreview?: boolean;
}

export default function ExportButtons({ 
  className, 
  reportTitle = "Chart of Accounts",
  showPreview = true 
}: ExportButtonsProps) {
  const { toast } = useToast();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { settings } = useEnhancedCompanySettings();
  
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeLogo: true,
    includeSummary: true,
    pageSize: 'A4',
    orientation: 'portrait',
    colorTheme: true,
    showBalances: true,
    groupByCategory: false,
    includeZeroBalances: false
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Prepare export data
  const prepareExportData = (): ExportData => {
    const filteredAccounts = exportOptions.includeZeroBalances 
      ? accounts 
      : accounts.filter(acc => acc.balance !== 0);

    const totalDebits = filteredAccounts.reduce((sum, acc) => sum + (acc.debit_amount || 0), 0);
    const totalCredits = filteredAccounts.reduce((sum, acc) => sum + (acc.credit_amount || 0), 0);

    return {
      accounts: filteredAccounts.map(acc => ({
        code: acc.account_code,
        name: acc.account_name,
        debit: acc.debit_amount || 0,
        credit: acc.credit_amount || 0,
        balance: acc.balance || 0,
        category: acc.account_type
      })),
      companySettings: {
        name: settings?.company_name || 'QSA Solutions',
        logo: settings?.logo_base64 || settings?.logo_path || '',
        primaryColor: settings?.primary_color || '#a1052d',
        secondaryColor: settings?.secondary_color,
        accentColor: settings?.accent_color,
        address: settings?.address,
        phone: settings?.phone,
        email: settings?.email,
        website: settings?.website,
        taxId: settings?.tax_id,
        logoPosition: settings?.logo_position || 'left'
      },
      exportOptions,
      reportTitle,
      reportDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      totalDebits,
      totalCredits
    };
  };

  const handleExport = async (format: ExportOptions['format']) => {
    if (accountsLoading) {
      toast({
        title: "Please wait",
        description: "Accounts are still loading...",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const exportData = prepareExportData();
      const filename = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;

      switch (format) {
        case 'pdf':
          await savePDFReport(exportData, `${filename}.pdf`, {
            pageSize: exportOptions.pageSize,
            orientation: exportOptions.orientation,
            includeLogo: exportOptions.includeLogo,
            colorTheme: exportOptions.colorTheme
          });
          break;

        case 'excel-basic':
        case 'excel-advanced':
          await saveExcelReport(exportData, `${filename}.xlsx`, {
            format,
            includeLogo: exportOptions.includeLogo,
            colorTheme: exportOptions.colorTheme,
            multipleSheetsBy: exportOptions.groupByCategory ? 'category' : 'single'
          });
          break;

        case 'csv':
          saveCSVReport(exportData, `${filename}.csv`);
          break;
      }

      toast({
        title: "Export Successful",
        description: `${reportTitle} exported as ${format.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting the report",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const ExportOptionsDialog = () => (
    <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Export Options
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Settings
          </DialogTitle>
          <DialogDescription>
            Customize your export preferences and branding options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Export Format</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={exportOptions.format}
                onValueChange={(value: ExportOptions['format']) =>
                  setExportOptions(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      PDF Report
                    </div>
                  </SelectItem>
                  <SelectItem value="excel-basic">
                    <div className="flex items-center gap-2">
                      <Table className="h-4 w-4" />
                      Excel (Basic)
                    </div>
                  </SelectItem>
                  <SelectItem value="excel-advanced">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel (Advanced)
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <Table className="h-4 w-4" />
                      CSV File
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Branding Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Company Logo</Label>
                  <p className="text-sm text-muted-foreground">
                    Add your company logo to the report header
                  </p>
                </div>
                <Switch
                  checked={exportOptions.includeLogo}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeLogo: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Apply Brand Colors</Label>
                  <p className="text-sm text-muted-foreground">
                    Use your company colors in headers and styling
                  </p>
                </div>
                <Switch
                  checked={exportOptions.colorTheme}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, colorTheme: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Add summary statistics to the report
                  </p>
                </div>
                <Switch
                  checked={exportOptions.includeSummary}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeSummary: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Account Balances</Label>
                  <p className="text-sm text-muted-foreground">
                    Display current account balances
                  </p>
                </div>
                <Switch
                  checked={exportOptions.showBalances}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, showBalances: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Zero Balances</Label>
                  <p className="text-sm text-muted-foreground">
                    Show accounts with zero balance
                  </p>
                </div>
                <Switch
                  checked={exportOptions.includeZeroBalances}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeZeroBalances: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Group by Category</Label>
                  <p className="text-sm text-muted-foreground">
                    Organize accounts by category (Excel only)
                  </p>
                </div>
                <Switch
                  checked={exportOptions.groupByCategory}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, groupByCategory: checked }))
                  }
                  disabled={exportOptions.format === 'pdf' || exportOptions.format === 'csv'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Page Settings (PDF only) */}
          {exportOptions.format === 'pdf' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Page Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Page Size</Label>
                    <Select
                      value={exportOptions.pageSize}
                      onValueChange={(value: 'A4' | 'Letter') =>
                        setExportOptions(prev => ({ ...prev, pageSize: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="Letter">Letter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Orientation</Label>
                    <Select
                      value={exportOptions.orientation}
                      onValueChange={(value: 'portrait' | 'landscape') =>
                        setExportOptions(prev => ({ ...prev, orientation: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Button */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleExport(exportOptions.format);
                setShowExportDialog(false);
              }}
              disabled={isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export {exportOptions.format.toUpperCase()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Quick Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2 bg-gradient-primary hover:shadow-glow transition-all">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Quick Export</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={isExporting}>
            <FileText className="mr-2 h-4 w-4" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span>PDF Report</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  <Image className="h-3 w-3 mr-1" />
                  Branded
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Professional PDF with logo</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleExport('excel-advanced')} disabled={isExporting}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span>Excel Report</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  <Palette className="h-3 w-3 mr-1" />
                  Styled
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Advanced formatting</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleExport('csv')} disabled={isExporting}>
            <Table className="mr-2 h-4 w-4" />
            <div className="flex-1">
              <span>CSV Data</span>
              <p className="text-xs text-muted-foreground">Raw data export</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Export Options...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export Options Dialog */}
      <ExportOptionsDialog />

      {/* Preview Button (if enabled) */}
      {showPreview && (
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      )}
    </div>
  );
}
