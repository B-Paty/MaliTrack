import { useState } from 'react';
import { Building2, Package, Package2, Plus, Trash2, Save, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BusinessRegistration, InventoryProduct } from '@/types/inventory';

interface BusinessRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (registration: BusinessRegistration) => void;
}

const businessTypes = [
  'Sole Proprietorship',
  'Partnership',
  'Limited Liability Company',
  'Corporation',
  'Cooperative',
  'Other'
];

const industries = [
  'Retail & Wholesale',
  'Food & Beverages',
  'Manufacturing',
  'Agriculture',
  'Technology',
  'Healthcare',
  'Education',
  'Construction',
  'Transportation',
  'Other'
];

export default function BusinessRegistrationForm({ 
  isOpen, 
  onClose, 
  onComplete 
}: BusinessRegistrationFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<BusinessRegistration>>({
    inventory_type: 'single'
  });
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [newProduct, setNewProduct] = useState<Partial<InventoryProduct>>({
    category: 'General',
    unit_of_measure: 'units',
    cost_per_unit: 0,
    selling_price: 0,
    current_stock: 0,
    minimum_stock: 10,
    maximum_stock: 1000
  });

  const handleInputChange = (field: keyof BusinessRegistration, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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

    toast({
      title: 'Product Added',
      description: `${product.name} has been added to your inventory.`,
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const requiredFields = ['business_name', 'business_type', 'address', 'phone', 'email', 'industry'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof BusinessRegistration]);
      
      if (missingFields.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Missing Information',
          description: `Please fill in: ${missingFields.join(', ')}`,
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (formData.inventory_type === 'multiple' && products.length === 0) {
        toast({
          variant: 'destructive',
          title: 'No Products Added',
          description: 'Please add at least one product for multiple inventory system.',
        });
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleComplete = () => {
    const registration: BusinessRegistration = {
      ...formData as BusinessRegistration,
      products: formData.inventory_type === 'multiple' ? products : undefined
    };
    onComplete(registration);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Building2 className="h-12 w-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Business Information</h2>
        <p className="text-muted-foreground">Tell us about your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Business Name *</Label>
          <Input
            placeholder="e.g., ABC Trading Company"
            value={formData.business_name || ''}
            onChange={(e) => handleInputChange('business_name', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Business Type *</Label>
          <Select
            value={formData.business_type}
            onValueChange={(value) => handleInputChange('business_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Registration Number</Label>
          <Input
            placeholder="e.g., REG123456"
            value={formData.registration_number || ''}
            onChange={(e) => handleInputChange('registration_number', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Tax ID</Label>
          <Input
            placeholder="e.g., TIN123456"
            value={formData.tax_id || ''}
            onChange={(e) => handleInputChange('tax_id', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Industry *</Label>
          <Select
            value={formData.industry}
            onValueChange={(value) => handleInputChange('industry', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map(industry => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Phone *</Label>
          <Input
            placeholder="e.g., +255 123 456 789"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Email *</Label>
          <Input
            type="email"
            placeholder="e.g., info@abctrading.com"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Website</Label>
          <Input
            placeholder="e.g., www.abctrading.com"
            value={formData.website || ''}
            onChange={(e) => handleInputChange('website', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Business Address *</Label>
        <Textarea
          placeholder="Enter your complete business address"
          value={formData.address || ''}
          onChange={(e) => handleInputChange('address', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Package className="h-12 w-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Inventory System Setup</h2>
        <p className="text-muted-foreground">Choose your inventory management approach</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            formData.inventory_type === 'single' ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}
          onClick={() => setFormData(prev => ({ ...prev, inventory_type: 'single' }))}
        >
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Package className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Single Inventory</h3>
              <p className="text-muted-foreground">Perfect for businesses selling one main product</p>
              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  <span>One COGS account</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  <span>Simple stock tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  <span>Automatic COGS calculation</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            formData.inventory_type === 'multiple' ? 'ring-2 ring-primary bg-primary/5' : ''
          }`}
          onClick={() => setFormData(prev => ({ ...prev, inventory_type: 'multiple' }))}
        >
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Package2 className="h-12 w-12 mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Multiple Inventory</h3>
              <p className="text-muted-foreground">For businesses with multiple products</p>
              <div className="space-y-2 text-sm text-left">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  <span>Separate COGS per product</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  <span>Advanced stock tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">✓</Badge>
                  <span>Product-specific reports</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Configuration for Multiple Inventory */}
      {formData.inventory_type === 'multiple' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Configure Your Products</Label>
            <Badge variant="outline">{products.length} products added</Badge>
          </div>
          
          {/* Add Product Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Product
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              <div className="flex justify-end">
                <Button
                  onClick={handleAddProduct}
                  disabled={!newProduct.name || !newProduct.category || !newProduct.unit_of_measure}
                  className="min-w-[120px]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Products List */}
          {products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Products ({products.length})</span>
                  <Badge variant="secondary">Ready for automation</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline">{product.category}</Badge>
                          <span className="font-semibold">{product.name}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div><span className="font-medium">Stock:</span> {product.current_stock} {product.unit_of_measure}</div>
                          <div><span className="font-medium">COGS:</span> Tsh {product.cost_per_unit.toLocaleString()}</div>
                          <div><span className="font-medium">Price:</span> Tsh {product.selling_price.toLocaleString()}</div>
                          <div><span className="font-medium">Min/Max:</span> {product.minimum_stock}/{product.maximum_stock}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setProducts(prev => prev.filter(p => p.id !== product.id))}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Save className="h-12 w-12 mx-auto text-primary" />
        <h2 className="text-2xl font-bold">Review & Complete</h2>
        <p className="text-muted-foreground">Review your business setup</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><strong>Name:</strong> {formData.business_name}</div>
            <div><strong>Type:</strong> {formData.business_type}</div>
            <div><strong>Industry:</strong> {formData.industry}</div>
            <div><strong>Phone:</strong> {formData.phone}</div>
            <div><strong>Email:</strong> {formData.email}</div>
            <div><strong>Address:</strong> {formData.address}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><strong>Type:</strong> {formData.inventory_type === 'single' ? 'Single Inventory' : 'Multiple Inventory'}</div>
            {formData.inventory_type === 'multiple' && (
              <div><strong>Products:</strong> {products.length} configured</div>
            )}
            <div><strong>Features:</strong></div>
            <ul className="text-sm text-muted-foreground ml-4 space-y-1">
              <li>• Real-time stock tracking</li>
              <li>• Automatic COGS calculation</li>
              <li>• Low-stock alerts</li>
              <li>• Inventory reports</li>
              <li>• Sales & purchase tracking</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Business Registration</DialogTitle>
          <DialogDescription className="text-lg">
            Set up your automated inventory management system
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete}>
                  <Save className="h-4 w-4 mr-2" />
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
