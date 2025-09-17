import { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Plus, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { InventoryProduct, InventoryReport, LowStockAlert, InventoryTransaction } from '@/types/inventory';

export default function InventoryManagement() {
  const { toast } = useToast();
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [reports, setReports] = useState<InventoryReport[]>([]);
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<InventoryProduct | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<InventoryProduct>>({
    category: 'General',
    unit_of_measure: 'units',
    cost_per_unit: 0,
    selling_price: 0,
    current_stock: 0,
    minimum_stock: 10,
    maximum_stock: 1000
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setProducts([
        {
          id: '1',
          name: 'Rice',
          category: 'Food & Beverages',
          unit_of_measure: 'kg',
          cost_per_unit: 2600,
          selling_price: 3500,
          current_stock: 26,
          minimum_stock: 50,
          maximum_stock: 500,
          inventory_account_code: '1040',
          cogs_account_code: '5010'
        }
      ]);

      setAlerts([
        {
          product_id: '1',
          product_name: 'Rice',
          current_stock: 45,
          minimum_stock: 50,
          days_remaining: 3,
          alert_level: 'low'
        }
      ]);

      setTransactions([
        {
          id: '1',
          product_id: '1',
          transaction_type: 'sale',
          quantity: 5,
          unit_price: 3500,
          total_amount: 17500,
          reference_number: 'SALE-001',
          transaction_date: '2025-01-03',
          description: 'Cash sale of rice'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (product: InventoryProduct) => {
    if (product.current_stock === 0) return { level: 'out_of_stock', color: 'destructive' };
    if (product.current_stock <= product.minimum_stock) return { level: 'low', color: 'destructive' };
    if (product.current_stock >= product.maximum_stock * 0.9) return { level: 'high', color: 'secondary' };
    return { level: 'normal', color: 'default' };
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.unit_of_measure) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in product name, category, and unit of measure.',
      });
      return;
    }

    const product: InventoryProduct = {
      id: `prod_${Date.now()}`,
      name: newProduct.name!,
      category: newProduct.category!,
      unit_of_measure: newProduct.unit_of_measure!,
      cost_per_unit: newProduct.cost_per_unit || 0,
      selling_price: newProduct.selling_price || 0,
      current_stock: newProduct.current_stock || 0,
      minimum_stock: newProduct.minimum_stock || 10,
      maximum_stock: newProduct.maximum_stock || 1000,
      inventory_account_code: `104${products.length}`,
      cogs_account_code: `501${products.length}`,
    };

    setProducts(prev => [...prev, product]);
    setNewProduct({
      category: 'General',
      unit_of_measure: 'units',
      cost_per_unit: 0,
      selling_price: 0,
      current_stock: 0,
      minimum_stock: 10,
      maximum_stock: 1000
    });
    setShowAddProduct(false);

    toast({
      title: 'Product Added',
      description: `${product.name} has been added to your inventory.`,
    });
  };

  const handleViewProduct = (product: InventoryProduct) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const handleDeleteProduct = (product: InventoryProduct) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setAlerts(prev => prev.filter(a => a.product_id !== productToDelete.id));
      setTransactions(prev => prev.filter(t => t.product_id !== productToDelete.id));
      
      toast({
        title: 'Product Deleted',
        description: `${productToDelete.name} has been removed from your inventory.`,
      });
      
      setShowDeleteDialog(false);
      setProductToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold truncate">Inventory Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">Real-time stock tracking and automated management</p>
        </div>
        <div className="flex gap-2 md:gap-3 flex-shrink-0">
          <Button variant="outline" size="sm" className="flex-1 md:flex-initial hover:bg-transparent active:bg-transparent focus:bg-transparent">
            <RefreshCw className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden xs:inline">Refresh</span>
          </Button>
          <Button size="sm" onClick={() => setShowAddProduct(true)} className="flex-1 md:flex-initial hover:bg-transparent active:bg-transparent focus:bg-transparent">
            <Plus className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden xs:inline">Add Product</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate">Products</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate">Low Stock</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-destructive">{alerts.length}</p>
              </div>
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-destructive flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate">Stock Value</p>
                <p className="text-sm sm:text-base md:text-xl font-bold truncate">
                  Tsh {products.reduce((sum, p) => sum + (p.current_stock * p.cost_per_unit), 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate">Categories</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{categories.length - 1}</p>
              </div>
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="products" className="text-xs md:text-sm px-2 md:px-4">Products</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs md:text-sm px-2 md:px-4">Reports</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs md:text-sm px-2 md:px-4">Alerts</TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs md:text-sm px-2 md:px-4">Transactions</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="hover:bg-transparent hover:text-foreground">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              const stockStatus = getStockStatus(product);
              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <Badge variant={stockStatus.color as any}>
                        {stockStatus.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current Stock</p>
                        <p className="font-semibold">{product.current_stock} {product.unit_of_measure}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Min Level</p>
                        <p className="font-semibold">{product.minimum_stock} {product.unit_of_measure}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">COGS</p>
                        <p className="font-semibold">Tsh {product.cost_per_unit.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Selling Price</p>
                        <p className="font-semibold">Tsh {product.selling_price.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Stock Value:</span>
                        <span className="font-semibold">
                          Tsh {(product.current_stock * product.cost_per_unit).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProduct(product)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="hover:bg-transparent hover:text-foreground">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-3 md:space-y-6">
          {/* Report Filters */}
          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                Inventory Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Select defaultValue="stock-summary">
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Select Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock-summary">Stock Summary</SelectItem>
                    <SelectItem value="stock-valuation">Stock Valuation</SelectItem>
                    <SelectItem value="movement-analysis">Movement Analysis</SelectItem>
                    <SelectItem value="low-stock-report">Low Stock Report</SelectItem>
                    <SelectItem value="performance-metrics">Performance Metrics</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="hover:bg-transparent hover:text-foreground">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-transparent hover:text-foreground">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Report
                </Button>
              </div>

              {/* Stock Summary Report */}
              <div className="space-y-3 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <Card>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-muted-foreground">Products</p>
                          <p className="text-lg md:text-2xl font-bold">{products.length}</p>
                        </div>
                        <Package className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-muted-foreground">Stock Value</p>
                          <p className="text-sm md:text-xl font-bold">
                            Tsh {products.reduce((sum, p) => sum + (p.current_stock * p.cost_per_unit), 0).toLocaleString()}
                          </p>
                        </div>
                        <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-muted-foreground">Low Stock</p>
                          <p className="text-lg md:text-2xl font-bold text-destructive">{alerts.length}</p>
                        </div>
                        <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-destructive" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Stock Report */}
                <Card>
                  <CardHeader className="pb-3 md:pb-6">
                    <CardTitle className="text-base md:text-lg">Stock Detail Report</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Current stock levels and valuations for all products</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Current Stock</TableHead>
                            <TableHead>Unit Cost</TableHead>
                            <TableHead>Total Value</TableHead>
                            <TableHead>Min Stock</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map(product => {
                            const stockStatus = getStockStatus(product);
                            const totalValue = product.current_stock * product.cost_per_unit;
                            return (
                              <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>{product.current_stock} {product.unit_of_measure}</TableCell>
                                <TableCell>Tsh {product.cost_per_unit.toLocaleString()}</TableCell>
                                <TableCell>Tsh {totalValue.toLocaleString()}</TableCell>
                                <TableCell>{product.minimum_stock} {product.unit_of_measure}</TableCell>
                                <TableCell>
                                  <Badge variant={stockStatus.color as any}>
                                    {stockStatus.level.replace('_', ' ')}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                {/* Stock Movement Analysis */}
                <Card>
                  <CardHeader className="pb-3 md:pb-6">
                    <CardTitle className="text-base md:text-lg">Stock Movement Analysis</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Recent transaction activity and stock movements</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 md:space-y-4">
                      {transactions.map(transaction => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 md:p-4 border rounded-lg">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm md:text-base font-semibold">{transaction.description}</p>
                              <p className="text-xs md:text-sm text-muted-foreground">
                                {transaction.transaction_date} • Ref: {transaction.reference_number}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm md:text-base font-semibold">
                              {transaction.transaction_type === 'sale' ? '-' : '+'}{transaction.quantity} units
                            </p>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              Tsh {transaction.total_amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader className="pb-3 md:pb-6">
                    <CardTitle className="text-base md:text-lg">Performance Metrics</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Key performance indicators for inventory management</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs md:text-sm font-medium">Stock Turnover Rate</span>
                          <span className="text-sm md:text-lg font-bold">2.4x</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs md:text-sm font-medium">Average Stock Value</span>
                          <span className="text-sm md:text-lg font-bold">
                            Tsh {Math.round(products.reduce((sum, p) => sum + (p.current_stock * p.cost_per_unit), 0) / products.length).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs md:text-sm font-medium">Stock Coverage (Days)</span>
                          <span className="text-sm md:text-lg font-bold">15 days</span>
                        </div>
                      </div>
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs md:text-sm font-medium">Reorder Frequency</span>
                          <span className="text-sm md:text-lg font-bold">Monthly</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs md:text-sm font-medium">Stock Accuracy</span>
                          <span className="text-sm md:text-lg font-bold">98.5%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs md:text-sm font-medium">Carrying Cost</span>
                          <span className="text-sm md:text-lg font-bold">12%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-3 md:space-y-6">
          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {alerts.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <AlertTriangle className="h-8 w-8 md:h-12 md:w-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
                  <h3 className="text-base md:text-lg font-semibold mb-2">No Alerts</h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    All products are within acceptable stock levels.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {alerts.map(alert => (
                    <div key={alert.product_id} className="flex items-center justify-between p-3 md:p-4 border rounded-lg">
                      <div className="flex items-center gap-2 md:gap-3">
                        <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-destructive flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm md:text-base font-semibold truncate">{alert.product_name}</p>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            Current: {alert.current_stock} | Min: {alert.minimum_stock}
                          </p>
                        </div>
                      </div>
                      <Badge variant="destructive" className="text-xs flex-shrink-0">
                        {alert.alert_level}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-3 md:space-y-6">
          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                Inventory Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 md:space-y-4">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 md:p-4 border rounded-lg">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm md:text-base font-semibold truncate">{transaction.description}</p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                          {transaction.transaction_date} • Ref: {transaction.reference_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm md:text-base font-semibold">
                        {transaction.transaction_type === 'sale' ? '-' : '+'}{transaction.quantity} units
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Tsh {transaction.total_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  placeholder="e.g., Rice, Maize, Beans"
                  value={newProduct.name || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Input
                  placeholder="e.g., Food & Beverages"
                  value={newProduct.category || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit of Measure *</Label>
                <Input
                  placeholder="e.g., kg, bags, liters"
                  value={newProduct.unit_of_measure || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, unit_of_measure: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Current Stock</Label>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  value={newProduct.current_stock || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, current_stock: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Cost per Unit (COGS) - Tsh</Label>
                <Input
                  type="number"
                  placeholder="e.g., 2600"
                  value={newProduct.cost_per_unit || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, cost_per_unit: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Selling Price - Tsh</Label>
                <Input
                  type="number"
                  placeholder="e.g., 3500"
                  value={newProduct.selling_price || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum Stock Level</Label>
                <Input
                  type="number"
                  placeholder="e.g., 10"
                  value={newProduct.minimum_stock || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, minimum_stock: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum Stock Level</Label>
                <Input
                  type="number"
                  placeholder="e.g., 1000"
                  value={newProduct.maximum_stock || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, maximum_stock: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog open={showProductDetails} onOpenChange={setShowProductDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg">{selectedProduct?.name}</DialogTitle>
            <DialogDescription className="text-sm">
              {selectedProduct?.category} • {selectedProduct?.unit_of_measure}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Stock:</span>
                  <span className="font-medium">{selectedProduct.current_stock} {selectedProduct.unit_of_measure}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min Level:</span>
                  <span className="font-medium">{selectedProduct.minimum_stock} {selectedProduct.unit_of_measure}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">COGS:</span>
                  <span className="font-medium">Tsh {selectedProduct.cost_per_unit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selling Price:</span>
                  <span className="font-medium">Tsh {selectedProduct.selling_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Stock Value:</span>
                  <span className="font-semibold">Tsh {(selectedProduct.current_stock * selectedProduct.cost_per_unit).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowProductDetails(false)}>
                  Close
                </Button>
                <Button size="sm" className="hover:bg-transparent hover:text-foreground">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{productToDelete?.name}</strong>? 
              This action cannot be undone and will also delete all associated transactions and alerts.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProduct}>
              Delete Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
