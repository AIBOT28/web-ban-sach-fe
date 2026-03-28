const fs = require('fs');
const path = require('path');

const filePaths = [
  'src/components/Layout.tsx',
  'src/pages/admin/BooksManagePage.tsx',
  'src/pages/admin/CategoriesManagePage.tsx',
  'src/pages/admin/DashboardPage.tsx',
  'src/pages/BookDetailPage.tsx',
];

const replacements = [
  // Text colors
  { match: /text-surface-100/g, replace: 'text-surface-900' },
  { match: /text-surface-200\/80/g, replace: 'text-surface-700' },
  { match: /text-surface-200\/70/g, replace: 'text-surface-600' },
  { match: /text-surface-200\/60/g, replace: 'text-surface-600' },
  { match: /text-surface-200\/50/g, replace: 'text-surface-500' },
  { match: /text-surface-200\/40/g, replace: 'text-surface-400' },
  { match: /text-surface-200\/30/g, replace: 'text-surface-400' },
  { match: /text-surface-200\/20/g, replace: 'text-surface-300' },
  { match: /text-surface-200\/15/g, replace: 'text-surface-300' },
  { match: /\btext-surface-200\b/g, replace: 'text-surface-600' }, // Only match standard text-surface-200

  // Background/Border
  { match: /bg-surface-800\/60/g, replace: 'bg-surface-100' },
  { match: /bg-surface-800\/50/g, replace: 'bg-surface-100' },
  { match: /\bbg-surface-800\b/g, replace: 'bg-white' },
  { match: /\bbg-surface-900\b/g, replace: 'bg-surface-50' },
  { match: /\bbg-surface-950\b/g, replace: 'bg-surface-100' }, // For admin layouts

  { match: /border-surface-700\/50/g, replace: 'border-surface-200' },
  { match: /border-surface-700\/30/g, replace: 'border-surface-100' },
  { match: /\bborder-surface-800\b/g, replace: 'border-surface-200' },
];

filePaths.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // For Layout.tsx, replace the top-level bg-surface-950 to bg-surface-50
    // Actually our regex handles \bbg-surface-950\b
    
    replacements.forEach(({match, replace}) => {
      content = content.replace(match, replace);
    });

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${relPath}`);
  }
});
