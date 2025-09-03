/**
 * Major Client Management
 * Manage major clients, track transactions, and issue invoices
 */
import { useState, useRef } from "react";
import { Plus, FileText, Download, Eye, Edit, Trash2, Users, CreditCard, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useMajorClients } from "@/hooks/useMajorClients";
import { useClientTransactions } from "@/hooks/useClientTransactions";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  invoiceNumber: string;
  dateOfService: string;
  dateOfInvoice: string;
  clientId: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: string;
}

export default function MajorClient() {
  const { toast } = useToast();
  const { clients, loading: clientsLoading, addClient, updateClient, deleteClient } = useMajorClients();
  const { transactions, loading: transactionsLoading, addTransaction } = useClientTransactions();
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("clients");
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [newClient, setNewClient] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    client_contact_person: '',
    client_tax_id: '',
    credit_limit: 0,
    payment_terms: 30,
    notes: ''
  });

  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    dateOfService: new Date().toISOString().split('T')[0],
    dateOfInvoice: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    status: 'draft'
  });

  const handleCreateClient = async () => {
    try {
      await addClient(newClient);
      setIsCreateClientOpen(false);
      setNewClient({
        client_name: '',
        client_email: '',
        client_phone: '',
        client_address: '',
        client_contact_person: '',
        client_tax_id: '',
        credit_limit: 0,
        payment_terms: 30,
        notes: ''
      });
      toast({
        title: "Success",
        description: "Major client created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
    }
  };

  const generateInvoiceNumber = (): string => {
    const year = new Date().getFullYear();
    const count = invoices.length + 1;
    return `INV-${year}-${String(count).padStart(4, '0')}`;
  };

  const handleCreateInvoice = async () => {
    if (!selectedClient) return;

    const invoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber: generateInvoiceNumber(),
      dateOfService: newInvoice.dateOfService!,
      dateOfInvoice: newInvoice.dateOfInvoice!,
      clientId: selectedClient.id,
      items: newInvoice.items || [],
      subtotal: newInvoice.subtotal || 0,
      taxAmount: newInvoice.taxAmount || 0,
      totalAmount: newInvoice.totalAmount || 0,
      status: 'draft',
      dueDate: newInvoice.dueDate!
    };

    setInvoices(prev => [...prev, invoice]);

    // Create transaction record
    await addTransaction({
      client_id: selectedClient.id,
      transaction_type: 'invoice',
      amount: invoice.totalAmount,
      balance_after: selectedClient.current_balance + invoice.totalAmount,
      reference_number: invoice.invoiceNumber,
      description: `Invoice ${invoice.invoiceNumber}`,
      invoice_id: invoice.id
    });

    setIsCreateInvoiceOpen(false);
    toast({
      title: "Success",
      description: "Invoice created and tracked successfully",
    });
  };

  const addInvoiceItem = () => {
    const newItem = {
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

  const clientTransactions = selectedClient 
    ? transactions.filter(t => t.client_id === selectedClient.id)
    : [];

  const clientInvoices = selectedClient 
    ? invoices.filter(inv => inv.clientId === selectedClient.id)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Major Client Management</h1>
          <p className="text-muted-foreground">Manage clients, track transactions, and issue invoices</p>
        </div>
        <Button onClick={() => setIsCreateClientOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Major Client
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clients" className="gap-2">
            <Users className="h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <History className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="h-4 w-4" />
            Invoice Tracker
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <Card key={client.id} className="cursor-pointer hover:shadow-card transition-shadow" onClick={() => setSelectedClient(client)}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{client.client_name}</CardTitle>
                    <Badge variant={client.is_active ? "default" : "secondary"}>
                      {client.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{client.client_email}</p>
                  <p className="text-sm text-muted-foreground">{client.client_phone}</p>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>Balance:</span>
                    <span className="font-medium">{formatCurrency(client.current_balance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Credit Limit:</span>
                    <span className="font-medium">{formatCurrency(client.credit_limit)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {selectedClient ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Transactions for {selectedClient.client_name}</CardTitle>
                  <Button onClick={() => setIsCreateInvoiceOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Invoice
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                        <TableCell>{transaction.reference_number}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.transaction_type}</Badge>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(transaction.balance_after)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Select a client to view transactions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Tracker</CardTitle>
              <p className="text-muted-foreground">Track all invoices issued to major clients</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const client = clients.find(c => c.id === invoice.clientId);
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>{client?.client_name}</TableCell>
                        <TableCell>{formatDate(invoice.dateOfInvoice)}</TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell>
                          <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.totalAmount)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Client Dialog */}
      <Dialog open={isCreateClientOpen} onOpenChange={setIsCreateClientOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Major Client</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name *</Label>
                <Input
                  id="client_name"
                  value={newClient.client_name}
                  onChange={(e) => setNewClient({...newClient, client_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_email">Email</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={newClient.client_email}
                  onChange={(e) => setNewClient({...newClient, client_email: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_phone">Phone</Label>
                <Input
                  id="client_phone"
                  value={newClient.client_phone}
                  onChange={(e) => setNewClient({...newClient, client_phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_contact_person">Contact Person</Label>
                <Input
                  id="client_contact_person"
                  value={newClient.client_contact_person}
                  onChange={(e) => setNewClient({...newClient, client_contact_person: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_address">Address</Label>
              <Textarea
                id="client_address"
                value={newClient.client_address}
                onChange={(e) => setNewClient({...newClient, client_address: e.target.value})}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credit_limit">Credit Limit</Label>
                <Input
                  id="credit_limit"
                  type="number"
                  value={newClient.credit_limit}
                  onChange={(e) => setNewClient({...newClient, credit_limit: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_terms">Payment Terms (days)</Label>
                <Input
                  id="payment_terms"
                  type="number"
                  value={newClient.payment_terms}
                  onChange={(e) => setNewClient({...newClient, payment_terms: parseInt(e.target.value) || 30})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newClient.notes}
                onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateClientOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateClient}>
              Create Client
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Invoice for {selectedClient?.client_name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfService">Date of Service</Label>
                <Input
                  id="dateOfService"
                  type="date"
                  value={newInvoice.dateOfService}
                  onChange={(e) => setNewInvoice({...newInvoice, dateOfService: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfInvoice">Date of Invoice</Label>
                <Input
                  id="dateOfInvoice"
                  type="date"
                  value={newInvoice.dateOfInvoice}
                  onChange={(e) => setNewInvoice({...newInvoice, dateOfInvoice: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addInvoiceItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              {(newInvoice.items || []).map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => {
                        const updatedItems = [...(newInvoice.items || [])];
                        updatedItems[index].description = e.target.value;
                        setNewInvoice({...newInvoice, items: updatedItems});
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const updatedItems = [...(newInvoice.items || [])];
                        updatedItems[index].quantity = parseFloat(e.target.value) || 0;
                        updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
                        setNewInvoice({...newInvoice, items: updatedItems});
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const updatedItems = [...(newInvoice.items || [])];
                        updatedItems[index].unitPrice = parseFloat(e.target.value) || 0;
                        updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
                        setNewInvoice({...newInvoice, items: updatedItems});
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={formatCurrency(item.total)}
                      disabled
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedItems = (newInvoice.items || []).filter((_, i) => i !== index);
                        setNewInvoice({...newInvoice, items: updatedItems});
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateInvoiceOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice}>
              Create Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}