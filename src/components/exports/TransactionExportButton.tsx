import React, { useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/useTransactions";
import { useEnhancedCompanySettings } from "@/hooks/useEnhancedCompanySettings";
import { exportTransactionsToExcel } from "@/lib/transactionExporter";

export function TransactionExportButton({ className }: { className?: string }) {
  const { toast } = useToast();
  const { transactions, loading } = useTransactions();
  const { settings } = useEnhancedCompanySettings();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (filtered = false) => {
    if (loading) {
      toast({
        title: "Please wait",
        description: "Transactions are still loading...",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Filter transactions if needed
      const filteredTransactions = filtered 
        ? transactions.filter(tx => 
            tx.lines.some(line => 
              line.account_code === '1010' || line.account_code === '1020'
            )
          ).map(tx => ({
            ...tx,
            lines: tx.lines.filter(line => 
              line.account_code === '1010' || line.account_code === '1020'
            )
          }))
        : transactions;

      const exportData = {
        transactions: filteredTransactions.map((tx) => ({
          reference: tx.reference_number || "",
          date: tx.transaction_date,
          description: tx.description,
          lines: tx.lines.map((line) => ({
            accountCode: line.account_code,
            accountName: line.account_name || "Unknown Account",
            debit: line.debit_amount,
            credit: line.credit_amount,
          })),
        })),
        companySettings: {
          name: settings?.company_name || "QSA Solutions",
          logo: settings?.logo_base64 || settings?.logo_path || "",
          primaryColor: settings?.primary_color || "#a1052d",
          address: settings?.address,
          phone: settings?.phone,
          email: settings?.email,
          website: settings?.website,
        },
        reportTitle: filtered ? "Cash & Bank Transactions" : "All Transactions",
        reportDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };

      const filePrefix = filtered ? "Cash_Bank_Transactions" : "Transactions";
      const filename = `${filePrefix}_${new Date().toISOString().split("T")[0]}.xlsx`;

      await exportTransactionsToExcel(exportData, filename);

      const successMessage = filtered 
        ? "Cash & Bank transactions exported as Excel file" 
        : "All transactions exported as Excel file";
      toast({ title: "Export Successful", description: successMessage });
    } catch (err) {
      console.error("Transaction export failed:", err);
      toast({ title: "Export Failed", description: "Failed to export transactions", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`gap-2 w-full sm:w-auto ${className || ''}`} 
          disabled={loading || isExporting}
        >
          <Download className="h-4 w-4" />
          <span className="sm:hidden">Export</span>
          <span className="hidden sm:inline">Export Transactions</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleExport(false)}>
          <Download className="h-4 w-4 mr-2" />
          Export All Transactions
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(true)}>
          <Download className="h-4 w-4 mr-2" />
          Export Cash & Bank Only
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
