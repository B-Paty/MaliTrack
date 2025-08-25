
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

  private addHeader() {
    const { margins, companyName, title, subtitle, reportDate } = this.config;
    const pageWidth = this.doc.internal.pageSize.width;
    
    // Company name
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(companyName, pageWidth / 2, margins.top - 10, { align: 'center' });
    
    // Report title
    this.doc.setFontSize(14);
    this.doc.text(title, pageWidth / 2, margins.top + 5, { align: 'center' });
    
    // Subtitle if provided
    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(subtitle, pageWidth / 2, margins.top + 15, { align: 'center' });
    }
    
    // Report date
    this.doc.setFontSize(10);
    this.doc.text(`Report Date: ${formatDate(reportDate)}`, margins.left, margins.top + 25);
    
    // Line separator
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(margins.left, margins.top + 30, pageWidth - margins.right, margins.top + 30);
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

  public exportTrialBalance(accounts: any[], filename?: string): void {
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

  public exportChartOfAccounts(accounts: any[], filename?: string): void {
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

  public exportFinancialStatement(
    statementType: 'income' | 'balance',
    statementData: any,
    dateRange: { from: string; to: string },
    filename?: string
  ): void {
    if (statementType === 'income') {
      this.exportIncomeStatement(statementData, dateRange, filename);
    } else {
      this.exportBalanceSheet(statementData, dateRange.to, filename);
    }
  }

  private exportIncomeStatement(data: any, dateRange: { from: string; to: string }, filename?: string): void {
    // Add header
    this.addHeader();
    
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
    this.doc.text('REVENUE', margins.left, yPosition);
    yPosition += 10;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    data.revenue.forEach((account: any) => {
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
    this.doc.text('EXPENSES', margins.left, yPosition);
    yPosition += 10;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    data.expenses.forEach((account: any) => {
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

    // Net Income
    this.doc.setFontSize(14);
    this.doc.line(margins.left, yPosition, pageWidth - margins.right, yPosition);
    this.doc.line(margins.left, yPosition + 2, pageWidth - margins.right, yPosition + 2);
    yPosition += 10;
    this.doc.text('NET INCOME', margins.left + 5, yPosition);
    this.doc.text(formatCurrency(Math.abs(data.netIncome)), pageWidth - margins.right - 5, yPosition, { align: 'right' });

    this.addFooter();
    
    const finalFilename = filename || `income-statement-${dateRange.from}-to-${dateRange.to}.pdf`;
    this.doc.save(finalFilename);
  }

  private exportBalanceSheet(data: any, asOfDate: string, filename?: string): void {
    // Add header
    this.addHeader();
    
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
    this.doc.text('ASSETS', margins.left, yPosition);
    yPosition += 10;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    data.assets.forEach((account: any) => {
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
    this.doc.text('LIABILITIES', rightColumnStart, yPosition);
    yPosition += 10;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    data.liabilities.forEach((account: any) => {
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
    this.doc.text('EQUITY', rightColumnStart, yPosition);
    yPosition += 10;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    data.equity.forEach((account: any) => {
      this.doc.text(account.account_name, rightColumnStart + 5, yPosition);
      this.doc.text(formatCurrency(account.current_balance), pageWidth - margins.right - 5, yPosition, { align: 'right' });
      yPosition += 8;
    });

    // Net Income
    this.doc.text('Retained Earnings (Current Period)', rightColumnStart + 5, yPosition);
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
