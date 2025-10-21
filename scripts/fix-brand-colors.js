#!/usr/bin/env node

/**
 * Brand Color Migration Script
 *
 * Automatically replaces hardcoded legacy colors with Lab Essentials brand CSS variables.
 *
 * Replacements:
 * - blue-500, blue-600, #3B82F6 → var(--brand) (Bright Teal)
 * - purple-500, purple-600, purple → var(--brand) (context-specific)
 * - #10B981 (green) → var(--accent) (Safety Yellow/Accent)
 * - #F59E0B (amber) → var(--accent) (Safety Yellow)
 *
 * Usage:
 *   node scripts/fix-brand-colors.js [--dry-run] [--path=src/app/admin]
 */

const fs = require('fs');
const path = require('path');

// Color mapping: legacy → brand variable
const COLOR_REPLACEMENTS = {
  // Tailwind blue → Brand Teal
  'bg-blue-500': 'bg-[hsl(var(--brand))]',
  'bg-blue-600': 'bg-[hsl(var(--brand-dark))]',
  'text-blue-500': 'text-[hsl(var(--brand))]',
  'text-blue-600': 'text-[hsl(var(--brand-dark))]',
  'text-blue-900': 'text-[hsl(var(--ink))]',
  'text-blue-800': 'text-[hsl(var(--foreground))]',
  'border-blue-200': 'border-[hsl(var(--brand))]/20',
  'border-blue-500': 'border-[hsl(var(--brand))]',
  'border-blue-600': 'border-[hsl(var(--brand-dark))]',
  'border-b-2 border-blue-600': 'border-b-2 border-[hsl(var(--brand-dark))]',
  'hover:bg-blue-600': 'hover:bg-[hsl(var(--brand-dark))]',
  'hover:bg-blue-700': 'hover:bg-[hsl(var(--brand-dark))]',
  'focus:ring-blue-500': 'focus:ring-[hsl(var(--brand))]',

  // Tailwind purple → Brand Teal (primary) or Accent
  'bg-purple-500': 'bg-[hsl(var(--brand))]',
  'bg-purple-600': 'bg-[hsl(var(--brand-dark))]',
  'bg-purple-700': 'bg-[hsl(var(--brand-dark))]',
  'text-purple-500': 'text-[hsl(var(--brand))]',
  'text-purple-600': 'text-[hsl(var(--brand-dark))]',
  'border-purple-200': 'border-[hsl(var(--brand))]/20',
  'from-purple-600': 'from-[hsl(var(--brand-dark))]',
  'from-purple-700': 'from-[hsl(var(--brand-dark))]',
  'to-blue-600': 'to-[hsl(var(--brand-dark))]',
  'to-blue-700': 'to-[hsl(var(--brand-dark))]',
  'hover:from-purple-700': 'hover:from-[hsl(var(--brand-dark))]',
  'hover:to-blue-700': 'hover:to-[hsl(var(--brand-dark))]',

  // Tailwind violet → Brand Teal
  'bg-violet-500': 'bg-[hsl(var(--brand))]',
  'bg-violet-600': 'bg-[hsl(var(--brand-dark))]',
  'text-violet-500': 'text-[hsl(var(--brand))]',
  'text-violet-600': 'text-[hsl(var(--brand-dark))]',

  // Tailwind indigo → Brand Teal
  'bg-indigo-500': 'bg-[hsl(var(--brand))]',
  'bg-indigo-600': 'bg-[hsl(var(--brand-dark))]',
  'text-indigo-500': 'text-[hsl(var(--brand))]',
  'text-indigo-600': 'text-[hsl(var(--brand-dark))]',

  // Legacy hex colors
  '#3B82F6': 'hsl(var(--brand))',        // Blue-500
  '#2563EB': 'hsl(var(--brand-dark))',   // Blue-600
  '#10B981': 'hsl(var(--accent))',       // Emerald-500
  '#059669': 'hsl(var(--accent-dark))',  // Emerald-600
  '#F59E0B': 'hsl(var(--accent))',       // Amber-500
  '#D97706': 'hsl(var(--accent-dark))',  // Amber-600
  '#8B5CF6': 'hsl(var(--brand))',        // Violet-500
  '#7C3AED': 'hsl(var(--brand-dark))',   // Violet-600
  '#6366F1': 'hsl(var(--brand))',        // Indigo-500
  '#4F46E5': 'hsl(var(--brand-dark))',   // Indigo-600

  // Named colors
  "'purple'": "'hsl(var(--brand))'",
  '"purple"': '"hsl(var(--brand))"',
  "'blue'": "'hsl(var(--brand))'",
  '"blue"': '"hsl(var(--brand))"',
  "'violet'": "'hsl(var(--brand))'",
  '"violet"': '"hsl(var(--brand))"',

  // Background color variants
  'bg-blue-50': 'bg-[hsl(var(--brand))]/5',
  'bg-blue-100': 'bg-[hsl(var(--brand))]/10',
  'bg-purple-50': 'bg-[hsl(var(--brand))]/5',
  'bg-purple-100': 'bg-[hsl(var(--brand))]/10',
  'bg-violet-50': 'bg-[hsl(var(--brand))]/5',
  'text-purple-700': 'text-[hsl(var(--brand-dark))]',
  'focus:ring-purple-500': 'focus:ring-[hsl(var(--brand))]',
  'border-l-blue-500': 'border-l-[hsl(var(--brand))]',
  'border-l-purple-500': 'border-l-[hsl(var(--brand))]',

  // Common legacy patterns in inline styles
  'backgroundColor: "#3B82F6"': 'backgroundColor: "hsl(var(--brand))"',
  'backgroundColor: "#8B5CF6"': 'backgroundColor: "hsl(var(--brand))"',
  'color: "#3B82F6"': 'color: "hsl(var(--brand))"',
  'color: "#8B5CF6"': 'color: "hsl(var(--brand))"',

  // Gradient combinations (must come last for longest match first)
  'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700': 'bg-gradient-to-r from-[hsl(var(--brand-dark))] to-[hsl(var(--brand-dark))] hover:from-[hsl(var(--brand-dark))] hover:to-[hsl(var(--brand-dark))]',
  'bg-gradient-to-r from-purple-600 to-blue-600': 'bg-gradient-to-r from-[hsl(var(--brand-dark))] to-[hsl(var(--brand-dark))]',
  'bg-gradient-to-r from-blue-500 to-purple-600': 'bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))]',
  'from-blue-500 to-purple-600': 'from-[hsl(var(--brand))] to-[hsl(var(--brand-dark))]',
};

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const pathArg = args.find(arg => arg.startsWith('--path='));
const targetPath = pathArg ? pathArg.split('=')[1] : 'src';

const SRC_DIR = path.join(__dirname, '..', targetPath);
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css'];
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  'build',
  'dist',
  '__tests__',
  'globals.css', // Don't modify root CSS variables
];

/**
 * Recursively find all source files
 */
function findSourceFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ Directory not found: ${dir}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(SRC_DIR, fullPath);

    if (EXCLUDE_PATTERNS.some(pattern => relativePath.includes(pattern))) {
      continue;
    }

    if (entry.isDirectory()) {
      findSourceFiles(fullPath, files);
    } else if (EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Replace colors in file content
 */
function replaceColors(content, filePath) {
  let modified = content;
  const changes = [];

  for (const [oldColor, newColor] of Object.entries(COLOR_REPLACEMENTS)) {
    const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);

    if (matches) {
      modified = modified.replace(regex, newColor);
      changes.push({
        old: oldColor,
        new: newColor,
        count: matches.length,
      });
    }
  }

  return { modified, changes };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { modified, changes } = replaceColors(content, filePath);

  if (changes.length === 0) {
    return null; // No changes needed
  }

  const relativePath = path.relative(process.cwd(), filePath);

  if (!isDryRun) {
    fs.writeFileSync(filePath, modified, 'utf8');
  }

  return {
    file: relativePath,
    changes,
  };
}

/**
 * Main execution
 */
function main() {
  console.log('🎨 Lab Essentials Brand Color Migration\n');

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  console.log(`📂 Scanning: ${targetPath}/`);
  console.log(`🎯 Target: Replace legacy colors with brand CSS variables\n`);

  const files = findSourceFiles(SRC_DIR);
  console.log(`Found ${files.length} source files\n`);

  const results = [];
  let totalReplacements = 0;

  for (const filePath of files) {
    const result = processFile(filePath);
    if (result) {
      results.push(result);
      const fileReplacements = result.changes.reduce((sum, c) => sum + c.count, 0);
      totalReplacements += fileReplacements;
    }
  }

  if (results.length === 0) {
    console.log('✅ No legacy colors found! All files already use brand CSS variables.\n');
    process.exit(0);
  }

  // Print results
  console.log('📝 Changes Made:\n');

  results.forEach(({ file, changes }) => {
    console.log(`📄 ${file}`);
    changes.forEach(({ old, new: newVal, count }) => {
      console.log(`   ${old} → ${newVal} (${count}x)`);
    });
    console.log();
  });

  // Summary
  console.log('━'.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   Files modified: ${results.length}`);
  console.log(`   Total replacements: ${totalReplacements}`);
  console.log(`   Files scanned: ${files.length}\n`);

  // Color mapping reference
  console.log('🎨 Brand Color Mapping:\n');
  console.log('   Legacy              →  Brand Variable');
  console.log('   ─────────────────────────────────────');
  console.log('   blue-500, #3B82F6   →  var(--brand)       (Bright Teal)');
  console.log('   blue-600, #2563EB   →  var(--brand-dark)  (Darker Teal)');
  console.log('   purple, violet      →  var(--brand)       (Bright Teal)');
  console.log('   #10B981 (green)     →  var(--accent)      (Safety Yellow)');
  console.log('   #F59E0B (amber)     →  var(--accent)      (Safety Yellow)');
  console.log();

  if (isDryRun) {
    console.log('💡 Tip: Run without --dry-run to apply changes\n');
  } else {
    console.log('✅ All changes applied successfully!\n');
    console.log('Next steps:');
    console.log('1. Review changes with: git diff');
    console.log('2. Test the application: npm run dev');
    console.log('3. Run validation: npm run validate:brand');
    console.log('4. Commit: git add . && git commit -m "fix: migrate legacy colors to brand CSS variables"\n');
  }
}

// Run migration
main();
