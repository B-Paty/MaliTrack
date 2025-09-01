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
      : accounts.filter(acc => acc.current_balance !== 0);

    // Calculate proper debit/credit presentation based on account type and normal balance
    const processedAccounts = filteredAccounts.map(acc => {
      const balance = acc.current_balance;
      let debit = 0;
      let credit = 0;

      if (balance > 0) {
        if (
          acc.category === 'Current Asset' ||
          acc.category === 'Fixed Asset' ||
          acc.category === 'Expense' ||
          (acc.category === 'Equity' && acc.normal_balance === 'debit')
        ) {
          debit = balance;
        } else {
          credit = balance;
        }
      }

      return {
        code: acc.account_code,
        name: acc.account_name,
        debit,
        credit,
        balance: acc.current_balance,
        category: acc.category
      };
    });

    const totalDebits = processedAccounts.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredits = processedAccounts.reduce((sum, acc) => sum + acc.credit, 0);

    return {
      accounts: processedAccounts,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Options
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Export Format</Label>
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
                <SelectItem value="excel-advanced">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel Report
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    CSV Data
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Branding Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Company Logo</span>
                <Switch
                  checked={exportOptions.includeLogo}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, includeLogo: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Brand Colors</span>
                <Switch
                  checked={exportOptions.colorTheme}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({ ...prev, colorTheme: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-2 pt-4">
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
              Export
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
