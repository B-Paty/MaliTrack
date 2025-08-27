# Database Migration Deployment Guide

This guide explains how to deploy the accounting system database for new clients using the provided migration files.

## 📋 Migration Files Overview

| Migration File | Purpose | Order | Client Customization |
|---|---|---|---|
| `20250821102415_ab997f6f-4913-4c08-ba48-afec565b8b30.sql` | Core schema + sample data | 1st | High |
| `20250821102442_fc49c29a-fa49-4e0b-85e1-9692b4d909b6.sql` | Functions & triggers | 2nd | Low |
| `20250824100235_fb73245d-ee4e-45b0-b6c0-a83c498ce27c.sql` | Additional schema | 3rd | Medium |
| `20250825103000_secure_policies.sql` | Security policies | 4th | Low |
| `20250825120000_add_payment_settings_to_company_settings.sql` | Payment features | 5th | Medium |
| `20250825130000_secure_financial_tables.sql` | Enhanced security | 6th | Low |
| `20250825160000_create_company_assets_bucket.sql` | File storage setup | 7th | Low |
| `20250825170000_enhance_company_settings_branding.sql` | Branding fields | 8th | High |
| `20250825180000_create_sample_accounts.sql` | Account templates | 9th | High |
| `20250827033254_7e8679e4-95aa-4450-8567-1f69516bffed.sql` | Security functions | 10th | Low |
| `20250827033609_3cb74c42-9e56-4260-93ee-d0848168817d.sql` | Password protection | 11th | Low |
| `20250827033644_f25cd99b-790f-41f4-a975-7e26c3b5707b.sql` | Schema enhancements | 12th | Medium |
| `20250827040000_add_user_ownership_columns.sql` | Multi-tenancy | 13th | Low |

## 🚀 New Client Deployment Process

### Step 1: Prepare Client-Specific Files
```bash
# 1. Create client logo directory
mkdir -p /public/images/logo/

# 2. Place client logo
cp client-logo.png /public/images/logo/client-logo.png

# 3. Update configuration
edit src/config/logoConfig.ts
```

### Step 2: Customize Migration Files

#### A. Company Settings (High Priority)
**File:** `20250821102415_ab997f6f-4913-4c08-ba48-afec565b8b30.sql`
```sql
-- Line 14: Update company name
company_name TEXT NOT NULL DEFAULT 'Your Client Name',

-- Line 17: Update brand color
primary_color TEXT NOT NULL DEFAULT '#your-brand-color',
```

#### B. Sample Data Customization
**Files:** `20250821102415_ab997f6f-4913-4c08-ba48-afec565b8b30.sql`
```sql
-- Update sample accounts based on client business type
-- Add industry-specific accounts
-- Modify default balances
-- Customize account names
```

#### C. Branding Fields
**File:** `20250825170000_enhance_company_settings_branding.sql`
```sql
-- Already configured for static logo system
-- No changes needed unless adding custom fields
```

### Step 3: Database Setup

#### Option A: Using Supabase CLI (Recommended)
```bash
# 1. Initialize Supabase (if not already done)
supabase init

# 2. Link to your project
supabase link --project-ref your-project-id

# 3. Apply migrations in order
supabase db push

# 4. Generate types (optional)
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

#### Option B: Manual SQL Execution
```sql
-- Connect to your Supabase database
-- Execute migration files in order shown above
-- Verify each migration completes successfully
```

### Step 4: Post-Deployment Configuration

#### A. Static Logo Setup
```bash
# 1. Place logo file
cp client-logo.png /public/images/logo/

# 2. Update config
nano src/config/logoConfig.ts
```

#### B. Environment Variables
```bash
# Create .env.local with client-specific settings
VITE_CLIENT_NAME="Client Company Name"
VITE_CLIENT_LOGO="client-logo.png"
```

#### C. Application Configuration
```typescript
// src/config/clientConfig.ts
export const CLIENT_CONFIG = {
  name: process.env.VITE_CLIENT_NAME || 'Default Client',
  logo: process.env.VITE_CLIENT_LOGO || 'default-logo.png',
  // Add other client-specific settings
};
```

## 🎯 Client-Specific Customizations

### For Different Business Types

#### Retail/E-commerce Client
```sql
-- Add retail-specific accounts
INSERT INTO chart_of_accounts VALUES
('4015', 'Online Sales Revenue', 'Revenue', 0.00, 'credit'),
('5025', 'Payment Processing Fees', 'Expense', 0.00, 'debit'),
('1060', 'Point of Sale Equipment', 'Fixed Asset', 0.00, 'debit');
```

#### Manufacturing Client
```sql
-- Add manufacturing-specific accounts
INSERT INTO chart_of_accounts VALUES
('5015', 'Cost of Goods Manufactured', 'Expense', 0.00, 'debit'),
('1070', 'Manufacturing Equipment', 'Fixed Asset', 0.00, 'debit'),
('1080', 'Raw Materials Inventory', 'Current Asset', 0.00, 'debit');
```

#### Service Business Client
```sql
-- Add service-specific accounts
INSERT INTO chart_of_accounts VALUES
('4025', 'Service Revenue', 'Revenue', 0.00, 'credit'),
('5035', 'Professional Development', 'Expense', 0.00, 'debit'),
('1090', 'Software Licenses', 'Fixed Asset', 0.00, 'debit');
```

### Branding Customization

#### Logo Configuration
```typescript
// src/config/logoConfig.ts
export const LOGO_CONFIG = {
  LOGO_FILENAME: 'client-specific-logo.png',
  LOGO_ALT_TEXT: 'Client Company Name',
  COMPANY_NAME: 'Client Company Name',
  MAX_WIDTH: 200,  // Adjust based on logo aspect ratio
  MAX_HEIGHT: 80,
  POSITION: 'left'
};
```

#### Color Scheme
```sql
-- Update company_settings with client colors
UPDATE company_settings
SET primary_color = '#client-primary-color',
    secondary_color = '#client-secondary-color',
    accent_color = '#client-accent-color';
```

## 🔍 Verification Steps

### After Deployment
```sql
-- 1. Verify tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check user ownership setup
SELECT column_name FROM information_schema.columns
WHERE table_name = 'company_settings' AND column_name = 'user_id';

-- 3. Verify sample data
SELECT COUNT(*) FROM chart_of_accounts;
SELECT COUNT(*) FROM company_settings;

-- 4. Test RLS policies
-- (Run as authenticated user)
SELECT * FROM company_settings WHERE user_id = auth.uid();
```

### Application Testing
```bash
# 1. Start development server
npm run dev

# 2. Test logo display
# - Check login screen logo
# - Verify header logo
# - Test settings page logo preview

# 3. Test data isolation
# - Create test user
# - Verify user can only see their data
# - Test account creation and transactions
```

## 🛠️ Troubleshooting

### Common Issues

#### Logo Not Displaying
```bash
# Check logo file exists
ls -la /public/images/logo/

# Verify configuration
cat src/config/logoConfig.ts

# Check browser console for errors
# Restart dev server
npm run dev
```

#### Migration Errors
```sql
-- Check migration status
SELECT * FROM supabase.storage.objects
WHERE bucket_id = 'migrations';

-- Verify table creation
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

#### Permission Errors
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'company_settings';

-- Verify user authentication setup
SELECT * FROM auth.users LIMIT 1;
```

## 📚 Maintenance

### Regular Tasks
- **Backup database** before major changes
- **Test migrations** on staging environment first
- **Document customizations** for each client
- **Monitor performance** of new indexes

### Updating Existing Clients
```bash
# 1. Backup client data
pg_dump client_database > client_backup.sql

# 2. Apply new migrations
supabase db push

# 3. Test functionality
# 4. Update client configuration if needed
```

## 🔒 Security Considerations

### Data Isolation
- User ownership columns prevent data leakage
- RLS policies enforce access control
- Regular security audits recommended

### Backup Strategy
- Automated daily backups
- Separate backups for each client
- Test restoration procedures regularly

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Contact**: Development Team
