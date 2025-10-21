/**
 * Tailwind Brand Validator Plugin
 *
 * Enforces Lab Essentials brand consistency by:
 * - Validating color usage (only CSS variables allowed)
 * - Enforcing font family tokens
 * - Validating spacing scale
 * - Warning about hardcoded values
 *
 * Usage: Add to tailwind.config.ts plugins array
 */

const plugin = require('tailwindcss/plugin');

// Lab Essentials brand tokens
const BRAND_TOKENS = {
  colors: {
    allowed: [
      'brand',
      'brand-dark',
      'brand-foreground',
      'accent',
      'accent-dark',
      'background',
      'foreground',
      'surface',
      'bg',
      'muted',
      'muted-foreground',
      'border',
      'input',
      'ring',
      'ink',
      'body',
      'card',
      'card-foreground',
      'secondary',
      'destructive',
    ],
    forbidden: [
      // Hardcoded colors that should use CSS variables instead
      '#0D9488', // Should use --brand
      '#14B8A6', // Old teal variants
      'rgb(13, 148, 136)',
      'purple',
      'violet',
      'indigo',
      'blue-500',
      'blue-600',
    ],
  },
  fonts: {
    allowed: [
      'var(--font-heading)', // Montserrat
      'var(--font-sans)',    // Roboto
      'var(--font-mono)',    // Roboto Mono
    ],
    forbidden: [
      'Arial',
      'Helvetica',
      'Times',
      'serif',
      'sans-serif', // Generic fallbacks should use CSS var
    ],
  },
  spacing: {
    // Enforce consistent spacing scale
    allowedUnits: ['rem', 'em', '%', 'vh', 'vw'],
    forbiddenUnits: ['pt'], // No points
    maxPxValue: 4, // Only allow small px values (borders, etc)
  },
};

module.exports = plugin(function({ addUtilities, theme, e, config }) {
  // This plugin adds utilities for brand validation
  // In production, you'd use a separate linter/validator

  const brandColors = {};
  BRAND_TOKENS.colors.allowed.forEach(color => {
    brandColors[`.bg-brand-${color}`] = {
      backgroundColor: `hsl(var(--${color}))`,
    };
    brandColors[`.text-brand-${color}`] = {
      color: `hsl(var(--${color}))`,
    };
    brandColors[`.border-brand-${color}`] = {
      borderColor: `hsl(var(--${color}))`,
    };
  });

  addUtilities(brandColors);
}, {
  theme: {
    extend: {
      // Enforce brand colors in theme
      colors: {
        // These map to CSS variables defined in globals.css
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          dark: 'hsl(var(--brand-dark))',
          foreground: 'hsl(var(--brand-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          dark: 'hsl(var(--accent-dark))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        surface: 'hsl(var(--surface))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      // Enforce brand fonts
      fontFamily: {
        heading: ['var(--font-heading)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      // Enforce consistent spacing scale
      spacing: {
        'section': 'var(--space-section)',
        'section-lg': 'var(--space-section-lg)',
        'gutter': 'var(--space-gutter)',
      },
      // Enforce consistent border radius
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
});

/**
 * Brand Validation Function
 * Run this during build to catch violations
 */
function validateBrandCompliance(filePath, content) {
  const violations = [];

  // Check for hardcoded colors
  BRAND_TOKENS.colors.forbidden.forEach(color => {
    if (content.includes(color)) {
      violations.push({
        type: 'color',
        file: filePath,
        issue: `Hardcoded color '${color}' found. Use CSS variable instead.`,
        severity: 'error',
      });
    }
  });

  // Check for hardcoded hex colors (except in CSS var definitions)
  const hexColorRegex = /#[0-9A-Fa-f]{6}/g;
  const hexMatches = content.match(hexColorRegex);
  if (hexMatches && !filePath.includes('globals.css')) {
    hexMatches.forEach(hex => {
      if (!content.includes(`--brand`) && !content.includes(`/* ${hex} */`)) {
        violations.push({
          type: 'color',
          file: filePath,
          issue: `Hardcoded hex color '${hex}' found. Use CSS variable instead.`,
          severity: 'warning',
        });
      }
    });
  }

  // Check for forbidden fonts
  BRAND_TOKENS.fonts.forbidden.forEach(font => {
    const fontRegex = new RegExp(`font-family:\\s*['"]?${font}['"]?`, 'i');
    if (fontRegex.test(content)) {
      violations.push({
        type: 'font',
        file: filePath,
        issue: `Forbidden font '${font}' found. Use CSS variable (--font-heading, --font-sans, --font-mono).`,
        severity: 'error',
      });
    }
  });

  // Check for large hardcoded pixel values
  const pxValueRegex = /:\s*(\d+)px/g;
  let match;
  while ((match = pxValueRegex.exec(content)) !== null) {
    const pxValue = parseInt(match[1]);
    if (pxValue > BRAND_TOKENS.spacing.maxPxValue && pxValue % 4 !== 0) {
      violations.push({
        type: 'spacing',
        file: filePath,
        issue: `Large px value '${pxValue}px' should use rem or spacing token. Use multiples of 4px or convert to rem.`,
        severity: 'warning',
      });
    }
  }

  return violations;
}

// Export validation function for use in build scripts
module.exports.validateBrandCompliance = validateBrandCompliance;
module.exports.BRAND_TOKENS = BRAND_TOKENS;
