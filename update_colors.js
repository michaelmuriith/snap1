const fs = require('fs');

let css = fs.readFileSync('resources/css/app.css', 'utf8');

// Theming with Rose/Pink (matching Tailwind's rose-600 mostly)
// Light mode
css = css.replace(/--primary: oklch\(0\.205 0 0\);/g, '--primary: oklch(0.525 0.223 15.0); /* rose-600 */');
css = css.replace(/--primary-foreground: oklch\(0\.985 0 0\);/g, '--primary-foreground: oklch(0.985 0 0);');

css = css.replace(/--sidebar-primary: oklch\(0\.205 0 0\);/g, '--sidebar-primary: oklch(0.525 0.223 15.0);');
css = css.replace(/--sidebar-primary-foreground: oklch\(0\.985 0 0\);/g, '--sidebar-primary-foreground: oklch(0.985 0 0);');

css = css.replace(/--selection:bg: oklch\(0\.205 0 0\);/g, '--selection:bg: oklch(0.525 0.223 15.0);');

// Dark mode (inside .dark)
// We need to be careful with the replacements inside .dark
const darkModeStart = css.indexOf('.dark {');
const darkModeEnd = css.indexOf('}', darkModeStart);
let darkSection = css.substring(darkModeStart, darkModeEnd);

darkSection = darkSection.replace(/--primary: oklch\(0\.985 0 0\);/g, '--primary: oklch(0.62 0.233 15.0); /* rose-500 */');
darkSection = darkSection.replace(/--primary-foreground: oklch\(0\.205 0 0\);/g, '--primary-foreground: oklch(0.985 0 0);');

darkSection = darkSection.replace(/--sidebar-primary: oklch\(0\.985 0 0\);/g, '--sidebar-primary: oklch(0.62 0.233 15.0);');
darkSection = darkSection.replace(/--sidebar-primary-foreground: oklch\(0\.985 0 0\);/g, '--sidebar-primary-foreground: oklch(0.985 0 0);');

css = css.substring(0, darkModeStart) + darkSection + css.substring(darkModeEnd);

fs.writeFileSync('resources/css/app.css', css);
console.log('App CSS updated.');
