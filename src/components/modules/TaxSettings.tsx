import { useEffect, useState } from "react";
import { Calculator, Save, Percent, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useTaxSettings } from "@/hooks/useTaxSettings";

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  isActive: boolean;
  description: string;
}

export default function TaxSettings() {
  const { toast } = useToast();
  const { taxSettings, updateTaxSettings } = useTaxSettings();
  
  const [taxType, setTaxType] = useState<'inclusive' | 'exclusive'>('exclusive');
  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    {
      id: '1',
      name: 'VAT (Standard)',
      rate: 18,
      isActive: true,
      description: 'Value Added Tax - Standard rate for most goods and services'
    },
    {
      id: '2', 
      name: 'VAT (Reduced)',
      rate: 10,
      isActive: false,
      description: 'Reduced VAT rate for specific items'
    },
    {
      id: '3',
      name: 'Service Tax',
      rate: 5,
      isActive: false,
      description: 'Tax on professional services'
    }
  ]);

  const [newTaxRate, setNewTaxRate] = useState({
    name: '',
    rate: 0,
    description: ''
  });

  // Initialize UI from persisted tax settings
  useEffect(() => {
    if (taxSettings) {
      setTaxType(taxSettings.taxType || 'exclusive');
      setTaxRates(prev => {
        const activeRate = taxSettings.taxRate ?? 0;
        return prev.map(r => ({ ...r, isActive: r.rate === activeRate }));
      });
    }
  }, [taxSettings]);

  const handleTaxTypeChange = (checked: boolean) => {
    setTaxType(checked ? 'inclusive' : 'exclusive');
  };

  const handleUpdateTaxRate = (id: string, field: keyof TaxRate, value: string | number | boolean) => {
    setTaxRates(prev => prev.map(rate => 
      rate.id === id ? { ...rate, [field]: value } : rate
    ));
  };

  const handleAddTaxRate = () => {
    if (!newTaxRate.name.trim() || newTaxRate.rate <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid tax name and rate",
        variant: "destructive"
      });
      return;
    }

    const newRate: TaxRate = {
      id: Date.now().toString(),
      name: newTaxRate.name,
      rate: newTaxRate.rate,
      isActive: false,
      description: newTaxRate.description
    };

    setTaxRates(prev => [...prev, newRate]);
    setNewTaxRate({ name: '', rate: 0, description: '' });
    
    toast({
      title: "Success",
      description: "Tax rate added successfully"
    });
  };

  const handleDeleteTaxRate = (id: string) => {
    setTaxRates(prev => prev.filter(rate => rate.id !== id));
    toast({
      title: "Success", 
      description: "Tax rate removed successfully"
    });
  };

  const handleSaveSettings = async () => {
    const active = taxRates.find(r => r.isActive);
    const effectiveRate = active ? active.rate : 0;
    try {
      await updateTaxSettings({ taxType, taxRate: effectiveRate, taxName: active?.name || 'VAT', taxDescription: active?.description || '' });
      toast({ title: "Success", description: `Saved: ${taxType} at ${effectiveRate}%` });
    } catch (e) {
      toast({ title: "Error", description: "Failed to save tax settings", variant: "destructive" });
    }
  };

  const calculateTaxExample = (amount: number, rate: number) => {
    if (taxType === 'inclusive') {
      const taxAmount = (amount * rate) / (100 + rate);
      return {
        netAmount: amount - taxAmount,
        taxAmount: taxAmount,
        totalAmount: amount
      };
    } else {
      const taxAmount = (amount * rate) / 100;
      return {
        netAmount: amount,
        taxAmount: taxAmount,
        totalAmount: amount + taxAmount
      };
    }
  };

  const activeTaxRates = taxRates.filter(rate => rate.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Tax Settings
          </h1>
          <p className="text-muted-foreground mt-2">Configure tax rates and calculation methods</p>
        </div>
        
        <Button onClick={handleSaveSettings} className="gap-2 h-12 px-8 bg-gradient-primary hover:shadow-glow transition-all">
          <Save className="h-5 w-5" />
          Save Settings
        </Button>
      </div>

      {/* Tax Type Configuration */}
      <Card className="shadow-elevated border-0 bg-gradient-secondary/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5 text-primary" />
            Tax Calculation Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Label htmlFor="tax-type" className="text-lg font-semibold text-foreground">
                    Tax {taxType === 'inclusive' ? 'Inclusive' : 'Exclusive'}
                  </Label>
                  <Badge variant={taxType === 'inclusive' ? 'default' : 'outline'} className="text-sm flex-shrink-0">
                    {taxType === 'inclusive' ? 'Inclusive' : 'Exclusive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {taxType === 'inclusive' 
                    ? 'Tax is included in the displayed price. The system will calculate the net amount by removing tax.'
                    : 'Tax is added to the base price. The system will calculate tax on top of the displayed amount.'
                  }
                </p>
              </div>
              <div className="flex-shrink-0">
                <Switch
                  id="tax-type"
                  checked={taxType === 'inclusive'}
                  onCheckedChange={handleTaxTypeChange}
                  className="scale-125"
                />
              </div>
            </div>
          </div>

          {/* Tax Calculation Example */}
          <div className="p-6 bg-info/10 border border-info/30 rounded-lg">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-info" />
              Example Calculation (18% VAT on TZS 100,000)
            </h3>
            {(() => {
              const example = calculateTaxExample(100000, 18);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="text-center p-3 bg-background rounded-md border">
                    <p className="font-semibold text-foreground">Net Amount</p>
                    <p className="text-lg font-mono text-muted-foreground">
                      TZS {example.netAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-md border">
                    <p className="font-semibold text-foreground">Tax Amount</p>
                    <p className="text-lg font-mono text-muted-foreground">
                      TZS {example.taxAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-primary/10 rounded-md border border-primary/30">
                    <p className="font-semibold text-foreground">Total Amount</p>
                    <p className="text-lg font-mono font-bold text-primary">
                      TZS {example.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Tax Rates Management */}
      <Card className="shadow-card border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Percent className="h-5 w-5 text-primary" />
            Tax Rates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Tax Rates */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg">Current Tax Rates</h3>
            <div className="space-y-3">
              {taxRates.map(rate => (
                <div key={rate.id} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground truncate">{rate.name}</h4>
                        <Badge variant={rate.isActive ? 'default' : 'outline'} className="text-xs flex-shrink-0">
                          {rate.rate}%
                        </Badge>
                        {rate.isActive && (
                          <Badge variant="default" className="text-xs flex-shrink-0">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground break-words">{rate.description}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Switch
                        checked={rate.isActive}
                        onCheckedChange={(checked) => handleUpdateTaxRate(rate.id, 'isActive', checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTaxRate(rate.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Tax Rate */}
          <div className="border-t border-border pt-6">
            <h3 className="font-semibold text-foreground text-lg mb-4">Add New Tax Rate</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tax-name" className="text-sm font-semibold text-foreground">Tax Name</Label>
                <Input
                  id="tax-name"
                  value={newTaxRate.name}
                  onChange={(e) => setNewTaxRate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Export Tax"
                  className="mt-1.5 h-11"
                />
              </div>
              <div>
                <Label htmlFor="tax-rate" className="text-sm font-semibold text-foreground">Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={newTaxRate.rate || ''}
                  onChange={(e) => setNewTaxRate(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="mt-1.5 h-11"
                />
              </div>
              <div className="flex items-end sm:col-span-2 lg:col-span-1">
                <Button onClick={handleAddTaxRate} className="h-11 w-full">
                  Add Tax Rate
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="tax-description" className="text-sm font-semibold text-foreground">Description</Label>
              <Input
                id="tax-description"
                value={newTaxRate.description}
                onChange={(e) => setNewTaxRate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of when this tax applies"
                className="mt-1.5 h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Tax Summary */}
      {activeTaxRates.length > 0 && (
        <Card className="shadow-card border-0 bg-gradient-primary/10 border-primary/30">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-foreground">Active Tax Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeTaxRates.map(rate => (
                <div key={rate.id} className="text-center p-4 bg-background rounded-lg border border-primary/20">
                  <p className="font-semibold text-foreground text-lg">{rate.rate}%</p>
                  <p className="text-sm text-muted-foreground truncate">{rate.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Tax settings will apply to all new transactions. 
          Existing transactions will not be affected. Please consult with your accountant 
          before making changes to ensure compliance with Tanzanian tax regulations.
        </AlertDescription>
      </Alert>
    </div>
  );
}