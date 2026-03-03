# MediBook - Styling and Theming

## Overview

MediBook uses a custom CSS architecture with CSS Variables for dynamic theming, supporting both light and dark modes with a mobile-first responsive design.

## Design System

### Color Palette

#### Light Theme (Default)

```css
:root {
  --primary: #4f46e5;
  --primary-dark: #4338ca;
  --secondary: #06b6d4;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;
  
  --bg-primary: #ffffff;
  --bg-secondary: #f3f4f6;
  --bg-tertiary: #e5e7eb;
  
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  
  --border: #e5e7eb;
  --shadow: rgba(0, 0, 0, 0.1);
}
```

#### Dark Theme

```css
[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --bg-tertiary: #374151;
  
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-tertiary: #9ca3af;
  
  --border: #374151;
  --shadow: rgba(0, 0, 0, 0.3);
}
```

### Typography

| Element | Font Size | Font Weight | Line Height |
|---------|-----------|-------------|-------------|
| H1 | 2rem (32px) | 700 | 1.2 |
| H2 | 1.5rem (24px) | 600 | 1.3 |
| H3 | 1.25rem (20px) | 600 | 1.4 |
| Body | 1rem (16px) | 400 | 1.5 |
| Small | 0.875rem (14px) | 400 | 1.5 |
| Caption | 0.75rem (12px) | 400 | 1.4 |

### Spacing Scale

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
```

### Border Radius

```css
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.5rem;   /* 8px */
--radius-lg: 0.75rem;  /* 12px */
--radius-xl: 1rem;     /* 16px */
--radius-full: 9999px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

## Component Styles

### Buttons

#### Primary Button

```css
.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

#### Secondary Button

```css
.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
```

#### Danger Button

```css
.btn-danger {
  background: var(--danger);
  color: white;
}
```

### Cards

```css
.card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}
```

### Forms

#### Input Fields

```css
.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
}
```

#### Form Labels

```css
.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
  color: var(--text-primary);
}
```

### Modals

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-xl);
}
```

### Navigation

#### Desktop Navbar

```css
.navbar {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
  padding: var(--space-4) var(--space-6);
  position: sticky;
  top: 0;
  z-index: 100;
}
```

#### Mobile Bottom Nav

```css
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-around;
  padding: var(--space-2) 0;
  z-index: 100;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.mobile-nav-item.active {
  color: var(--primary);
}
```

## Responsive Design

### Breakpoints

```css
/* Mobile First */
/* Default: < 640px */

/* Tablet */
@media (min-width: 640px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1280px) { }
```

### Responsive Patterns

#### Grid Layout

```css
.grid-responsive {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr; /* Mobile */
}

@media (min-width: 640px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

#### Container

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}
```

## Theme Toggle

### Implementation

```javascript
// Toggle theme
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
```

### Theme Icon

```html
<button onclick="toggleTheme()" class="theme-toggle">
  <span class="light-icon">☀️</span>
  <span class="dark-icon">🌙</span>
</button>
```

```css
.theme-toggle .dark-icon {
  display: none;
}

[data-theme="dark"] .theme-toggle .light-icon {
  display: none;
}

[data-theme="dark"] .theme-toggle .dark-icon {
  display: inline;
}
```

## Animation & Transitions

### Standard Transitions

```css
/* Default transition */
.transition {
  transition: all 0.3s ease;
}

/* Fast transition */
.transition-fast {
  transition: all 0.15s ease;
}

/* Slow transition */
.transition-slow {
  transition: all 0.5s ease;
}
```

### Page Transitions

```css
.page {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Loading Spinner

```css
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

## Toast Notifications

```css
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  color: white;
  font-weight: 500;
  z-index: 1000;
  animation: slideUp 0.3s ease;
}

.toast-success {
  background: var(--success);
}

.toast-error {
  background: var(--danger);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
```

## Print Styles

```css
@media print {
  .no-print {
    display: none !important;
  }
  
  body {
    background: white;
    color: black;
  }
  
  .receipt {
    box-shadow: none;
    border: 1px solid #ccc;
  }
}
```

## Best Practices

### CSS Organization

1. **Variables First**: Define all CSS variables at the top
2. **Base Styles**: Reset and base element styles
3. **Components**: Reusable component styles
4. **Utilities**: Helper classes
5. **Responsive**: Media queries at the end

### Naming Conventions

- **BEM Methodology**: `.block__element--modifier`
- **Kebab-case**: `.my-class-name`
- **Semantic**: `.btn-primary` not `.blue-button`

### Performance

- Minimize specificity
- Avoid deep nesting
- Use CSS variables for theming
- Prefer `transform` and `opacity` for animations

---

**Document Version**: 1.0  
**Last Updated**: 2025
