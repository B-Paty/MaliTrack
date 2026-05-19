/**
 * Company Branding Types
 * Comprehensive interfaces for company branding system
 */

export interface Account {
  code: string;
  name: string;
  debit: number;
  credit: number;
  balance: number;
  category?: string;
  account_type?: string;
}

export interface CompanySettings {
  id?: string;
  name: string;
  logo: string; // base64 or URL
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  logoPosition?: 'left' | 'center' | 'right';
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface ExportOptions {
  format: 'pdf' | 'excel-basic' | 'excel-advanced' | 'csv';
  includeLogo: boolean;
  includeSummary: boolean;
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  colorTheme: boolean;
  showBalances: boolean;
  groupByCategory: boolean;
  includeZeroBalances: boolean;
}

export interface ExportData {
  accounts: Account[];
  companySettings: CompanySettings;
  exportOptions: ExportOptions;
  reportTitle: string;
  reportDate: string;
  totalDebits: number;
  totalCredits: number;
}

export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}

export interface LogoSettings {
  file?: File;
  base64?: string;
  url?: string;
  width?: number;
  height?: number;
  position: 'left' | 'center' | 'right';
  maxWidth: number;
  maxHeight: number;
}

export interface BrandingPreset {
  name: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  description: string;
}
