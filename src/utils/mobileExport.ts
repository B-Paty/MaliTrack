import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export interface ExportOptions {
  filename: string;
  content: string;
  mimeType: string;
  title?: string;
}

export class MobileExportService {
  static async exportFile(options: ExportOptions): Promise<void> {
    const { filename, content, mimeType, title = 'Export File' } = options;

    if (Capacitor.isNativePlatform()) {
      try {
        // Save file to device storage
        const result = await Filesystem.writeFile({
          path: filename,
          data: content,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });

        // Share the file
        await Share.share({
          title,
          text: `Exported: ${filename}`,
          url: result.uri,
          dialogTitle: title
        });

        return;
      } catch (error) {
        console.error('Native export failed:', error);
        // Fall back to web export
      }
    }

    // Web fallback - download file
    this.downloadFile(filename, content, mimeType);
  }

  static downloadFile(filename: string, content: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  static async exportPDF(filename: string, htmlContent: string): Promise<void> {
    // For now, export as HTML - PDF generation would require additional libraries
    await this.exportFile({
      filename: filename.replace('.pdf', '.html'),
      content: htmlContent,
      mimeType: 'text/html',
      title: 'Export Report'
    });
  }

  static async exportCSV(filename: string, csvContent: string): Promise<void> {
    await this.exportFile({
      filename,
      content: csvContent,
      mimeType: 'text/csv',
      title: 'Export Data'
    });
  }

  static async exportJSON(filename: string, data: any): Promise<void> {
    const jsonContent = JSON.stringify(data, null, 2);
    await this.exportFile({
      filename,
      content: jsonContent,
      mimeType: 'application/json',
      title: 'Export Data'
    });
  }
}