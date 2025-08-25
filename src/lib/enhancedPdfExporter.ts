/**
 * Enhanced PDF Exporter with Company Branding
 * Professional PDF generation with logo, colors, and comprehensive formatting
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExportData, Account } from '@/types/branding';
import { formatCurrency } from '@/lib/formatters';
import { hexToHsl } from '@/lib/brandingUtils';

interface PDFOptions {
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  includeLogo: boolean;
  includeHeader: boolean;
  includeFooter: boolean;
  colorTheme: boolean;
}

export class EnhancedPDFExporter {
  private doc: jsPDF;
  private data: ExportData;
  private options: PDFOptions;
  private pageWidth: number;
  private pageHeight: number;
  private margins = { top: 20, right: 20, bottom: 20, left: 20 };
  private brandColors: { primary: string; secondary: string; text: string };

  constructor(data: ExportData, options: Partial<PDFOptions> = {}) {
    this.data = data;
    this.options = {
      pageSize: 'A4',
      orientation: 'portrait',
      includeLogo: true,
      includeHeader: true,
      includeFooter: true,
      colorTheme: true,
      ...options
    };

    // Initialize PDF document
    this.doc = new jsPDF({
      orientation: this.options.orientation,
      unit: 'mm',
      format: this.options.pageSize
    });

    // Set page dimensions
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();

    // Setup brand colors
    this.setupBrandColors();
  }

  private setupBrandColors(): void {
    const primaryColor = this.data.companySettings.primaryColor || '#a1052d';
    const { h, s, l } = hexToHsl(primaryColor);
    
    this.brandColors = {
      primary: primaryColor,
      secondary: this.data.companySettings.secondaryColor || '#f8f9fa',
      text: l > 50 ? '#1f2937' : '#374151'
    };
  }

  private async addLogo(): Promise<void> {
    if (!this.options.includeLogo || !this.data.companySettings.logo) return;

    try {
      const logoData = this.data.companySettings.logo;
      const logoWidth = 40;
      const logoHeight = 15;
      
      // Position based on logo alignment
      let xPos = this.margins.left;
      if (this.data.companySettings.logoPosition === 'center') {
        xPos = (this.pageWidth - logoWidth) / 2;
      } else if (this.data.companySettings.logoPosition === 'right') {
        xPos = this.pageWidth - this.margins.right - logoWidth;
      }

      this.doc.addImage(logoData, 'PNG', xPos, this.margins.top, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Failed to add logo to PDF:', error);
    }
  }

  private addHeader(): void {
    if (!this.options.includeHeader) return;

    const startY = this.margins.top + (this.options.includeLogo ? 20 : 0);
    
    // Company name
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    if (this.options.colorTheme) {
      this.doc.setTextColor(this.brandColors.primary);
    }
    this.doc.text(this.data.companySettings.name, this.margins.left, startY);

    // Company details
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(this.brandColors.text);
    
    let detailY = startY + 8;
    
    if (this.data.companySettings.address) {
      this.doc.text(this.data.companySettings.address, this.margins.left, detailY);
      detailY += 4;
    }
    
    const contactInfo = [];
    if (this.data.companySettings.phone) contactInfo.push(`Phone: ${this.data.companySettings.phone}`);
    if (this.data.companySettings.email) contactInfo.push(`Email: ${this.data.companySettings.email}`);
    if (this.data.companySettings.website) contactInfo.push(`Web: ${this.data.companySettings.website}`);
    
    if (contactInfo.length > 0) {
      this.doc.text(contactInfo.join(' | '), this.margins.left, detailY);
      detailY += 4;
    }

    // Report title and date
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    if (this.options.colorTheme) {
      this.doc.setTextColor(this.brandColors.primary);
    }
    this.doc.text(this.data.reportTitle, this.margins.left, detailY + 8);

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(this.brandColors.text);
    this.doc.text(`Generated on: ${this.data.reportDate}`, this.margins.left, detailY + 16);

    // Add separator line
    if (this.options.colorTheme) {
      this.doc.setDrawColor(this.brandColors.primary);
    }
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margins.left, detailY + 20, this.pageWidth - this.margins.right, detailY + 20);
  }

  private addAccountsTable(): void {
    const startY = this.margins.top + (this.options.includeHeader ? 80 : 20);
    
    // Prepare table data
    const tableData = this.data.accounts.map(account => [
      account.code,
      account.name,
      account.category || 'General',
      formatCurrency(account.debit),
      formatCurrency(account.credit),
      formatCurrency(account.balance)
    ]);

    // Add totals row
    tableData.push([
      '',
      'TOTALS',
      '',
      formatCurrency(this.data.totalDebits),
      formatCurrency(this.data.totalCredits),
      formatCurrency(this.data.totalDebits - this.data.totalCredits)
    ]);

    const tableOptions: any = {
      startY,
      head: [['Code', 'Account Name', 'Category', 'Debit', 'Credit', 'Balance']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: this.brandColors.text
      },
      headStyles: {
        fillColor: this.options.colorTheme ? this.brandColors.primary : '#f3f4f6',
        textColor: this.options.colorTheme ? '#ffffff' : '#374151',
        fontStyle: 'bold',
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' }, // Code
        1: { cellWidth: 'auto' }, // Account Name
        2: { cellWidth: 25 }, // Category
        3: { cellWidth: 25, halign: 'right' }, // Debit
        4: { cellWidth: 25, halign: 'right' }, // Credit
        5: { cellWidth: 25, halign: 'right' } // Balance
      },
      alternateRowStyles: {
        fillColor: '#f9fafb'
      },
      margin: { left: this.margins.left, right: this.margins.right },
      didDrawPage: (data: any) => {
        this.addFooter(data.pageNumber);
      }
    };

    // Highlight totals row
    tableOptions.didParseCell = (data: any) => {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = this.options.colorTheme ? this.brandColors.secondary : '#e5e7eb';
        if (this.options.colorTheme) {
          data.cell.styles.textColor = this.brandColors.primary;
        }
      }
    };

    autoTable(this.doc, tableOptions);
  }

  private addSummarySection(): void {
    if (!this.data.exportOptions.includeSummary) return;

    const finalY = (this.doc as any).lastAutoTable.finalY + 10;
    
    // Summary title
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    if (this.options.colorTheme) {
      this.doc.setTextColor(this.brandColors.primary);
    }
    this.doc.text('Summary', this.margins.left, finalY);

    // Summary data
    const summaryData = [
      ['Total Accounts', this.data.accounts.length.toString()],
      ['Total Debits', formatCurrency(this.data.totalDebits)],
      ['Total Credits', formatCurrency(this.data.totalCredits)],
      ['Net Balance', formatCurrency(this.data.totalDebits - this.data.totalCredits)]
    ];

    autoTable(this.doc, {
      startY: finalY + 5,
      body: summaryData,
      theme: 'plain',
      styles: {
        fontSize: 10,
        textColor: this.brandColors.text
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 40, halign: 'right' }
      },
      margin: { left: this.margins.left }
    });
  }

  private addFooter(pageNumber: number): void {
    if (!this.options.includeFooter) return;

    const footerY = this.pageHeight - this.margins.bottom;
    
    // Page number
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(this.brandColors.text);
    this.doc.text(
      `Page ${pageNumber}`,
      this.pageWidth - this.margins.right - 20,
      footerY
    );

    // Company branding in footer
    this.doc.text(
      `Generated by ${this.data.companySettings.name}`,
      this.margins.left,
      footerY
    );

    // Footer line
    if (this.options.colorTheme) {
      this.doc.setDrawColor(this.brandColors.primary);
    }
    this.doc.setLineWidth(0.2);
    this.doc.line(this.margins.left, footerY - 5, this.pageWidth - this.margins.right, footerY - 5);
  }

  public async generate(): Promise<Blob> {
    try {
      // Add logo first
      await this.addLogo();
      
      // Add header
      this.addHeader();
      
      // Add main content
      this.addAccountsTable();
      
      // Add summary
      this.addSummarySection();
      
      // Return PDF as blob
      return this.doc.output('blob');
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  public async save(filename?: string): Promise<void> {
    await this.generate();
    const defaultFilename = `${this.data.reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    this.doc.save(filename || defaultFilename);
  }
}

// Export utility function
export async function exportToPDF(
  data: ExportData,
  options?: Partial<PDFOptions>
): Promise<Blob> {
  const exporter = new EnhancedPDFExporter(data, options);
  return await exporter.generate();
}

export async function savePDFReport(
  data: ExportData,
  filename?: string,
  options?: Partial<PDFOptions>
): Promise<void> {
  const exporter = new EnhancedPDFExporter(data, options);
  await exporter.save(filename);
}
