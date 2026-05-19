import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Package, Package2 } from 'lucide-react';

interface ProductType {
  id: string;
  name: string;
  description: string;
  unit: string;
  defaultPrice: number;
}

interface InventorySetupProps {
  onComplete: (inventoryType: 'single' | 'multiple', products?: ProductType[]) => void;
  onSkip: () => void;
}

export default function InventorySetup({ onComplete, onSkip }: InventorySetupProps) {
  const [inventoryType, setInventoryType] = useState<'single' | 'multiple' | null>(null);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [newProduct, setNewProduct] = useState<Omit<ProductType, 'id'>>({
    name: '',
    description: '',
    unit: '',
    defaultPrice: 0
  });

  const addProduct = () => {
    if (newProduct.name.trim() && newProduct.unit.trim()) {
      const product: ProductType = {
        id: Date.now().toString(),
        ...newProduct
      };
      setProducts([...products, product]);
      setNewProduct({ name: '', description: '', unit: '', defaultPrice: 0 });
    }
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleComplete = () => {
    if (inventoryType === 'single') {
      onComplete('single');
    } else if (inventoryType === 'multiple' && products.length > 0) {
      onComplete('multiple', products);
    }
  };

  const canComplete = inventoryType === 'single' || (inventoryType === 'multiple' && products.length > 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Inventory Setup</h1>
        <p className="text-muted-foreground">
          Choose your inventory management approach to optimize your accounting system
        </p>
      </div>

      {/* Inventory Type Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            inventoryType === 'single' ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}
          onClick={() => setInventoryType('single')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Single Inventory</CardTitle>
                <CardDescription>Perfect for businesses with one main product</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Rice</Badge>
                <span className="text-sm text-muted-foreground">Default product</span>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Simplified inventory tracking</li>
                <li>• Pre-configured accounts</li>
                <li>• Quick sales entry</li>
                <li>• Easy to upgrade later</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            inventoryType === 'multiple' ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}
          onClick={() => setInventoryType('multiple')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Package2 className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Multiple Inventory</CardTitle>
                <CardDescription>Advanced system for multiple products</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Custom Products</Badge>
                <span className="text-sm text-muted-foreground">Your products</span>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Multi-product tracking</li>
                <li>• Individual product accounts</li>
                <li>• Advanced sales module</li>
                <li>• Detailed reporting</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Configuration for Multiple Inventory */}
      {inventoryType === 'multiple' && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Your Products</CardTitle>
            <CardDescription>
              Add the products you sell so we can set up the correct accounts and tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Product Form */}
            <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
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
              <div className="md:col-span-2">
                <Button onClick={addProduct} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>

            {/* Products List */}
            {products.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Your Products ({products.length})</h4>
                <div className="space-y-2">
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
              </div>
            )}

            {products.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Add your first product to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onSkip}>
          Skip for Now
        </Button>
        <Button onClick={handleComplete} disabled={!canComplete}>
          Complete Setup
        </Button>
      </div>
    </div>
  );
}
