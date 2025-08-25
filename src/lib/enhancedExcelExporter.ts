/**
 * Enhanced Excel Exporter with Company Branding
 * Professional Excel generation with logo, colors, and advanced formatting
 */

import * as ExcelJS from 'exceljs';
import { ExportData } from '@/types/branding';
import { formatCurrency } from '@/lib/formatters';
import { hexToHsl } from '@/lib/brandingUtils';

interface ExcelOptions {
  format: 'excel-basic' | 'excel-advanced';
  includeLogo: boolean;
  includeCharts: boolean;
  multipleSheetsBy: 'category' | 'type' | 'single';
  colorTheme: boolean;
}

export class EnhancedExcelExporter {
  private workbook: ExcelJS.Workbook;
  private data: ExportData;
  private options: ExcelOptions;
  private brandColors: { primary: string; secondary: string; accent: string };

  constructor(data: ExportData, options: Partial<ExcelOptions> = {}) {
    this.data = data;
    this.options = {
      format: 'excel-advanced',
      includeLogo: true,
      includeCharts: false,
      multipleSheetsBy: 'single',
      colorTheme: true,
      ...options
    };

    this.workbook = new ExcelJS.Workbook();
    this.setupBrandColors();
    this.setupWorkbookProperties();
  }

  private setupBrandColors(): void {
    const primaryColor = this.data.companySettings.primaryColor || '#a1052d';
    this.brandColors = {
      primary: primaryColor.replace('#', ''),
      secondary: (this.data.companySettings.secondaryColor || '#f8f9fa').replace('#', ''),
      accent: (this.data.companySettings.accentColor || '#e5e7eb').replace('#', '')
    };
  }

  private setupWorkbookProperties(): void {
    this.workbook.creator = this.data.companySettings.name;
    this.workbook.created = new Date();
    this.workbook.modified = new Date();
    this.workbook.lastPrinted = new Date();
    this.workbook.properties.date1904 = false;
    
    this.workbook.views = [{
      x: 0, y: 0, width: 10000, height: 20000,
      firstSheet: 0, activeTab: 0, visibility: 'visible'
    }];
  }

  private async addLogo(worksheet: ExcelJS.Worksheet): Promise<void> {
    if (!this.options.includeLogo || !this.data.companySettings.logo) return;

    try {
      // Convert base64 to buffer if needed
      let imageBuffer: Buffer;
      const logoData = this.data.companySettings.logo;

      if (logoData.startsWith('data:')) {
        // Base64 data
        const base64Data = logoData.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        // URL - would need to fetch, for now skip
        console.warn('URL-based logos not supported in Excel export');
        return;
      }

      const imageId = this.workbook.addImage({
        buffer: imageBuffer,
        extension: 'png',
      });

      // Add image to worksheet
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 200, height: 80 },
        editAs: 'oneCell'
      });
    } catch (error) {
      console.warn('Failed to add logo to Excel:', error);
    }
  }

  private setupHeaderStyles(worksheet: ExcelJS.Worksheet): void {
    // Company name style
    worksheet.getCell('A1').font = {
      name: 'Arial',
      size: 18,
      bold: true,
      color: { argb: 'FF' + this.brandColors.primary }
    };

    // Report title style
    worksheet.getCell('A4').font = {
      name: 'Arial',
      size: 14,
      bold: true,
      color: { argb: 'FF' + this.brandColors.primary }
    };

    // Date style
    worksheet.getCell('A5').font = {
      name: 'Arial',
      size: 10,
      color: { argb: 'FF666666' }
    };
  }

  private addHeaderContent(worksheet: ExcelJS.Worksheet): void {
    // Company name
    worksheet.getCell('A1').value = this.data.companySettings.name;
    
    // Company details
    let row = 2;
    if (this.data.companySettings.address) {
      worksheet.getCell(`A${row}`).value = this.data.companySettings.address;
      row++;
    }

    const contactInfo = [];
    if (this.data.companySettings.phone) contactInfo.push(`Phone: ${this.data.companySettings.phone}`);
    if (this.data.companySettings.email) contactInfo.push(`Email: ${this.data.companySettings.email}`);
    if (this.data.companySettings.website) contactInfo.push(`Web: ${this.data.companySettings.website}`);
    
    if (contactInfo.length > 0) {
      worksheet.getCell(`A${row}`).value = contactInfo.join(' | ');
      row++;
    }

    // Report title and date
    worksheet.getCell('A4').value = this.data.reportTitle;
    worksheet.getCell('A5').value = `Generated on: ${this.data.reportDate}`;
  }

  private createAccountsTable(worksheet: ExcelJS.Worksheet, startRow: number = 7): void {
    // Headers
    const headers = ['Code', 'Account Name', 'Category', 'Debit', 'Credit', 'Balance'];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(startRow, index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF' + this.brandColors.primary }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Data rows
    this.data.accounts.forEach((account, index) => {
      const row = startRow + 1 + index;
      const rowData = [
        account.code,
        account.name,
        account.category || 'General',
        account.debit,
        account.credit,
        account.balance
      ];

      rowData.forEach((value, colIndex) => {
        const cell = worksheet.getCell(row, colIndex + 1);
        cell.value = value;
        
        // Format currency columns
        if (colIndex >= 3) {
          cell.numFmt = '"Tsh "#,##0';
        }

        // Add borders
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };

        // Alternate row colors
        if (index % 2 === 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' }
          };
        }
      });
    });

    // Totals row
    const totalsRow = startRow + 1 + this.data.accounts.length;
    const totalsData = [
      '',
      'TOTALS',
      '',
      this.data.totalDebits,
      this.data.totalCredits,
      this.data.totalDebits - this.data.totalCredits
    ];

    totalsData.forEach((value, colIndex) => {
      const cell = worksheet.getCell(totalsRow, colIndex + 1);
      cell.value = value;
      cell.font = { bold: true };
      
      // Format currency columns
      if (colIndex >= 3 && typeof value === 'number') {
        cell.numFmt = '"Tsh "#,##0';
      }

      // Special styling for totals
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF' + this.brandColors.secondary }
      };
      
      cell.border = {
        top: { style: 'thick' },
        left: { style: 'thin' },
        bottom: { style: 'thick' },
        right: { style: 'thin' }
      };
    });

    // Auto-fit columns
    worksheet.columns.forEach((column, index) => {
      if (index === 1) { // Account name column
        column.width = 30;
      } else if (index >= 3) { // Currency columns
        column.width = 15;
      } else {
        column.width = 12;
      }
    });
  }

  private createSummarySheet(): ExcelJS.Worksheet {
    const worksheet = this.workbook.addWorksheet('Summary');
    
    // Add header
    this.addHeaderContent(worksheet);
    this.setupHeaderStyles(worksheet);

    // Summary data
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Accounts', this.data.accounts.length],
      ['Total Debits', this.data.totalDebits],
      ['Total Credits', this.data.totalCredits],
      ['Net Balance', this.data.totalDebits - this.data.totalCredits],
      ['Report Date', this.data.reportDate]
    ];

    let startRow = 7;
    summaryData.forEach((rowData, index) => {
      rowData.forEach((value, colIndex) => {
        const cell = worksheet.getCell(startRow + index, colIndex + 1);
        cell.value = value;
        
        if (index === 0) {
          // Header row
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF' + this.brandColors.primary }
          };
        } else {
          // Data rows
          if (colIndex === 0) {
            cell.font = { bold: true };
          }
          
          // Format currency values
          if (typeof value === 'number' && colIndex === 1 && index >= 2 && index <= 4) {
            cell.numFmt = '"Tsh "#,##0';
          }
        }

        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Auto-fit columns
    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 20;

    return worksheet;
  }

  private createMainSheet(): ExcelJS.Worksheet {
    const worksheet = this.workbook.addWorksheet('Chart of Accounts');
    
    // Add logo
    this.addLogo(worksheet);
    
    // Add header content
    this.addHeaderContent(worksheet);
    this.setupHeaderStyles(worksheet);
    
    // Create accounts table
    this.createAccountsTable(worksheet);
    
    return worksheet;
  }

  private createCategorySheets(): void {
    const categories = [...new Set(this.data.accounts.map(account => account.category || 'General'))];
    
    categories.forEach(category => {
      const worksheet = this.workbook.addWorksheet(category);
      const categoryAccounts = this.data.accounts.filter(account => (account.category || 'General') === category);
      
      // Add header
      this.addHeaderContent(worksheet);
      this.setupHeaderStyles(worksheet);
      
      // Create table with filtered accounts
      const categoryData = {
        ...this.data,
        accounts: categoryAccounts,
        totalDebits: categoryAccounts.reduce((sum, acc) => sum + acc.debit, 0),
        totalCredits: categoryAccounts.reduce((sum, acc) => sum + acc.credit, 0)
      };
      
      this.data = categoryData;
      this.createAccountsTable(worksheet);
    });
  }

  public async generate(): Promise<Buffer> {
    try {
      // Create main sheet
      this.createMainSheet();
      
      // Create summary sheet if requested
      if (this.data.exportOptions.includeSummary) {
        this.createSummarySheet();
      }
      
      // Create category sheets if requested
      if (this.options.multipleSheetsBy === 'category') {
        this.createCategorySheets();
      }
      
      // Generate buffer
      return await this.workbook.xlsx.writeBuffer() as Buffer;
    } catch (error) {
      console.error('Excel generation failed:', error);
      throw new Error('Failed to generate Excel file');
    }
  }

  public async save(filename?: string): Promise<void> {
    const buffer = await this.generate();
    const defaultFilename = `${this.data.reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Create download
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

// Export utility functions
export async function exportToExcel(
  data: ExportData,
  options?: Partial<ExcelOptions>
): Promise<Buffer> {
  const exporter = new EnhancedExcelExporter(data, options);
  return await exporter.generate();
}

export async function saveExcelReport(
  data: ExportData,
  filename?: string,
  options?: Partial<ExcelOptions>
): Promise<void> {
  const exporter = new EnhancedExcelExporter(data, options);
  await exporter.save(filename);
}

// CSV Export utility
export function exportToCSV(data: ExportData): string {
  const headers = ['Code', 'Account Name', 'Category', 'Debit', 'Credit', 'Balance'];
  const csvRows = [headers.join(',')];
  
  data.accounts.forEach(account => {
    const row = [
      account.code,
      `"${account.name}"`,
      account.category || 'General',
      account.debit,
      account.credit,
      account.balance
    ];
    csvRows.push(row.join(','));
  });
  
  // Add totals row
  csvRows.push([
    '',
    '"TOTALS"',
    '',
    data.totalDebits,
    data.totalCredits,
    data.totalDebits - data.totalCredits
  ].join(','));
  
  return csvRows.join('\n');
}

export function saveCSVReport(data: ExportData, filename?: string): void {
  const csv = exportToCSV(data);
  const defaultFilename = `${data.reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
