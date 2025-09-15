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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Help & Support</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Find answers to common questions and get support for your accounting system
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{faqs.length}</div>
            <div className="text-sm text-muted-foreground">FAQ Articles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">{categories.length - 1}</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">Support Available</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search FAQs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No FAQs Found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or browse all categories.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredFAQs.map(faq => (
                <Card key={faq.id} className="hover:shadow-md transition-shadow">
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{faq.category}</Badge>
                        {expandedFAQ === faq.id ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {expandedFAQ === faq.id && (
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{faq.answer}</p>
                      <div className="flex flex-wrap gap-2">
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
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Quick Links</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      User Manual
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Video Tutorials
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      System Status
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Getting Started
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  New to the system? Start here with our comprehensive guide.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Guide
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Video Tutorials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Watch step-by-step video tutorials for all features.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Watch Videos
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  API Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Technical documentation for developers and integrations.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Docs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Learn best practices for efficient accounting and inventory management.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Read More
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Community Forum
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Connect with other users and share experiences.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join Forum
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  System Updates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Stay updated with the latest features and improvements.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Updates
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
