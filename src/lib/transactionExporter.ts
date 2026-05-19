/**
 * Transaction Export Utility
 * Handles exporting transaction data to Excel with company branding
 */

import * as ExcelJS from 'exceljs';
import { formatCurrency } from '@/lib/formatters';

interface TransactionLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

interface TransactionData {
  reference: string;
  date: string;
  description: string;
  lines: TransactionLine[];
}

interface CompanySettings {
  name: string;
  logo: string;
  primaryColor: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

interface TransactionExportData {
  transactions: TransactionData[];
  companySettings: CompanySettings;
  reportTitle: string;
  reportDate: string;
}

export class TransactionExporter {
  private workbook: ExcelJS.Workbook;
  private data: TransactionExportData;
  private primaryColor: string;

  constructor(data: TransactionExportData) {
    this.data = data;
    this.workbook = new ExcelJS.Workbook();
    this.primaryColor = data.companySettings.primaryColor.replace('#', '');
    this.setupWorkbookProperties();
  }

  private setupWorkbookProperties(): void {
    this.workbook.creator = this.data.companySettings.name;
    this.workbook.created = new Date();
    this.workbook.modified = new Date();
  }

  private async addLogo(worksheet: ExcelJS.Worksheet): Promise<void> {
    if (!this.data.companySettings.logo) return;

    try {
      const logoData = this.data.companySettings.logo;
      if (logoData.startsWith('data:')) {
        const base64Data = logoData.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const imageId = this.workbook.addImage({
          buffer: imageBuffer,
          extension: 'png',
        });

        worksheet.addImage(imageId, {
          tl: { col: 0, row: 0 },
          ext: { width: 150, height: 60 },
          editAs: 'oneCell'
        });
      }
    } catch (error) {
      console.warn('Failed to add logo to Excel:', error);
    }
  }

  private addHeaderContent(worksheet: ExcelJS.Worksheet): void {
    // Company name
    worksheet.getCell('A1').value = this.data.companySettings.name;
    worksheet.getCell('A1').font = {
      name: 'Arial',
      size: 18,
      bold: true,
      color: { argb: 'FF' + this.primaryColor }
    };

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
    worksheet.getCell('A4').font = {
      name: 'Arial',
      size: 14,
      bold: true,
      color: { argb: 'FF' + this.primaryColor }
    };

    worksheet.getCell('A5').value = `Generated on: ${this.data.reportDate}`;
    worksheet.getCell('A5').font = {
      name: 'Arial',
      size: 10,
      color: { argb: 'FF666666' }
    };
  }

  private createTransactionsTable(worksheet: ExcelJS.Worksheet, startRow: number = 7): void {
    // Headers
    const headers = ['Reference', 'Date', 'Description', 'Account Code', 'Account Name', 'Debit', 'Credit'];
    headers.forEach((header, index) => {
      const cell = worksheet.getCell(startRow, index + 1);
      cell.value = header;
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF' + this.primaryColor }
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
    let currentRow = startRow + 1;
    let totalDebits = 0;
    let totalCredits = 0;

    this.data.transactions.forEach((transaction, transIndex) => {
      transaction.lines.forEach((line, lineIndex) => {
        const rowData = [
          lineIndex === 0 ? transaction.reference : '', // Only show reference on first line
          lineIndex === 0 ? transaction.date : '', // Only show date on first line
          lineIndex === 0 ? transaction.description : '', // Only show description on first line
          line.accountCode,
          line.accountName,
          line.debit,
          line.credit
        ];

        totalDebits += line.debit;
        totalCredits += line.credit;

        rowData.forEach((value, colIndex) => {
          const cell = worksheet.getCell(currentRow, colIndex + 1);
          cell.value = value;
          
          // Format currency columns
          if (colIndex >= 5) {
            cell.numFmt = '"Tsh "#,##0.00';
          }

          // Add borders
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };

          // Alternate row colors
          if (transIndex % 2 === 1) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF9FAFB' }
            };
          }
        });

        currentRow++;
      });
    });

    // Totals row
    const totalsData = ['', '', 'TOTALS', '', '', totalDebits, totalCredits];
    totalsData.forEach((value, colIndex) => {
      const cell = worksheet.getCell(currentRow, colIndex + 1);
      cell.value = value;
      cell.font = { bold: true };
      
      // Format currency columns
      if (colIndex >= 5 && typeof value === 'number') {
        cell.numFmt = '"Tsh "#,##0.00';
      }

      // Special styling for totals
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' }
      };
      
      cell.border = {
        top: { style: 'thick' },
        left: { style: 'thin' },
        bottom: { style: 'thick' },
        right: { style: 'thin' }
      };
    });

    // Auto-fit columns
    worksheet.columns.forEach((_, index) => {
      if (index === 2 || index === 4) { // Description and Account Name columns
        worksheet.getColumn(index + 1).width = 25;
      } else if (index >= 5) { // Currency columns
        worksheet.getColumn(index + 1).width = 15;
      } else {
        worksheet.getColumn(index + 1).width = 12;
      }
    });
  }

  public async generate(): Promise<Buffer> {
    try {
      const worksheet = this.workbook.addWorksheet('Transactions');
      
      // Add logo
      await this.addLogo(worksheet);
      
      // Add header content
      this.addHeaderContent(worksheet);
      
      // Create transactions table
      this.createTransactionsTable(worksheet);
      
      // Generate buffer
      return await this.workbook.xlsx.writeBuffer() as Buffer;
    } catch (error) {
      console.error('Transaction Excel generation failed:', error);
      throw new Error('Failed to generate transaction Excel file');
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

// Export utility function
export async function exportTransactionsToExcel(
  data: TransactionExportData,
  filename?: string
): Promise<void> {
  const exporter = new TransactionExporter(data);
  await exporter.save(filename);
}