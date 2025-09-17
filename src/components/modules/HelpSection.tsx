import { useState } from 'react';
import { HelpCircle, Search, Mail, Phone, MessageCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How do I set up my inventory system?',
    answer: 'You can set up your inventory system during business registration or through the Company Settings. Choose between Single Inventory (one product) or Multiple Inventory (multiple products) based on your business needs.',
    category: 'Inventory',
    tags: ['setup', 'inventory', 'configuration']
  },
  {
    id: '2',
    question: 'How does automatic COGS calculation work?',
    answer: 'The system automatically calculates Cost of Goods Sold (COGS) when you record sales transactions. It uses the unit cost you set for each product and multiplies it by the quantity sold to create the appropriate accounting entries.',
    category: 'Inventory',
    tags: ['cogs', 'automation', 'sales']
  },
  {
    id: '3',
    question: 'What are low-stock alerts?',
    answer: 'Low-stock alerts notify you when your inventory levels fall below the minimum threshold you set for each product. This helps you maintain adequate stock levels and avoid stockouts.',
    category: 'Inventory',
    tags: ['alerts', 'stock', 'notifications']
  },
  {
    id: '4',
    question: 'How do I record a journal entry?',
    answer: 'Go to Journal Entry and use the transaction templates for common business transactions, or create custom entries. The system validates that debits equal credits before allowing you to save.',
    category: 'Accounting',
    tags: ['journal', 'entries', 'transactions']
  },
  {
    id: '5',
    question: 'What keyboard shortcuts are available?',
    answer: 'Use Ctrl+Enter to submit transactions, Ctrl+N for new lines, Ctrl+T to toggle auto-balance, Ctrl+K for shortcuts help, and Escape to clear templates.',
    category: 'Navigation',
    tags: ['shortcuts', 'keyboard', 'productivity']
  },
  {
    id: '6',
    question: 'How do I create and manage invoices?',
    answer: 'Go to Invoices, select a major client, add line items, and the system will automatically calculate totals and taxes. You can preview, save, and export invoices as PDF.',
    category: 'Invoicing',
    tags: ['invoices', 'clients', 'billing']
  },
  {
    id: '7',
    question: 'How do I add new products to my inventory?',
    answer: 'In Inventory Management, click "Add Product" and fill in the product details including name, category, unit of measure, cost per unit, and selling price. The system will automatically assign inventory and COGS accounts.',
    category: 'Inventory',
    tags: ['products', 'add', 'management']
  },
  {
    id: '8',
    question: 'What reports are available?',
    answer: 'The system provides Trial Balance, Financial Statements, Inventory Reports, and various analytics. More detailed reports are being added regularly.',
    category: 'Reports',
    tags: ['reports', 'analytics', 'statements']
  },
  {
    id: '9',
    question: 'How do I switch between single and multiple inventory?',
    answer: 'You can change your inventory type in Company Settings under Inventory Configuration. Note that switching from single to multiple inventory will require setting up individual products.',
    category: 'Inventory',
    tags: ['switch', 'configuration', 'upgrade']
  },
  {
    id: '10',
    question: 'How do I contact support?',
    answer: 'You can reach our support team through the contact form in this Help section, email us at support@qsasolutions.com, or call +255 XXX XXX XXX during business hours.',
    category: 'Support',
    tags: ['contact', 'support', 'help']
  },
  {
    id: '11',
    question: 'How do I use transaction templates?',
    answer: 'Transaction templates provide pre-configured journal entries for common business transactions. Select a template like "Cash Sale" or "Credit Purchase" and the system will automatically populate the appropriate accounts. You can modify amounts before saving.',
    category: 'Accounting',
    tags: ['templates', 'transactions', 'automation']
  },
  {
    id: '12',
    question: 'What is auto-balancing and how does it work?',
    answer: 'Auto-balancing automatically calculates missing debit or credit amounts to ensure your journal entries balance. When enabled, enter amounts on one side and the system will calculate the balancing amount on the other side based on account types.',
    category: 'Accounting',
    tags: ['auto-balance', 'journal', 'automation']
  },
  {
    id: '13',
    question: 'How do I manage my chart of accounts?',
    answer: 'Go to Chart of Accounts to view, add, edit, or deactivate accounts. The system uses a standard chart of accounts structure with assets (1000s), liabilities (2000s), equity (3000s), income (4000s), and expenses (5000s-6000s).',
    category: 'Accounting',
    tags: ['accounts', 'chart', 'setup']
  },
  {
    id: '14',
    question: 'How do I set up major clients for invoicing?',
    answer: 'In the Major Client module, add client information including name, contact details, and billing preferences. Once set up, you can create invoices directly for these clients with automatic calculations and PDF generation.',
    category: 'Invoicing',
    tags: ['clients', 'setup', 'invoicing']
  },
  {
    id: '15',
    question: 'How do I generate and view reports?',
    answer: 'Access reports through the Reports section or within specific modules. Available reports include Trial Balance, Financial Statements, Inventory Reports, and Stock Analysis. Reports can be filtered by date range and exported to PDF or Excel.',
    category: 'Reports',
    tags: ['reports', 'financial', 'export']
  },
  {
    id: '16',
    question: 'How do I use keyboard shortcuts for faster data entry?',
    answer: 'Use Ctrl+Enter to save transactions, Ctrl+N to add new lines, Ctrl+T to toggle auto-balance, Ctrl+K to view all shortcuts, and Escape to clear templates. These shortcuts significantly speed up data entry.',
    category: 'Navigation',
    tags: ['shortcuts', 'productivity', 'speed']
  },
  {
    id: '17',
    question: 'How do I track stock movements and transactions?',
    answer: 'The Inventory Management module automatically tracks all stock movements from sales, purchases, and adjustments. View transaction history in the Transactions tab to see detailed movement records with dates, quantities, and values.',
    category: 'Inventory',
    tags: ['tracking', 'movements', 'history']
  },
  {
    id: '18',
    question: 'How do I set up and manage product categories?',
    answer: 'Product categories help organize your inventory. When adding products, select or create categories like "Electronics", "Clothing", etc. Categories are used for reporting and filtering products in the inventory system.',
    category: 'Inventory',
    tags: ['categories', 'organization', 'products']
  },
  {
    id: '19',
    question: 'How do I handle inventory adjustments and corrections?',
    answer: 'Use the inventory adjustment feature to correct stock levels due to damage, theft, or counting discrepancies. These adjustments automatically create the appropriate journal entries to maintain accurate financial records.',
    category: 'Inventory',
    tags: ['adjustments', 'corrections', 'accuracy']
  },
  {
    id: '20',
    question: 'How do I backup and restore my data?',
    answer: 'Your data is automatically backed up to secure cloud storage. You can also export your data through the Reports section. For data restoration or migration assistance, contact our support team.',
    category: 'Support',
    tags: ['backup', 'restore', 'data']
  },
  {
    id: '21',
    question: 'How do I customize the dashboard and interface?',
    answer: 'The dashboard automatically adapts to your business type and shows relevant metrics. You can switch between modules using the sidebar or bottom navigation on mobile. Interface preferences are saved automatically.',
    category: 'Navigation',
    tags: ['dashboard', 'customization', 'interface']
  },
  {
    id: '22',
    question: 'How do I handle multi-currency transactions?',
    answer: 'Currently, the system operates in Tanzanian Shillings (Tsh). Multi-currency support is planned for future releases. Contact support if you need assistance with currency conversion calculations.',
    category: 'Accounting',
    tags: ['currency', 'international', 'future']
  }
];

const categories = ['All', 'Inventory', 'Accounting', 'Navigation', 'Invoicing', 'Reports', 'Support'];

export default function HelpSection() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    // Simulate form submission
    toast({
      title: 'Message Sent',
      description: 'Thank you for contacting us. We will get back to you within 24 hours.',
    });

    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="text-center space-y-3 md:space-y-4">
        <div className="flex items-center justify-center gap-2 md:gap-3">
          <HelpCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Help & Support</h1>
        </div>
        <p className="text-muted-foreground text-sm md:text-lg px-4">
          Find answers to common questions and get support for your accounting system
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-6 text-center">
            <div className="text-lg md:text-2xl font-bold text-primary">{faqs.length}</div>
            <div className="text-xs md:text-sm text-muted-foreground">FAQ Articles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-6 text-center">
            <div className="text-lg md:text-2xl font-bold text-primary">{categories.length - 1}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-6 text-center">
            <div className="text-lg md:text-2xl font-bold text-primary">24/7</div>
            <div className="text-xs md:text-sm text-muted-foreground">Support Available</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="faq" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="faq" className="text-xs md:text-sm px-2 md:px-4">FAQ</TabsTrigger>
          <TabsTrigger value="contact" className="text-xs md:text-sm px-2 md:px-4">Contact Support</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4 md:space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search FAQs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-xs md:text-sm px-2 md:px-3 whitespace-nowrap flex-shrink-0"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ List */}
          <div className="space-y-3 md:space-y-4">
            {filteredFAQs.length === 0 ? (
              <Card>
                <CardContent className="p-6 md:p-8 text-center">
                  <HelpCircle className="h-8 w-8 md:h-12 md:w-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
                  <h3 className="text-base md:text-lg font-semibold mb-2">No FAQs Found</h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Try adjusting your search terms or browse all categories.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredFAQs.map(faq => (
                <Card key={faq.id} className="hover:shadow-md transition-shadow">
                  <CardHeader 
                    className="cursor-pointer pb-3 md:pb-6"
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-sm md:text-lg flex-1 min-w-0 pr-2">{faq.question}</CardTitle>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-xs hidden sm:inline-flex">{faq.category}</Badge>
                        {expandedFAQ === faq.id ? (
                          <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {expandedFAQ === faq.id && (
                    <CardContent className="pt-0">
                      <p className="text-sm md:text-base text-muted-foreground mb-4">{faq.answer}</p>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        <Badge variant="outline" className="text-xs sm:hidden">{faq.category}</Badge>
                        {faq.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Contact Support Tab */}
        <TabsContent value="contact" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Contact Form */}
            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      placeholder="Your full name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      placeholder="Brief description of your issue"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message *</Label>
                    <Textarea
                      placeholder="Describe your question or issue in detail..."
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Phone className="h-4 w-4 md:h-5 md:w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 pt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">Email Support</p>
                      <p className="text-sm text-muted-foreground">support@qsasolutions.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">Phone Support</p>
                      <p className="text-sm text-muted-foreground">+255 XXX XXX XXX</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">Business Hours</p>
                      <p className="text-sm text-muted-foreground">Monday - Friday: 8:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>


              </CardContent>
            </Card>
          </div>
        </TabsContent>


      </Tabs>
    </div>
  );
}
