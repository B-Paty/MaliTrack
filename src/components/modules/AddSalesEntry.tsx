import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { ShoppingCart, Package } from "lucide-react";

export default function AddSalesEntry() {
  const { createTransaction } = useTransactions();

  const handleAddSalesEntry = async () => {
    const today = new Date().toISOString().split('T')[0];

    // Sales Transaction: Debit Cash, Credit Sales Revenue
    const salesTransaction = {
      transaction_date: today,
      description: 'Sale of 2kg Rice @ Tsh 3,500 per kg',
      lines: [
        {
          account_code: '1010', // Cash in Hand
          debit_amount: 7000,   // 2kg * 3500 = 7000
          credit_amount: 0
        },
        {
          account_code: '4010', // Sales Revenue
          debit_amount: 0,
          credit_amount: 7000   // 2kg * 3500 = 7000
        }
      ]
    };

    // COGS Transaction: Debit COGS, Credit Inventory
    const cogsTransaction = {
      transaction_date: today,
      description: 'Cost of Goods Sold - 2kg Rice @ Tsh 2,600 per kg',
      lines: [
        {
          account_code: '5010', // Cost of Goods Sold
          debit_amount: 5200,   // 2kg * 2600 = 5200
          credit_amount: 0
        },
        {
          account_code: '1040', // Inventory
          debit_amount: 0,
          credit_amount: 5200   // 2kg * 2600 = 5200
        }
      ]
    };

    try {
      await createTransaction(salesTransaction);
      await createTransaction(cogsTransaction);
    } catch (error) {
      console.error('Failed to add sales entry:', error);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Add Rice Sales Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-foreground/70">This will add the following transactions:</p>
          <div className="space-y-1 text-xs">
            <p>📈 <strong>Sale:</strong> 2kg Rice @ Tsh 3,500/kg = Tsh 7,000</p>
            <p>📦 <strong>COGS:</strong> 2kg Rice @ Tsh 2,600/kg = Tsh 5,200</p>
            <p>💰 <strong>Profit:</strong> Tsh 1,800</p>
          </div>
        </div>
        
        <Button 
          onClick={handleAddSalesEntry} 
          className="w-full gap-2"
        >
          <Package className="h-4 w-4" />
          Record Rice Sale
        </Button>
      </CardContent>
    </Card>
  );
}