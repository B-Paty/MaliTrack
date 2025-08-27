# Static Logo System Documentation

This document explains how to use the static logo system that replaces the dynamic upload functionality.

## 📁 Overview

The logo system has been converted from dynamic file uploads to a static file system approach. Logos are now stored as static files in the `/public/images/logo/` directory and configured through a central configuration file.

## 🚀 Quick Setup

### 1. Place Logo File
```bash
# Create the logo file in the designated folder
cp your-logo.png /public/images/logo/client-logo.png
```

### 2. Configure Logo Settings
Edit `src/config/logoConfig.ts`:
```typescript
export const LOGO_CONFIG = {
  LOGO_FILENAME: 'your-logo.png', // Change this to your logo filename
  LOGO_ALT_TEXT: 'Your Company Logo',
  COMPANY_NAME: 'Your Company Name',
  // ... other settings
};
```

### 3. Restart Development Server
```bash
npm run dev
```

## 📋 Detailed Setup Instructions

### Step 1: Prepare Your Logo File
1. **File Location**: Place your logo in `/public/images/logo/`
2. **Supported Formats**:
   - PNG (recommended for transparency)
   - JPG/JPEG (for photos)
   - SVG (for vector graphics)
3. **Recommended Specifications**:
   - Maximum dimensions: 200x80 pixels
   - Transparent background preferred
   - High resolution for crisp display

### Step 2: Update Configuration
The logo configuration is centralized in `src/config/logoConfig.ts`:

```typescript
// ============================================================================
// CLIENT CONFIGURATION - CUSTOMIZE THESE VALUES FOR EACH CLIENT
// ============================================================================

export const LOGO_CONFIG = {
  // Logo file name (place this file in /public/images/logo/)
  LOGO_FILENAME: 'client-logo.png',

  // Logo alt text for accessibility
  LOGO_ALT_TEXT: 'Company Logo',

  // Company name (used in various places)
  COMPANY_NAME: 'QSA Solutions',

  // Logo dimensions (max width/height in pixels)
  MAX_WIDTH: 200,
  MAX_HEIGHT: 80,

  // Logo position options
  POSITION: 'left' as 'left' | 'center' | 'right'
};
```

### Step 3: Deploy Changes
1. **Development**: Restart your development server to see changes
2. **Production**: The logo file will be included in your build automatically

## 🔧 Configuration Options

### Logo Path Configuration
- **File Location**: `/public/images/logo/`
- **Configuration File**: `src/config/logoConfig.ts`
- **Environment**: Works in both development and production

### Fallback System
The system includes multiple fallback options:
1. **Primary**: Your configured logo file
2. **Secondary**: `/images/contactless.png` (bank/payment logo)
3. **Tertiary**: `/images/card (1).png` (alternative bank logo)
4. **Final**: `/images/LIPA.png` (Vodacom logo)

## 🎯 Where Logos Are Displayed

The static logo system displays logos in:

### Application Areas
- ✅ **Login Screen**: Shows company logo on authentication page
- ✅ **Application Header**: Logo in main app navigation
- ✅ **Settings Page**: Logo preview in company settings
- ✅ **Export Documents**: Logo included in PDF/Excel exports

### Loading Behavior
- **Login Screen**: Attempts to load most recent company settings, falls back to defaults
- **Authenticated Areas**: Uses user's configured logo from database
- **Error Handling**: Graceful fallback to icon if logo fails to load

## 🔄 Changing Logos for Different Clients

### For New Client Setup:
1. **Place Logo**: Copy client logo to `/public/images/logo/client-logo.png`
2. **Update Config**:
   ```typescript
   export const LOGO_CONFIG = {
     LOGO_FILENAME: 'client-logo.png',
     LOGO_ALT_TEXT: 'Client Company Name',
     COMPANY_NAME: 'Client Company Name',
     // ... other settings
   };
   ```
3. **Database**: Run migrations (see migration documentation below)
4. **Deploy**: Build and deploy with new logo

### Client-Specific Configuration:
Each client can have their own configuration by:
- Using different logo filenames
- Updating company name and alt text
- Adjusting logo dimensions if needed

## 📊 Database Schema

### Company Settings Table
The logo information is stored in the `company_settings` table:

```sql
-- Logo-related columns in company_settings
logo_path TEXT,           -- Path to logo file (/images/logo/filename.png)
logo_filename TEXT,       -- Original filename for reference
logo_base64 TEXT,         -- Base64 version (for exports)
logo_position TEXT,       -- left/center/right alignment
```

### Migration Notes
- **Static System**: Logo files are not stored in database, only references
- **File Management**: Logo files are managed manually in the file system
- **Backup**: Always backup logo files separately from database

## 🛠️ Development Notes

### Configuration Location
- **Main Config**: `src/config/logoConfig.ts` (centralized configuration)
- **Usage**: Imported by components and hooks as needed
- **Environment**: Works in development and production environments

### Component Integration
Components use the logo system through:

```typescript
import { getLogoPath, LOGO_CONFIG } from '@/config/logoConfig';

// Get configured logo path
const logoPath = getLogoPath();

// Use in JSX
<img src={logoPath} alt={LOGO_CONFIG.LOGO_ALT_TEXT} />
```

### Error Handling
- **File Not Found**: Falls back to default logos automatically
- **Configuration Error**: Falls back to hardcoded defaults
- **Network Issues**: Uses cached/browser-cached versions

## 🚨 Migration from Dynamic Uploads

### What Changed
- **Before**: Logos uploaded to Supabase storage, stored as base64 in database
- **After**: Logos stored as static files, referenced by path in database

### Migration Steps
1. **Export Existing Logos**: If you have existing uploaded logos, export them
2. **Move to Static Folder**: Place logo files in `/public/images/logo/`
3. **Update Configuration**: Set the correct filename in `logoConfig.ts`
4. **Update Database**: Run migrations to ensure schema compatibility
5. **Test**: Verify logos display correctly in all locations

### Data Migration
Existing logo data in the database will be:
- **logo_path**: Updated to point to static file location
- **logo_base64**: Can be kept for export functionality
- **logo_filename**: Preserved for reference

## 📚 API Reference

### Configuration Functions
```typescript
getLogoPath(): string                    // Get full logo path
getFallbackLogoPaths(): string[]         // Get fallback logo paths
getLogoDisplayConfig(): object          // Get display configuration
validateLogoExists(): Promise<boolean>   // Check if logo file exists
```

### Configuration Constants
```typescript
LOGO_CONFIG.LOGO_FILENAME    // Current logo filename
LOGO_CONFIG.LOGO_ALT_TEXT    // Alt text for accessibility
LOGO_CONFIG.COMPANY_NAME     // Company name
LOGO_CONFIG.MAX_WIDTH       // Maximum logo width
LOGO_CONFIG.MAX_HEIGHT      // Maximum logo height
```

## 🔍 Troubleshooting

### Logo Not Displaying
1. **Check File Location**: Ensure logo is in `/public/images/logo/`
2. **Verify Configuration**: Check `logoConfig.ts` has correct filename
3. **Clear Cache**: Restart development server
4. **Check Console**: Look for error messages in browser console

### Configuration Issues
1. **Import Error**: Ensure correct import path for `logoConfig.ts`
2. **TypeScript Errors**: Check type definitions match
3. **Build Errors**: Verify file exists at configured path

### Performance Considerations
- **File Size**: Keep logos under 100KB for optimal loading
- **Format**: Use WebP or optimized PNG for better performance
- **Caching**: Logos are cached by browser automatically

## 📞 Support

For issues with the static logo system:
1. Check this documentation first
2. Verify file placement and configuration
3. Check browser console for error messages
4. Ensure development server is restarted after changes

---

**Last Updated**: December 2024
**Version**: 1.0.0
