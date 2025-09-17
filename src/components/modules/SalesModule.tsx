import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Calculator, ShoppingCart, Package, User, CreditCard, DollarSign, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { useInventorySettings } from '@/hooks/useInventorySettings';
import { useSales, type SaleItem } from '@/hooks/useSales';
import { useInvoices, type CreateInvoiceData } from '@/hooks/useInvoices';
import { formatCurrency } from '@/lib/formatters';

export default function SalesModule() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { settings: inventorySettings } = useInventorySettings(user?.id || '');
  const { createSale, getAvailableStock, loading } = useSales(user?.id || '');
  const { createInvoice, generateInvoiceNumber } = useInvoices();

  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'bank_transfer'>('cash');
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(18); // Default VAT rate
  const [completedSale, setCompletedSale] = useState<any>(null);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = saleItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    
    return {
      subtotal,
      taxAmount,
      totalAmount
    };
  }, [saleItems, taxRate]);

  const addProductToSale = (product: any) => {
    const existingItem = saleItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      // Update quantity
      setSaleItems(prev => prev.map(item => 
        item.product_id === product.id 
          ? { 
              ...item, 
              quantity: item.quantity + 1,
              total_price: (item.quantity + 1) * item.unit_price
            }
          : item
      ));
    } else {
      // Add new item
      const newItem: SaleItem = {
        product_id: product.id,
        product_name: product.name,
        product_unit: product.unit,
        quantity: 1,
        unit_price: product.defaultPrice || 0,
        total_price: product.defaultPrice || 0
      };
      setSaleItems(prev => [...prev, newItem]);
    }
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromSale(productId);
      return;
    }

    setSaleItems(prev => prev.map(item => 
      item.product_id === productId 
        ? { 
            ...item, 
            quantity,
            total_price: quantity * item.unit_price
          }
        : item
    ));
  };

  const updateItemPrice = (productId: string, price: number) => {
    setSaleItems(prev => prev.map(item => 
      item.product_id === productId 
        ? { 
            ...item, 
            unit_price: price,
            total_price: item.quantity * price
          }
        : item
    ));
  };

  const removeItemFromSale = (productId: string) => {
    setSaleItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const handleCreateSale = async () => {
    if (saleItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please add at least one product to the sale",
        variant: "destructive"
      });
      return;
    }

    if (totals.totalAmount <= 0) {
      toast({
        title: "Invalid total",
        description: "Total amount must be greater than zero",
        variant: "destructive"
      });
      return;
    }

    try {
      const saleData = {
        sale_date: new Date().toISOString().split('T')[0],
        customer_name: customerInfo.name || undefined,
        customer_phone: customerInfo.phone || undefined,
        customer_address: customerInfo.address || undefined,
        payment_method: paymentMethod,
        subtotal: totals.subtotal,
        tax_amount: totals.taxAmount,
        total_amount: totals.totalAmount,
        notes: notes || undefined,
        status: 'completed' as const,
        items: saleItems
      };

      const sale = await createSale(saleData);
      if (sale?.id) {
        setCompletedSale({ ...saleData, id: sale.id });
      }

      toast({
        title: "Sale completed successfully!",
        description: `Sale total: ${formatCurrency(totals.totalAmount)}`,
      });

      // Reset form
      setSaleItems([]);
      setCustomerInfo({ name: '', phone: '', address: '' });
      setPaymentMethod('cash');
      setNotes('');
    } catch (error) {
      toast({
        title: "Error creating sale",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleGenerateInvoice = async () => {
    if (!completedSale) return;

    try {
      const today = new Date();
      const dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      const invoiceData: CreateInvoiceData = {
        invoiceNumber: await generateInvoiceNumber(),
        clientName: completedSale.customer_name || 'Walk-in Customer',
        clientEmail: undefined, // Sales module doesn't capture email
        clientPhone: completedSale.customer_phone,
        clientAddress: completedSale.customer_address,
        dateOfService: completedSale.sale_date,
        dateOfInvoice: today.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        subtotal: completedSale.subtotal,
        taxAmount: completedSale.tax_amount,
        totalAmount: completedSale.total_amount,
        termsAndConditions: `Payment due within 30 days. ${completedSale.payment_method === 'cash' ? 'Paid in cash.' : completedSale.payment_method === 'credit' ? 'Credit sale - payment pending.' : 'Bank transfer payment.'}`,
        personalNote: completedSale.notes,
        status: completedSale.payment_method === 'cash' ? 'paid' : 'sent',
        items: completedSale.items.map((item: SaleItem) => ({
          description: `${item.product_name} (${item.product_unit})`,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          total: item.total_price,
        }))
      };

      await createInvoice(invoiceData);

      toast({
        title: "Invoice generated successfully!",
        description: `Invoice ${invoiceData.invoiceNumber} has been created and can be found in the Invoices section.`,
      });

      setCompletedSale(null);
    } catch (error) {
      toast({
        title: "Error generating invoice",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const availableProducts = inventorySettings?.products || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Sales Module</h2>
          <p className="text-muted-foreground">Create sales and manage inventory</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Select Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableProducts.map((product) => {
                    const availableStock = getAvailableStock(product.id);
                    return (
                      <div
                        key={product.id}
                        className="p-3 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                        onClick={() => addProductToSale(product)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.description && `${product.description} • `}
                              Unit: {product.unit}
                            </div>
                            <div className="text-sm font-medium text-primary">
                              {formatCurrency(product.defaultPrice || 0)} per {product.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={availableStock > 0 ? "default" : "destructive"}>
                              Stock: {availableStock}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No products available</p>
                  <p className="text-sm">Add products in Settings → Inventory</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sale Items */}
          {saleItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Sale Items ({saleItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {saleItems.map((item) => (
                    <div key={item.product_id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-muted-foreground">Unit: {item.product_unit}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`qty-${item.product_id}`} className="text-sm">Qty:</Label>
                        <Input
                          id={`qty-${item.product_id}`}
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.product_id, Number(e.target.value))}
                          className="w-20 h-8"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`price-${item.product_id}`} className="text-sm">Price:</Label>
                        <Input
                          id={`price-${item.product_id}`}
                          type="number"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => updateItemPrice(item.product_id, Number(e.target.value))}
                          className="w-24 h-8"
                        />
                      </div>
                      <div className="text-right min-w-[100px]">
                        <div className="font-medium">{formatCurrency(item.total_price)}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItemFromSale(item.product_id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sale Details */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  placeholder="Enter phone number"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerAddress">Address</Label>
                <Textarea
                  id="customerAddress"
                  placeholder="Enter customer address"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <SelectTrigger className="hover:bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash" className="hover:bg-transparent focus:bg-transparent">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Cash Payment
                    </div>
                  </SelectItem>
                  <SelectItem value="credit" className="hover:bg-transparent focus:bg-transparent">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Credit Sale
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer" className="hover:bg-transparent focus:bg-transparent">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Sale Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Sale Totals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%):</span>
                  <span>{formatCurrency(totals.taxAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(totals.totalAmount)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleCreateSale}
                disabled={loading || saleItems.length === 0}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Complete Sale'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoice Generation Section - Show after sale completion */}
      {completedSale && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Receipt className="h-5 w-5" />
              Sale Completed Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Sale Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{completedSale.customer_name || 'Walk-in Customer'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="capitalize">{completedSale.payment_method.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-semibold">{formatCurrency(completedSale.total_amount)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Items Sold</h4>
                <div className="space-y-1 text-sm">
                  {completedSale.items.map((item: SaleItem, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.product_name} ({item.quantity} {item.product_unit})</span>
                      <span>{formatCurrency(item.total_price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleGenerateInvoice}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <Receipt className="h-4 w-4 mr-2" />
                Generate Branded Invoice
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCompletedSale(null)}
                className="flex-1"
              >
                Start New Sale
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              💡 The invoice will be created with your company branding and can be exported as PDF or printed.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
