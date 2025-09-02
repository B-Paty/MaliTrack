/**
 * pdfExporter.ts
 * Utility class to export tables and statements to PDF using jsPDF + autoTable.
 * - PDFExporter(config) sets up page size, margins, and header/footer styles
 * - exportTable(columns, data, filename)
 * - exportTrialBalance(accounts)
 * - exportChartOfAccounts(accounts)
 * - exportFinancialStatement('income'|'balance', data, range)
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';

export interface PDFExportConfig {
  title: string;
  subtitle?: string;
  companyName?: string;
  reportDate?: string;
  pageSize?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface TableColumn {
  header: string;
  dataKey: string;
  width?: number;
}

export interface TableRow {
  [key: string]: string | number;
}

export interface CompanySettings {
  id?: string;
  company_name: string;
  logo_filename?: string;
  logo_path?: string;
  logo_base64?: string;
  primary_color: string;
  secondary_color?: string;
  accent_color?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  tax_id?: string;
  logo_position?: 'left' | 'center' | 'right';
  payment_settings?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface Account {
  account_code: string;
  account_name: string;
  category: string;
  current_balance: number;
  normal_balance: 'debit' | 'credit';
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  reference_number: string;
  date: string;
  description: string;
  total_amount: number;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialStatementData {
  revenue: Account[];
  expenses: Account[];
  assets: Account[];
  liabilities: Account[];
  equity: Account[];
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export interface DateRange {
  from: string;
  to: string;
}

export class PDFExporter {
  private doc: jsPDF;
  private config: Required<PDFExportConfig>;
  private pageCount = 0;

  constructor(config: PDFExportConfig) {
    this.config = {
      title: config.title,
      subtitle: config.subtitle || '',
      companyName: config.companyName || 'QSA Solutions',
      reportDate: config.reportDate || new Date().toISOString().split('T')[0],
      pageSize: config.pageSize || 'a4',
      orientation: config.orientation || 'portrait',
      margins: config.margins || { top: 30, bottom: 30, left: 20, right: 20 }
    };

    this.doc = new jsPDF({
      orientation: this.config.orientation,
      unit: 'mm',
      format: this.config.pageSize
    });
  }

  private async addHeader(companySettings?: CompanySettings) {
    const { margins, companyName, title, subtitle, reportDate } = this.config;
    const pageWidth = this.doc.internal.pageSize.width;
    
    // Company logo if available
    let logoAdded = false;
    if (companySettings?.logo_base64) {
      try {
        const logoWidth = 40;
        const logoHeight = 35;
        const logoX = (pageWidth - logoWidth) / 2;
        
        this.doc.addImage(companySettings.logo_base64, 'PNG', logoX, margins.top - 15, logoWidth, logoHeight);
        logoAdded = true;
        
        // Adjust text position for logo
        this.doc.setFontSize(18);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(companyName, pageWidth / 2, margins.top + 25, { align: 'center' });
      } catch (error) {
        console.warn('Failed to add logo to PDF:', error);
        logoAdded = false;
      }
    } else if (companySettings?.logo_path) {
      // Try to convert URL to base64 for PDF
      try {
        const logoBase64 = await this.urlToBase64(companySettings.logo_path);
        if (logoBase64) {
          const logoWidth = 40;
          const logoHeight = 35;
          const logoX = (pageWidth - logoWidth) / 2;
          
          this.doc.addImage(logoBase64, 'PNG', logoX, margins.top - 15, logoWidth, logoHeight);
          logoAdded = true;
          
          // Adjust text position for logo
          this.doc.setFontSize(18);
          this.doc.setFont('helvetica', 'bold');
          this.doc.text(companyName, pageWidth / 2, margins.top + 25, { align: 'center' });
        }
      } catch (error) {
        console.warn('Failed to convert logo URL to base64:', error);
        logoAdded = false;
      }
    }
    
    if (!logoAdded) {
      // Company name without logo
      this.doc.setFontSize(18);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(companyName, pageWidth / 2, margins.top - 10, { align: 'center' });
    }
    
    // Report title
    this.doc.setFontSize(14);
    this.doc.text(title, pageWidth / 2, margins.top + 35, { align: 'center' });
    
    // Subtitle if provided
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, pageWidth / 2, margins.top + 45, { align: 'center' });
    }
    
    // Report date
    this.doc.setFontSize(10);
    this.doc.text(`Report Date: ${formatDate(reportDate)}`, margins.left, margins.top + 55);
    
    // Line separator with company color
    const primaryColor = companySettings?.primary_color || '#a1052d';
    const rgbColor = this.hexToRgb(primaryColor);
    if (rgbColor) {
      this.doc.setDrawColor(rgbColor.r, rgbColor.g, rgbColor.b);
    } else {
      this.doc.setDrawColor(200, 200, 200);
    }
    this.doc.line(margins.left, margins.top + 60, pageWidth - margins.right, margins.top + 60);
  }

  private hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private async urlToBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Failed to convert URL to base64:', error);
      return null;
    }
  }

  private addFooter() {
    const { margins } = this.config;
    const pageHeight = this.doc.internal.pageSize.height;
    const pageWidth = this.doc.internal.pageSize.width;
    
    this.pageCount++;
    
    // Footer line
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(margins.left, pageHeight - margins.bottom + 10, pageWidth - margins.right, pageHeight - margins.bottom + 10);
    
    // Page number
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(
      `Page ${this.pageCount}`,
      pageWidth / 2,
      pageHeight - margins.bottom + 20,
      { align: 'center' }
    );
    
    // Generation timestamp
    this.doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      margins.left,
      pageHeight - margins.bottom + 20
    );
  }

  public exportTable(columns: TableColumn[], data: TableRow[], filename?: string): void {
    try {
      // Add header to first page
      this.addHeader();
      
      // Configure autoTable
      autoTable(this.doc, {
        head: [columns.map(col => col.header)],
        body: data.map(row => columns.map(col => {
          const value = row[col.dataKey];
          // Format currency values
          if (col.dataKey.includes('balance') || col.dataKey.includes('debit') || col.dataKey.includes('credit')) {
            return typeof value === 'number' ? formatCurrency(value) : value;
          }
          return value;
        })),
        startY: this.config.margins.top + 40,
        margin: {
          top: this.config.margins.top + 50,
          bottom: this.config.margins.bottom + 30,
          left: this.config.margins.left,
          right: this.config.margins.right
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
          overflow: 'linebreak',
          lineWidth: 0.1,
          lineColor: [200, 200, 200]
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        columnStyles: {
          0: { halign: 'center', fontStyle: 'bold' }, // Account code
          1: { halign: 'left' }, // Account name
          2: { halign: 'right' }, // Debit
          3: { halign: 'right' }, // Credit
          4: { halign: 'right', fontStyle: 'bold' } // Balance
        },
        didDrawPage: (data) => {
          // Add header to each new page
          if (data.pageNumber > 1) {
            this.addHeader();
          }
          // Add footer to each page
          this.addFooter();
        },
        showHead: 'everyPage'
      });

      // Save the PDF
      const finalFilename = filename || `${this.config.title.toLowerCase().replace(/\s+/g, '-')}-${this.config.reportDate}.pdf`;
      this.doc.save(finalFilename);
      
    } catch (error) {
      console.error('PDF Export failed:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public exportTrialBalance(accounts: Account[], filename?: string): void {
    const columns: TableColumn[] = [
      { header: 'Account Code', dataKey: 'account_code' },
      { header: 'Account Name', dataKey: 'account_name' },
      { header: 'Debit Balance', dataKey: 'debit_balance' },
      { header: 'Credit Balance', dataKey: 'credit_balance' }
    ];

    // Transform accounts data for trial balance presentation
    const tableData = accounts
      .filter(account => account.current_balance > 0)
      .map(account => {
        const isDebitAccount = 
          account.category === 'Current Asset' ||
          account.category === 'Fixed Asset' ||
          account.category === 'Expense' ||
          (account.category === 'Equity' && account.normal_balance === 'debit');

        return {
          account_code: account.account_code,
          account_name: account.account_name,
          debit_balance: isDebitAccount ? account.current_balance : 0,
          credit_balance: isDebitAccount ? 0 : account.current_balance
        };
      });

    this.exportTable(columns, tableData, filename);
  }

  public exportChartOfAccounts(accounts: Account[], filename?: string): void {
    const columns: TableColumn[] = [
      { header: 'Code', dataKey: 'account_code' },
      { header: 'Account Name', dataKey: 'account_name' },
      { header: 'Category', dataKey: 'category' },
      { header: 'Current Balance', dataKey: 'current_balance' },
      { header: 'Normal Balance', dataKey: 'normal_balance' }
    ];

    const tableData = accounts.map(account => ({
      account_code: account.account_code,
      account_name: account.account_name,
      category: account.category,
      current_balance: account.current_balance,
      normal_balance: account.normal_balance.toUpperCase()
    }));

    this.exportTable(columns, tableData, filename);
  }

  public async exportFinancialStatement(
    statementType: 'income' | 'balance',
    statementData: FinancialStatementData,
    dateRange: DateRange,
    filename?: string,
    companySettings?: CompanySettings
  ): Promise<void> {
    if (statementType === 'income') {
      await this.exportIncomeStatement(statementData, dateRange, filename, companySettings);
    } else {
      await this.exportBalanceSheet(statementData, dateRange.to, filename, companySettings);
    }
  }

  private async exportIncomeStatement(data: FinancialStatementData, dateRange: DateRange, filename?: string, companySettings?: CompanySettings): Promise<void> {
    // Add header
    await this.addHeader(companySettings);
    
    let yPosition = this.config.margins.top + 50;
    const { margins } = this.config;
    const pageWidth = this.doc.internal.pageSize.width;

    // Period information
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(
      `For the period from ${formatDate(dateRange.from)} to ${formatDate(dateRange.to)}`,
      pageWidth / 2,
      yPosition,
      { align: 'center' }
    );
    yPosition += 20;

    // Revenue section
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    
    // Set company primary color for section headers
    const primaryColor = companySettings?.primary_color || '#a1052d';
    const rgbColor = this.hexToRgb(primaryColor);
    if (rgbColor) {
      this.doc.setTextColor(rgbColor.r, rgbColor.g, rgbColor.b);
    }
    
    this.doc.text('REVENUE', margins.left, yPosition);
    yPosition += 10;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    // Reset text color to black for regular content
    this.doc.setTextColor(0, 0, 0);
    
    data.revenue.forEach((account: Account) => {
      this.doc.text(account.account_name, margins.left + 5, yPosition);
      this.doc.text(formatCurrency(account.current_balance), pageWidth - margins.right - 5, yPosition, { align: 'right' });
      yPosition += 8;
    });

    // Total Revenue
    this.doc.setFont('helvetica', 'bold');
    this.doc.line(margins.left, yPosition, pageWidth - margins.right, yPosition);
    yPosition += 5;
    this.doc.text('Total Revenue', margins.left + 5, yPosition);
    this.doc.text(formatCurrency(data.totalRevenue), pageWidth - margins.right - 5, yPosition, { align: 'right' });
    yPosition += 15;

    // Expenses section
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    
    // Set company primary color for section headers
    if (rgbColor) {
      this.doc.setTextColor(rgbColor.r, rgbColor.g, rgbColor.b);
    }
    
    this.doc.text('EXPENSES', margins.left, yPosition);
    yPosition += 10;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    // Reset text color to black for regular content
    this.doc.setTextColor(0, 0, 0);
    
    data.expenses.forEach((account: Account) => {
      this.doc.text(account.account_name, margins.left + 5, yPosition);
      this.doc.text(formatCurrency(account.current_balance), pageWidth - margins.right - 5, yPosition, { align: 'right' });
      yPosition += 8;
    });

    // Total Expenses
    this.doc.setFont('helvetica', 'bold');
    this.doc.line(margins.left, yPosition, pageWidth - margins.right, yPosition);
    yPosition += 5;
    this.doc.text('Total Expenses', margins.left + 5, yPosition);
    this.doc.text(formatCurrency(data.totalExpenses), pageWidth - margins.right - 5, yPosition, { align: 'right' });
    yPosition += 15;

    // Net Income/Loss
    this.doc.setFontSize(14);
    this.doc.line(margins.left, yPosition, pageWidth - margins.right, yPosition);
    this.doc.line(margins.left, yPosition + 2, pageWidth - margins.right, yPosition + 2);
    yPosition += 10;
    this.doc.text(data.netIncome >= 0 ? 'NET INCOME' : 'NET LOSS', margins.left + 5, yPosition);
    this.doc.text(formatCurrency(Math.abs(data.netIncome)), pageWidth - margins.right - 5, yPosition, { align: 'right' });

    this.addFooter();
    
    const finalFilename = filename || `income-statement-${dateRange.from}-to-${dateRange.to}.pdf`;
    this.doc.save(finalFilename);
  }

  private async exportBalanceSheet(data: FinancialStatementData, asOfDate: string, filename?: string, companySettings?: CompanySettings): Promise<void> {
    // Add header
    await this.addHeader(companySettings);
    
    let yPosition = this.config.margins.top + 50;
    const { margins } = this.config;
    const pageWidth = this.doc.internal.pageSize.width;

    // Date information
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`As of ${formatDate(asOfDate)}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Assets section
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    
    // Set company primary color for section headers
    const primaryColor = companySettings?.primary_color || '#a1052d';
    const rgbColor = this.hexToRgb(primaryColor);
    if (rgbColor) {
      this.doc.setTextColor(rgbColor.r, rgbColor.g, rgbColor.b);
    }
    
    this.doc.text('ASSETS', margins.left, yPosition);
    yPosition += 10;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    // Reset text color to black for regular content
    this.doc.setTextColor(0, 0, 0);
    
    data.assets.forEach((account: Account) => {
      const balance = account.normal_balance === 'debit' ? account.current_balance : -account.current_balance;
      this.doc.text(account.account_name, margins.left + 5, yPosition);
      this.doc.text(formatCurrency(balance), pageWidth / 2 - 10, yPosition, { align: 'right' });
      yPosition += 8;
    });

    // Total Assets
    this.doc.setFont('helvetica', 'bold');
    this.doc.line(margins.left, yPosition, pageWidth / 2 - 20, yPosition);
    yPosition += 5;
    this.doc.text('Total Assets', margins.left + 5, yPosition);
    this.doc.text(formatCurrency(data.totalAssets), pageWidth / 2 - 10, yPosition, { align: 'right' });

    // Reset position for right side
    yPosition = this.config.margins.top + 70;
    const rightColumnStart = pageWidth / 2 + 10;

    // Liabilities section
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    
    // Set company primary color for section headers
    if (rgbColor) {
      this.doc.setTextColor(rgbColor.r, rgbColor.g, rgbColor.b);
    }
    
    this.doc.text('LIABILITIES', rightColumnStart, yPosition);
    yPosition += 10;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    // Reset text color to black for regular content
    this.doc.setTextColor(0, 0, 0);
    
    data.liabilities.forEach((account: Account) => {
      this.doc.text(account.account_name, rightColumnStart + 5, yPosition);
      this.doc.text(formatCurrency(account.current_balance), pageWidth - margins.right - 5, yPosition, { align: 'right' });
      yPosition += 8;
    });

    // Total Liabilities
    this.doc.setFont('helvetica', 'bold');
    this.doc.line(rightColumnStart, yPosition, pageWidth - margins.right, yPosition);
    yPosition += 5;
    this.doc.text('Total Liabilities', rightColumnStart + 5, yPosition);
    this.doc.text(formatCurrency(data.totalLiabilities), pageWidth - margins.right - 5, yPosition, { align: 'right' });
    yPosition += 15;

    // Equity section
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    
    // Set company primary color for section headers
    if (rgbColor) {
      this.doc.setTextColor(rgbColor.r, rgbColor.g, rgbColor.b);
    }
    
    this.doc.text('EQUITY', rightColumnStart, yPosition);
    yPosition += 10;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    // Reset text color to black for regular content
    this.doc.setTextColor(0, 0, 0);
    
    data.equity.forEach((account: Account) => {
      this.doc.text(account.account_name, rightColumnStart + 5, yPosition);
      this.doc.text(formatCurrency(account.current_balance), pageWidth - margins.right - 5, yPosition, { align: 'right' });
      yPosition += 8;
    });

    // Net Income/Loss
    this.doc.text(data.netIncome >= 0 ? 'Retained Earnings (Current Period)' : 'Accumulated Loss', rightColumnStart + 5, yPosition);
    this.doc.text(formatCurrency(data.netIncome), pageWidth - margins.right - 5, yPosition, { align: 'right' });
    yPosition += 8;

    // Total Equity
    this.doc.setFont('helvetica', 'bold');
    this.doc.line(rightColumnStart, yPosition, pageWidth - margins.right, yPosition);
    yPosition += 5;
    this.doc.text('Total Equity', rightColumnStart + 5, yPosition);
    this.doc.text(formatCurrency(data.totalEquity), pageWidth - margins.right - 5, yPosition, { align: 'right' });

    this.addFooter();
    
    const finalFilename = filename || `balance-sheet-${asOfDate}.pdf`;
    this.doc.save(finalFilename);
  }
}
