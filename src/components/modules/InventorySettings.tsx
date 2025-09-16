import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Package, Package2, AlertTriangle, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProductType {
  id: string;
  name: string;
  description: string;
  unit: string;
  defaultPrice: number;
}

interface InventorySettingsProps {
  userId: string;
}

export default function InventorySettings({ userId }: InventorySettingsProps) {
  const [inventoryType, setInventoryType] = useState<'single' | 'multiple'>('single');
  const [products, setProducts] = useState<ProductType[]>([]);
  const [newProduct, setNewProduct] = useState<Omit<ProductType, 'id'>>({
    name: '',
    description: '',
    unit: '',
    defaultPrice: 0
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInventorySettings();
  }, [userId]);

  const fetchInventorySettings = async () => {
    try {
      const { data: settings, error } = await supabase
        .from('inventory_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching inventory settings:', error);
        return;
      }

      if (settings) {
        setInventoryType(settings.inventory_type);
        setProducts(settings.products || []);
      }
    } catch (error) {
      console.error('Error fetching inventory settings:', error);
    }
  };

  const saveInventorySettings = async (type: 'single' | 'multiple', productList?: ProductType[]) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('inventory_settings')
        .upsert({
          user_id: userId,
          inventory_type: type,
          products: productList || products,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving inventory settings:', error);
        return;
      }

      setInventoryType(type);
      if (productList) {
        setProducts(productList);
      }
    } catch (error) {
      console.error('Error saving inventory settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.unit.trim()) return;

    const product: ProductType = {
      id: Date.now().toString(),
      ...newProduct
    };

    const updatedProducts = [...products, product];
    await saveInventorySettings('multiple', updatedProducts);
    setNewProduct({ name: '', description: '', unit: '', defaultPrice: 0 });
    setShowAddDialog(false);
  };

  const removeProduct = async (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    await saveInventorySettings('multiple', updatedProducts);
  };

  const handleUpgradeToMultiple = async () => {
    await saveInventorySettings('multiple', products);
    setShowUpgradeDialog(false);
  };

  const handleDowngradeToSingle = async () => {
    await saveInventorySettings('single', []);
  };

  return (
    <div className="space-y-6">
      {/* Header removed per simplification */}

      {/* Current Status */}
      <Card>
        {/* Heading removed */}
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {inventoryType === 'single' ? (
                <Package className="h-8 w-8 text-primary" />
              ) : (
                <Package2 className="h-8 w-8 text-primary" />
              )}
              <div>
                <div className="font-semibold">
                  {inventoryType === 'single' ? 'Single Inventory' : 'Multiple Inventory'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {inventoryType === 'single' 
                    ? 'Tracking one main product (Rice)' 
                    : `Tracking ${products.length} products`
                  }
                </div>
              </div>
            </div>
            <Badge variant={inventoryType === 'single' ? 'outline' : 'default'}>
              {inventoryType === 'single' ? 'Single' : 'Multiple'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Mode Switching */}
      <Card>
        {/* Heading removed */}
        <CardContent className="space-y-4 p-4 md:p-6">
          {inventoryType === 'single' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <Package2 className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-medium">Upgrade to Multiple Inventory</div>
                    <div className="text-sm text-muted-foreground">
                      Track multiple products with individual accounts
                    </div>
                  </div>
                </div>
                <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                  <DialogTrigger asChild>
                    <Button>Upgrade</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upgrade to Multiple Inventory</DialogTitle>
                      <DialogDescription>
                        This will enable advanced multi-product tracking. You can add your products after upgrading.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-primary" />
                        <span className="text-sm">
                          This action will create individual accounts for each product you add.
                        </span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpgradeToMultiple} disabled={loading}>
                          {loading ? 'Upgrading...' : 'Upgrade Now'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-primary" />
                  <div>
                    <div className="font-medium">Downgrade to Single Inventory</div>
                    <div className="text-sm text-muted-foreground">
                      Simplify to single product tracking (Rice only)
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleDowngradeToSingle}
                  disabled={loading}
                >
                  {loading ? 'Downgrading...' : 'Downgrade'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Management (Multiple Inventory Only) */}
      {inventoryType === 'multiple' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                {/* Heading removed */}
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Add a new product to your inventory system
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="productName">Product Name *</Label>
                      <Input
                        id="productName"
                        placeholder="e.g., Rice, Beans, Maize"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productUnit">Unit of Measure *</Label>
                      <Input
                        id="productUnit"
                        placeholder="e.g., kg, bags, pieces"
                        value={newProduct.unit}
                        onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productDescription">Description</Label>
                      <Textarea
                        id="productDescription"
                        placeholder="Brief description of the product"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productPrice">Default Price (Tsh)</Label>
                      <Input
                        id="productPrice"
                        type="number"
                        placeholder="0"
                        value={newProduct.defaultPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, defaultPrice: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addProduct} disabled={loading}>
                        {loading ? 'Adding...' : 'Add Product'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.description && `${product.description} • `}
                        Unit: {product.unit} • Default Price: Tsh {product.defaultPrice.toLocaleString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProduct(product.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No products added yet</p>
                <p className="text-sm">Add your first product to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
