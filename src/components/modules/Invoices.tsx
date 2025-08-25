/**
 * Invoices
 * Create, preview, and export invoices.
 * - Local component state stores in-progress invoices
 * - Uses company + payment settings to render brand and payment options
 * - Exports preview content to PDF via html2canvas + jsPDF
 */
import { useState, useRef } from "react";
import { Plus, FileText, Download, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useTaxSettings } from "@/hooks/useTaxSettings";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  dateOfService: string;
  dateOfInvoice: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  termsAndConditions: string;
  personalNote: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
}

export default function Invoices() {
  const { settings } = useCompanySettings();
  const { taxSettings } = useTaxSettings();
  const { paymentSettings } = usePaymentSettings();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  // Generate unique invoice number
  const generateInvoiceNumber = (): string => {
    const year = new Date().getFullYear();
    const count = invoices.length + 1;
    return `INV-${year}-${String(count).padStart(4, '0')}`;
  };

  // Create new invoice
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    invoiceNumber: generateInvoiceNumber(),
    dateOfService: new Date().toISOString().split('T')[0],
    dateOfInvoice: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    items: [],
    termsAndConditions: "Payment is due within 30 days of invoice date. Late payments may incur penalties as per our terms of service.",
    personalNote: "Thank you for your business! We appreciate your partnership.",
    status: 'draft'
  });

  // Add new item to invoice
  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setNewInvoice(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  // Update invoice item
  const updateInvoiceItem = (itemId: string, field: keyof InvoiceItem, value: string | number) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items?.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          // Recalculate total when quantity or unitPrice changes
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  // Remove invoice item
  const removeInvoiceItem = (itemId: string) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== itemId)
    }));
  };

  // Calculate totals
  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = taxSettings?.taxRate || 0;
    const taxAmount = taxSettings?.taxType === 'inclusive' 
      ? subtotal * (taxRate / (100 + taxRate))
      : subtotal * (taxRate / 100);
    const totalAmount = taxSettings?.taxType === 'inclusive' ? subtotal : subtotal + taxAmount;
    
    return { subtotal, taxAmount, totalAmount };
  };

  // Save invoice
  const saveInvoice = () => {
    if (!newInvoice.clientName || !newInvoice.items?.length) {
      alert('Please fill in client name and add at least one item');
      return;
    }

    const { subtotal, taxAmount, totalAmount } = calculateTotals(newInvoice.items);
    
    const invoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber: newInvoice.invoiceNumber || generateInvoiceNumber(),
      dateOfService: newInvoice.dateOfService || '',
      dateOfInvoice: newInvoice.dateOfInvoice || '',
      clientName: newInvoice.clientName || '',
      clientEmail: newInvoice.clientEmail || '',
      clientAddress: newInvoice.clientAddress || '',
      clientPhone: newInvoice.clientPhone || '',
      items: newInvoice.items || [],
      subtotal,
      taxAmount,
      totalAmount,
      termsAndConditions: newInvoice.termsAndConditions || '',
      personalNote: newInvoice.personalNote || '',
      status: newInvoice.status as 'draft' || 'draft',
      dueDate: newInvoice.dueDate || ''
    };

    setInvoices(prev => [...prev, invoice]);
    setIsCreateDialogOpen(false);
    
    // Reset form
    setNewInvoice({
      invoiceNumber: generateInvoiceNumber(),
      dateOfService: new Date().toISOString().split('T')[0],
      dateOfInvoice: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [],
      termsAndConditions: "Payment is due within 30 days of invoice date. Late payments may incur penalties as per our terms of service.",
      personalNote: "Thank you for your business! We appreciate your partnership.",
      status: 'draft'
    });
  };

  // Export to PDF
  const exportToPDF = async (invoice: Invoice) => {
    try {
      setSelectedInvoice(invoice);
      setIsPreviewOpen(true);
      
      // Wait for the dialog to render
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const element = invoicePreviewRef.current;
      if (!element) {
        console.error('Invoice preview element not found');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        logging: true,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${invoice.invoiceNumber}.pdf`);
      
      // Close preview after a short delay
      setTimeout(() => setIsPreviewOpen(false), 1000);
    } catch (error) {
      console.error('PDF export error:', error);
      setIsPreviewOpen(false);
    }
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      sent: { variant: 'default' as const, label: 'Sent' },
      paid: { variant: 'default' as const, label: 'Paid' },
      overdue: { variant: 'destructive' as const, label: 'Overdue' }
    };
    
    const config = statusConfig[status];
    return (
      <Badge 
        variant={config.variant} 
        className={status === 'paid' ? 'bg-success text-success-foreground' : ''}
      >
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Invoice Management</h2>
          <p className="text-muted-foreground">Create, manage, and track your invoices</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full lg:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={newInvoice.invoiceNumber}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfService">Date of Service</Label>
                  <Input
                    id="dateOfService"
                    type="date"
                    value={newInvoice.dateOfService}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, dateOfService: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfInvoice">Invoice Date</Label>
                  <Input
                    id="dateOfInvoice"
                    type="date"
                    value={newInvoice.dateOfInvoice}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, dateOfInvoice: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Client Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      value={newInvoice.clientName}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, clientName: e.target.value }))}
                      placeholder="Client company or person name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Client Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={newInvoice.clientEmail}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, clientEmail: e.target.value }))}
                      placeholder="client@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone">Client Phone</Label>
                    <Input
                      id="clientPhone"
                      value={newInvoice.clientPhone}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, clientPhone: e.target.value }))}
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="clientAddress">Client Address</Label>
                  <Textarea
                    id="clientAddress"
                    value={newInvoice.clientAddress}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, clientAddress: e.target.value }))}
                    placeholder="Complete client address"
                    rows={3}
                  />
                </div>
              </div>

              {/* Invoice Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Invoice Items</h3>
                  <Button onClick={addInvoiceItem} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                
                {newInvoice.items?.map((item, index) => (
                  <Card key={item.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-6">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                          placeholder="Service or product description"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(item.id, 'quantity', Number(e.target.value))}
                          min="1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateInvoiceItem(item.id, 'unitPrice', Number(e.target.value))}
                          min="0"
                        />
                      </div>
                      <div className="md:col-span-1">
                        <Label>Total</Label>
                        <div className="py-2 px-3 bg-muted rounded text-sm">
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                      <div className="md:col-span-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeInvoiceItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Payment Options Preview (read-only from settings) */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Payment Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      {paymentSettings.bank.cardImageUrl && (
                        <img src={paymentSettings.bank.cardImageUrl} alt="Card" className="h-10 object-contain" />
                      )}
                      <div>
                        <p className="font-semibold">Bank</p>
                        <p className="text-sm text-muted-foreground">{paymentSettings.bank.bankName}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm">
                      <p>Account Name: {paymentSettings.bank.accountName || '-'}</p>
                      <p>Account Number: {paymentSettings.bank.accountNumber || '-'}</p>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      {paymentSettings.vodacom.vodacomImageUrl && (
                        <img src={paymentSettings.vodacom.vodacomImageUrl} alt="Vodacom Lipa Namba" className="h-10 object-contain" />
                      )}
                      <div>
                        <p className="font-semibold">Vodacom Lipa Namba</p>
                        <p className="text-sm text-muted-foreground">{paymentSettings.vodacom.businessName}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm">
                      <p>Lipa Namba: {paymentSettings.vodacom.lipaNamba || '-'}</p>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Terms and Personal Note */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
                  <Textarea
                    id="termsAndConditions"
                    value={newInvoice.termsAndConditions}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="personalNote">Personal Note</Label>
                  <Textarea
                    id="personalNote"
                    value={newInvoice.personalNote}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, personalNote: e.target.value }))}
                    rows={4}
                  />
                </div>
              </div>

              {/* Totals Preview */}
              {newInvoice.items && newInvoice.items.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Invoice Totals</h3>
                  <div className="space-y-2">
                    {(() => {
                      const { subtotal, taxAmount, totalAmount } = calculateTotals(newInvoice.items);
                      return (
                        <>
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax ({taxSettings?.taxRate || 0}% {taxSettings?.taxType}):</span>
                            <span>{formatCurrency(taxAmount)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total Amount:</span>
                            <span>{formatCurrency(totalAmount)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </Card>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={saveInvoice} className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Save Invoice
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoices List */}
      <div className="grid gap-4">
        {invoices.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
            <p className="text-muted-foreground mb-4">Create your first invoice to get started</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Invoice
            </Button>
          </Card>
        ) : (
          invoices.map((invoice) => (
            <Card key={invoice.id} className="p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{invoice.invoiceNumber}</h3>
                    {getStatusBadge(invoice.status)}
                  </div>
                  <p className="text-muted-foreground mb-1">Client: {invoice.clientName}</p>
                  <p className="text-muted-foreground mb-1">Date: {formatDate(invoice.dateOfInvoice)}</p>
                  <p className="text-muted-foreground">Due: {formatDate(invoice.dueDate)}</p>
                </div>
                
                <div className="text-right lg:text-left lg:flex-shrink-0">
                  <p className="text-2xl font-bold text-primary">{formatCurrency(invoice.totalAmount)}</p>
                  <p className="text-sm text-muted-foreground">{invoice.items.length} item(s)</p>
                </div>

                <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setIsPreviewOpen(true);
                    }}
                    className="flex-1 lg:flex-none"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToPDF(invoice)}
                    className="flex-1 lg:flex-none"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Invoice Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div ref={invoicePreviewRef} className="bg-white text-black p-8 space-y-6">
              {/* Invoice Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {settings?.logo_path && (
                    <img 
                      src={settings.logo_path} 
                      alt="Company Logo" 
                      className="h-16 w-16 object-contain"
                    />
                  )}
                  <div>
                    <h1 className="text-3xl font-bold" style={{ color: settings?.primary_color || '#a1052d' }}>
                      INVOICE
                    </h1>
                    <p className="text-lg font-semibold">{settings?.company_name || 'QSA Solutions'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Invoice #: {selectedInvoice.invoiceNumber}</p>
                  <p>Invoice Date: {formatDate(selectedInvoice.dateOfInvoice)}</p>
                  <p>Service Date: {formatDate(selectedInvoice.dateOfService)}</p>
                  <p>Due Date: {formatDate(selectedInvoice.dueDate)}</p>
                </div>
              </div>

              <Separator />

              {/* Client Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Bill To:</h3>
                  <p className="font-medium">{selectedInvoice.clientName}</p>
                  {selectedInvoice.clientAddress && (
                    <p className="whitespace-pre-wrap">{selectedInvoice.clientAddress}</p>
                  )}
                  {selectedInvoice.clientEmail && <p>{selectedInvoice.clientEmail}</p>}
                  {selectedInvoice.clientPhone && <p>{selectedInvoice.clientPhone}</p>}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">From:</h3>
                  <p className="font-medium">{settings?.company_name || 'QSA Solutions'}</p>
                  <p>Professional Accounting System</p>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left py-2">Description</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-right py-2">Unit Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2">{item.description}</td>
                        <td className="text-center py-2">{item.quantity}</td>
                        <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                        <td className="text-right py-2">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({taxSettings?.taxRate || 0}%):</span>
                    <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Payment Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bank */}
                  <div className="border rounded p-4">
                    <div className="flex items-center gap-3">
                      {paymentSettings.bank.cardImageUrl && (
                        <img src={paymentSettings.bank.cardImageUrl} alt="Card" className="h-10 object-contain" />
                      )}
                      <div>
                        <p className="font-semibold">Bank</p>
                        <p className="text-sm text-gray-600">{paymentSettings.bank.bankName}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm">
                      <p>Account Name: {paymentSettings.bank.accountName || '-'}</p>
                      <p>Account Number: {paymentSettings.bank.accountNumber || '-'}</p>
                    </div>
                  </div>
                  {/* Vodacom */}
                  <div className="border rounded p-4">
                    <div className="flex items-center gap-3">
                      {paymentSettings.vodacom.vodacomImageUrl && (
                        <img src={paymentSettings.vodacom.vodacomImageUrl} alt="Vodacom Lipa Namba" className="h-10 object-contain" />
                      )}
                      <div>
                        <p className="font-semibold">Vodacom Lipa Namba</p>
                        <p className="text-sm text-gray-600">{paymentSettings.vodacom.businessName}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm">
                      <p>Lipa Namba: {paymentSettings.vodacom.lipaNamba || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Personal Note */}
              <div className="space-y-4">
                {selectedInvoice.termsAndConditions && (
                  <div>
                    <h4 className="font-semibold mb-2">Terms and Conditions:</h4>
                    <p className="text-sm whitespace-pre-wrap">{selectedInvoice.termsAndConditions}</p>
                  </div>
                )}
                
                {selectedInvoice.personalNote && (
                  <div>
                    <h4 className="font-semibold mb-2">Note:</h4>
                    <p className="text-sm whitespace-pre-wrap">{selectedInvoice.personalNote}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}