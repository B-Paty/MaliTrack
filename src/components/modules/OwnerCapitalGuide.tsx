import { Info, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * OwnerCapitalGuide
 * Explains how to properly record owner's capital contributions using double-entry bookkeeping
 */
export default function OwnerCapitalGuide() {
  return (
    <Card className="shadow-card border-info/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-info">
          <Info className="h-5 w-5" />
          Owner's Capital - Double Entry Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-info/5 p-4 rounded-lg">
          <p className="text-sm text-foreground/80 mb-3">
            When an owner invests money into the business, you need to record <strong>both sides</strong> of the transaction:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Badge variant="outline" className="border-success text-success">
                <DollarSign className="h-3 w-3 mr-1" />
                DEBIT (What the business receives)
              </Badge>
              <div className="bg-success/10 p-3 rounded border border-success/20">
                <p className="font-medium text-success">Cash Account</p>
                <p className="text-xs text-success/80">Debit: $100,000</p>
                <p className="text-xs text-foreground/70 mt-1">The business receives cash from the owner</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline" className="border-primary text-primary">
                <DollarSign className="h-3 w-3 mr-1" />
                CREDIT (Source of the money)
              </Badge>
              <div className="bg-primary/10 p-3 rounded border border-primary/20">
                <p className="font-medium text-primary">Owner's Capital</p>
                <p className="text-xs text-primary/80">Credit: $100,000</p>
                <p className="text-xs text-foreground/70 mt-1">Shows the owner's investment/equity</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-warning/5 p-4 rounded-lg border border-warning/20">
          <h4 className="font-semibold text-warning mb-2">Important Notes:</h4>
          <ul className="text-sm text-foreground/80 space-y-1 list-disc list-inside">
            <li>The money comes from the owner's personal funds (outside the business)</li>
            <li>Both entries must be equal (debits = credits)</li>
            <li>This increases both assets (cash) and equity (owner's capital)</li>
            <li>Use the Journal Entry feature to record this transaction properly</li>
          </ul>
        </div>

        <div className="bg-accent/5 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Example Journal Entry:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Date: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Description: Owner's initial capital contribution</span>
            </div>
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between font-mono">
                <span>Cash (1000) - Debit</span>
                <span>$100,000</span>
              </div>
              <div className="flex justify-between font-mono ml-4">
                <span>Owner's Capital (3000) - Credit</span>
                <span>$100,000</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}