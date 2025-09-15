# 🏪 Inventory Management System Documentation

## Overview

The QSA Ledger Zen system now includes a comprehensive inventory management system that allows businesses to choose between **Single Inventory** (for single-product businesses) and **Multiple Inventory** (for multi-product businesses) during account creation and later switch between modes in settings.

## 🚀 Key Features

### 1. **Account Creation Flow**
- **Inventory Setup Step**: New users are prompted to choose their inventory management approach
- **Single Inventory**: Perfect for businesses with one main product (default: Rice)
- **Multiple Inventory**: Advanced system for businesses with multiple products
- **Product Configuration**: For multiple inventory, users can add their products with details

### 2. **Settings Integration**
- **Inventory Settings Tab**: Located in Company Settings
- **Mode Switching**: Users can upgrade from single to multiple inventory or downgrade
- **Product Management**: Add, edit, and remove products for multiple inventory mode

### 3. **Dynamic Chart of Accounts**
- **Automatic Account Creation**: System creates appropriate accounts based on inventory type
- **Single Inventory**: Uses standard accounts (Rice Inventory, Sales Revenue, COGS)
- **Multiple Inventory**: Creates individual accounts for each product

### 4. **Enhanced Journal Entry**
- **Dynamic Templates**: Transaction templates adapt based on inventory settings
- **Product-Specific Templates**: Each product gets its own sales and purchase templates
- **Smart Account Suggestions**: Context-aware account suggestions based on inventory type

## 📋 System Components

### Core Components

#### 1. **InventorySetup Component** (`src/components/auth/InventorySetup.tsx`)
- **Purpose**: Handles inventory setup during account creation
- **Features**:
  - Visual selection between single and multiple inventory
  - Product configuration form for multiple inventory
  - Validation and error handling
  - Skip option for later setup

#### 2. **InventorySettings Component** (`src/components/modules/InventorySettings.tsx`)
- **Purpose**: Manages inventory settings in the settings panel
- **Features**:
  - Current inventory mode display
  - Mode switching (upgrade/downgrade)
  - Product management (add/edit/remove)
  - Confirmation dialogs for mode changes

#### 3. **SignupFlow Component** (`src/components/auth/SignupFlow.tsx`)
- **Purpose**: Enhanced signup process with inventory setup
- **Features**:
  - Multi-step signup process
  - Integration with inventory setup
  - Success handling and navigation

### Database Schema

#### **inventory_settings Table**
```sql
CREATE TABLE inventory_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_type TEXT NOT NULL CHECK (inventory_type IN ('single', 'multiple')),
  products JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### Custom Hooks

#### **useInventorySettings Hook** (`src/hooks/useInventorySettings.tsx`)
- **Purpose**: Manages inventory settings data and operations
- **Features**:
  - Fetch inventory settings
  - Update inventory type
  - Product management (add/remove/update)
  - Error handling and loading states

## 🔄 Workflow

### Account Creation Flow

1. **User Registration**: User provides email and password
2. **Inventory Setup**: User chooses inventory type
   - **Single Inventory**: System creates standard accounts
   - **Multiple Inventory**: User adds products, system creates product-specific accounts
3. **Account Creation**: System creates appropriate chart of accounts
4. **Completion**: User proceeds to login

### Settings Management

1. **Access Settings**: User navigates to Company Settings → Inventory tab
2. **View Current Mode**: System displays current inventory configuration
3. **Mode Switching**:
   - **Upgrade**: Single → Multiple (add products)
   - **Downgrade**: Multiple → Single (remove product accounts)
4. **Product Management**: Add/edit/remove products (multiple inventory only)

### Journal Entry Integration

1. **Template Generation**: System generates templates based on inventory settings
2. **Single Inventory**: Rice-specific templates (Rice Cash Sale, Rice Credit Sale, etc.)
3. **Multiple Inventory**: Product-specific templates for each product
4. **Smart Suggestions**: Account suggestions adapt to inventory type

## 🎯 Account Structure

### Single Inventory Accounts
- **1010**: Cash in Hand
- **1040**: Inventory (Rice)
- **4010**: Sales Revenue
- **5010**: Cost of Goods Sold

### Multiple Inventory Accounts
For each product, the system creates:
- **6XXX**: Product Inventory (e.g., 6000: Rice Inventory)
- **6XXX+1**: Product Sales Revenue (e.g., 6001: Rice Sales Revenue)
- **6XXX+2**: Product COGS (e.g., 6002: Rice COGS)

## 🚀 Usage Examples

### Single Inventory Business
1. **Setup**: Choose "Single Inventory" during signup
2. **Journal Entry**: Use Rice-specific templates
3. **Sales Recording**: 
   - Rice Cash Sale: Cash in Hand (Debit) → Sales Revenue (Credit)
   - Rice Credit Sale: Accounts Receivable (Debit) → Sales Revenue (Credit)

### Multiple Inventory Business
1. **Setup**: Choose "Multiple Inventory" and add products (Rice, Beans, Maize)
2. **Journal Entry**: Use product-specific templates
3. **Sales Recording**:
   - Rice Cash Sale: Cash in Hand (Debit) → Rice Sales Revenue (Credit)
   - Beans Credit Sale: Accounts Receivable (Debit) → Beans Sales Revenue (Credit)

## 🔧 Technical Implementation

### Key Technologies
- **React**: Component-based UI
- **TypeScript**: Type safety and better development experience
- **Supabase**: Database and authentication
- **Tailwind CSS**: Styling and responsive design

### State Management
- **React Hooks**: useState, useEffect, useMemo for local state
- **Custom Hooks**: useInventorySettings for data management
- **Context API**: AuthProvider for user authentication

### Database Operations
- **CRUD Operations**: Create, Read, Update, Delete inventory settings
- **Row Level Security**: User-specific data isolation
- **Real-time Updates**: Automatic UI updates on data changes

## 📱 User Interface

### Inventory Setup Screen
- **Visual Selection**: Cards showing single vs multiple inventory options
- **Product Form**: Add products with name, description, unit, and default price
- **Validation**: Required fields and error handling
- **Responsive Design**: Works on desktop and mobile

### Settings Panel
- **Current Status**: Shows current inventory mode and product count
- **Mode Switching**: Upgrade/downgrade options with confirmation
- **Product Management**: List view with add/edit/remove actions
- **Integration**: Seamlessly integrated into existing settings tabs

### Journal Entry Enhancement
- **Dynamic Templates**: Templates adapt to inventory settings
- **Smart Suggestions**: Context-aware account recommendations
- **Visual Indicators**: Clear product-specific template identification

## 🔒 Security & Data Integrity

### Row Level Security (RLS)
- **User Isolation**: Users can only access their own inventory settings
- **Secure Operations**: All database operations are user-scoped
- **Authentication**: Proper user authentication required

### Data Validation
- **Input Validation**: Client-side validation for all forms
- **Database Constraints**: Server-side validation and constraints
- **Error Handling**: Comprehensive error handling and user feedback

## 🚀 Future Enhancements

### Planned Features
1. **Inventory Tracking**: Real-time inventory levels and movements
2. **Product Categories**: Group products by categories
3. **Bulk Operations**: Import/export product data
4. **Advanced Reporting**: Product-specific financial reports
5. **Integration**: Connect with external inventory systems

### Scalability Considerations
- **Performance**: Optimized database queries and caching
- **Flexibility**: Easy to add new inventory features
- **Maintainability**: Clean, modular code structure

## 📚 Related Documentation

- [Journal Entry UX Documentation](./JOURNAL_ENTRY_UX_DOCUMENTATION.md)
- [Journal Entry Keyboard Shortcuts](./JOURNAL_ENTRY_KEYBOARD_SHORTCUTS.md)
- [Changelog](./CHANGELOG.md)
- [Migration & Deployment Guide](./MIGRATION_DEPLOYMENT_GUIDE.md)

## 🎉 Conclusion

The Inventory Management System provides a flexible, scalable solution for businesses of all sizes. Whether you're a single-product rice seller or a multi-product retailer, the system adapts to your needs and grows with your business.

The implementation follows best practices for user experience, data security, and system architecture, ensuring a robust foundation for future enhancements and business growth.
