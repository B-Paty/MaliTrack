/**
 * Export Buttons Component
 * Simple transaction export interface with branding support
 */

import React, { useState } from "react";
import {
  Download, FileText, Table, FileSpreadsheet,
  Palette, Image
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
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/useTransactions";
import { useEnhancedCompanySettings } from "@/hooks/useEnhancedCompanySettings";
import { ExportData, ExportOptions } from "@/types/branding";
import { savePDFReport } from "@/lib/enhancedPdfExporter";
import { saveExcelReport, saveCSVReport } from "@/lib/enhancedExcelExporter";
import { formatCurrency } from "@/lib/formatters";

interface ExportButtonsProps {
  className?: string;
}

export default function ExportButtons({ 
  className
}: ExportButtonsProps) {
  const { toast } = useToast();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { settings } = useEnhancedCompanySettings();
  
  const [isExporting, setIsExporting] = useState(false);

  // Prepare export data from transactions
  const prepareTransactionData = (): ExportData => {
    // Convert transactions to account-like format for export
    const transactionAccounts = transactions.flatMap(transaction => 
      transaction.lines.map(line => ({
        code: line.account_code,
        name: line.account_name || 'Unknown Account',
        debit: line.debit_amount,
        credit: line.credit_amount,
        balance: line.debit_amount - line.credit_amount,
        category: `Transaction ${transaction.reference_number}`,
        account_type: 'Transaction Line'
      }))
    );

    const totalDebits = transactionAccounts.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredits = transactionAccounts.reduce((sum, acc) => sum + acc.credit, 0);

    return {
      accounts: transactionAccounts,
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
      exportOptions: {
        format: 'pdf',
        includeLogo: true,
        includeSummary: true,
        pageSize: 'A4',
        orientation: 'portrait',
        colorTheme: true,
        showBalances: true,
        groupByCategory: false,
        includeZeroBalances: true
      },
      reportTitle: "All Recorded Transactions",
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
    if (transactionsLoading) {
      toast({
        title: "Please wait",
        description: "Transactions are still loading...",
        variant: "destructive"
      });
      return;
    }

    if (transactions.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no recorded transactions to export",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const exportData = prepareTransactionData();
      const filename = `All_Transactions_${new Date().toISOString().split('T')[0]}`;

      switch (format) {
        case 'pdf':
          await savePDFReport(exportData, `${filename}.pdf`, {
            pageSize: 'A4',
            orientation: 'portrait',
            includeLogo: true,
            colorTheme: true
          });
          break;

        case 'excel-basic':
        case 'excel-advanced':
          await saveExcelReport(exportData, `${filename}.xlsx`, {
            format: 'excel-advanced',
            includeLogo: true,
            colorTheme: true,
            multipleSheetsBy: 'single'
          });
          break;

        case 'csv':
          saveCSVReport(exportData, `${filename}.csv`);
          break;
      }

      toast({
        title: "Export Successful",
        description: `All transactions exported as ${format.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting transactions",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Transaction Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className="gap-2 bg-gradient-primary hover:shadow-glow transition-all"
            disabled={isExporting || transactionsLoading}
          >
            {isExporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export All Transactions
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Export All Recorded Transactions</DropdownMenuLabel>
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
              <p className="text-xs text-muted-foreground">Professional PDF with company branding</p>
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
              <p className="text-xs text-muted-foreground">Advanced formatting with branding</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleExport('csv')} disabled={isExporting}>
            <Table className="mr-2 h-4 w-4" />
            <div className="flex-1">
              <span>CSV Data</span>
              <p className="text-xs text-muted-foreground">Raw transaction data export</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}