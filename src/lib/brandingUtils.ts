/**
 * Branding Utilities
 * Helper functions for company branding and theming
 */

import { ColorTheme, LogoSettings } from '@/types/branding';

/**
 * Convert hex color to HSL format
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized.length === 3 ? normalized.split('').map(c => c + c).join('') : normalized, 16);
  
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL to CSS HSL string
 */
export function hslToString(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`;
}

/**
 * Generate color variations from primary color
 */
export function generateColorTheme(primaryColor: string): ColorTheme {
  const { h, s, l } = hexToHsl(primaryColor);
  
  return {
    primary: hslToString(h, s, l),
    secondary: hslToString(h, Math.max(10, s - 20), Math.min(95, l + 20)),
    accent: hslToString((h + 30) % 360, s, l),
    background: hslToString(h, Math.max(5, s - 30), Math.min(98, l + 30)),
    text: l > 50 ? '0 0% 15%' : '0 0% 95%',
    border: hslToString(h, Math.max(5, s - 20), Math.min(90, l + 15))
  };
}

/**
 * Apply company branding colors to CSS custom properties
 */
export function applyBrandingTheme(primaryColor: string, secondaryColor?: string, accentColor?: string): void {
  const theme = generateColorTheme(primaryColor);
  const root = document.documentElement;
  
  // Apply primary color variations
  root.style.setProperty('--company-primary', theme.primary);
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--ring', theme.primary);
  
  // Generate hover and active states
  const { h, s, l } = hexToHsl(primaryColor);
  const hoverL = Math.max(0, Math.min(100, l - 5));
  const activeL = Math.max(0, Math.min(100, l - 10));
  
  root.style.setProperty('--primary-hover', hslToString(h, s, hoverL));
  root.style.setProperty('--primary-active', hslToString(h, s, activeL));
  
  // Apply secondary color if provided
  if (secondaryColor) {
    const secondaryTheme = generateColorTheme(secondaryColor);
    root.style.setProperty('--company-secondary', secondaryTheme.primary);
    root.style.setProperty('--secondary', secondaryTheme.primary);
  }
  
  // Apply accent color if provided
  if (accentColor) {
    const accentTheme = generateColorTheme(accentColor);
    root.style.setProperty('--company-accent', accentTheme.primary);
    root.style.setProperty('--accent', accentTheme.primary);
  }
  
  // Apply gradients
  root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${theme.primary}), hsl(${hslToString(h, s, hoverL)}))`);
  root.style.setProperty('--gradient-header', `linear-gradient(135deg, hsl(${theme.primary}), hsl(${hslToString(h, s, hoverL)}))`);
  root.style.setProperty('--gradient-accent', `linear-gradient(135deg, hsl(${theme.primary} / 0.05), hsl(${theme.primary} / 0.1))`);
  
  // Apply shadows with brand colors
  root.style.setProperty('--shadow-brand', `0 4px 20px hsl(${theme.primary} / 0.15)`);
  root.style.setProperty('--shadow-brand-strong', `0 8px 30px hsl(${theme.primary} / 0.25)`);
}

/**
 * Convert file to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please select a PNG, JPG, or SVG file.'
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size too large. Please select a file under 5MB.'
    };
  }
  
  return { valid: true };
}

/**
 * Calculate optimal logo dimensions for different contexts
 */
export function calculateLogoDimensions(
  originalWidth: number,
  originalHeight: number,
  context: 'header' | 'export' | 'preview'
): { width: number; height: number } {
  const maxDimensions = {
    header: { width: 120, height: 40 },
    export: { width: 200, height: 80 },
    preview: { width: 150, height: 60 }
  };
  
  const max = maxDimensions[context];
  const aspectRatio = originalWidth / originalHeight;
  
  let { width, height } = max;
  
  if (aspectRatio > width / height) {
    // Image is wider than container
    height = width / aspectRatio;
  } else {
    // Image is taller than container
    width = height * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * Generate CSS for dynamic branding
 */
export function generateBrandingCSS(primaryColor: string, secondaryColor?: string): string {
  const theme = generateColorTheme(primaryColor);
  const { h, s, l } = hexToHsl(primaryColor);
  
  return `
    :root {
      --company-primary: ${theme.primary};
      --company-secondary: ${secondaryColor ? generateColorTheme(secondaryColor).primary : theme.secondary};
      --company-accent: ${theme.accent};
      --brand-h: ${h};
      --brand-s: ${s}%;
      --brand-l: ${l}%;
    }
    
    .brand-primary {
      color: hsl(var(--company-primary));
    }
    
    .brand-bg-primary {
      background-color: hsl(var(--company-primary));
    }
    
    .brand-border-primary {
      border-color: hsl(var(--company-primary));
    }
    
    .brand-gradient {
      background: var(--gradient-primary);
    }
  `;
}

/**
 * Extract colors from image (simplified version)
 */
export function extractColorsFromImage(imageUrl: string): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(['#a1052d']); // fallback
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Simple color extraction - get average color from center region
      const imageData = ctx.getImageData(
        img.width * 0.25,
        img.height * 0.25,
        img.width * 0.5,
        img.height * 0.5
      );
      
      let r = 0, g = 0, b = 0;
      const pixelCount = imageData.data.length / 4;
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        r += imageData.data[i];
        g += imageData.data[i + 1];
        b += imageData.data[i + 2];
      }
      
      r = Math.round(r / pixelCount);
      g = Math.round(g / pixelCount);
      b = Math.round(b / pixelCount);
      
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      resolve([hex]);
    };
    
    img.onerror = () => resolve(['#a1052d']);
    img.src = imageUrl;
  });
}
