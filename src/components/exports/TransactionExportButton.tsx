import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/useTransactions";
import { useEnhancedCompanySettings } from "@/hooks/useEnhancedCompanySettings";
import { saveExcelReport } from "@/lib/enhancedExcelExporter";

export function TransactionExportButton({ className }: { className?: string }) {
  const { toast } = useToast();
  const { transactions, loading } = useTransactions();
  const { settings } = useEnhancedCompanySettings();

  const handleExport = async () => {
    if (loading) {
      toast({
        title: "Please wait",
        description: "Transactions are still loading...",
        variant: "destructive",
      });
      return;
    }

    try {
      const exportData = {
        transactions: transactions.map((tx) => ({
          reference: tx.reference_number,
          date: tx.transaction_date,
          description: tx.description,
          lines: tx.lines.map((line) => ({
            accountCode: line.account_code,
            accountName: line.account_name,
            debit: line.debit_amount,
            credit: line.credit_amount,
          })),
        })),
        companySettings: {
          name: settings?.company_name || "QSA Solutions",
          logo: settings?.logo_base64 || settings?.logo_path || "",
          primaryColor: settings?.primary_color || "#a1052d",
        },
        reportTitle: "All Transactions",
        reportDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };

      const filename = `Transactions_${new Date().toISOString().split("T")[0]}`;

      await saveExcelReport(exportData, `${filename}.xlsx`, {
        format: "excel-advanced",
        includeLogo: true,
        colorTheme: true,
        multipleSheetsBy: "none",
      });

      toast({ title: "Export Successful", description: "All transactions exported as Excel file" });
    } catch (err) {
      console.error("Transaction export failed:", err);
      toast({ title: "Export Failed", description: "Failed to export transactions", variant: "destructive" });
    }
  };

  return (
    <Button variant="outline" size="sm" className={`gap-2 ${className || ''}`} onClick={handleExport} disabled={loading}>
      <Download className="h-4 w-4" />
      Export All Transactions
    </Button>
  );
}
