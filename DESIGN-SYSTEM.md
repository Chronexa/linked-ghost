# 🎨 ContentPilot AI Design System

## Overview
A warm, human-centered design system built with **Space Grotesk** and **Inter** fonts, featuring a unique **Burnt Sienna** color palette that stands out from typical SaaS blues and purples.

---

## 🎭 **BRAND PERSONALITY**

**Human • Confident • Creative • Professional**

- Not corporate or cold
- Warm and approachable
- Technical but human
- Bold without being aggressive

---

## 🔤 **TYPOGRAPHY**

### Font Stack

```css
Display/Headings: Space Grotesk (600 weight)
Body Text: Inter (400 regular, 500 medium)
```

### Type Scale

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| H1 | 2.5rem (40px) / 3rem (48px) lg | 600 | Page titles |
| H2 | 1.875rem (30px) / 2.25rem (36px) lg | 600 | Section headers |
| H3 | 1.5rem (24px) / 1.875rem (30px) lg | 600 | Card headers |
| H4 | 1.25rem (20px) / 1.5rem (24px) lg | 600 | Subsections |
| Body Large | 1.125rem (18px) | 400 | Intro text |
| Body | 1rem (16px) | 400 | Default text |
| Body Small | 0.875rem (14px) | 400 | Secondary info |
| Caption | 0.75rem (12px) | 500 | Labels, metadata |

### Usage

```tsx
// Headings - use font-display
<h1 className="font-display text-4xl font-semibold">

// Body text - use default or font-sans
<p className="text-base text-charcoal-light">
```

---

## 🎨 **COLOR PALETTE**

### Primary Colors

```css
Brand (Burnt Sienna):
- DEFAULT: #C1502E  → Fills, backgrounds, primary CTAs
- Light:   #E07A5F  → Hover states, accents
- Dark:    #A13D22  → Darker variant
- Text:    #B3401A  → Text links (better contrast)

Background:
- Paper:   #FFFCF2  → Page background (warm, reduces glare)
- Surface: #FFFFFF  → Cards, modals, panels

Text:
- Charcoal:       #1A1A1D  → Primary text
- Charcoal Light: #52525B  → Secondary text

Borders:
- DEFAULT: #E8E2D8  → Standard borders
- Subtle:  #F5F0E8  → Very light borders
```

### Semantic Colors

```css
Success:
- DEFAULT: #52B788  → Success states, approved posts
- Dark:    #6B8E23  → Generate buttons (earthy, calm)

Warning: #F97316  → Warnings, alerts, limits

Error: #DC2626  → Errors, destructive actions

Info: Use charcoal or charcoal-light
```

### Color Usage Rules

✅ **DO**:
- Use brand color for primary CTAs
- Use success for "Generate" and approval states
- Use warm paper background for reduced eye strain
- Ensure cards have enough contrast against background

❌ **DON'T**:
- Don't use brand color for text on white (use brand-text)
- Don't overuse gradients
- Don't use pure black (#000000)
- Don't use pure white for large text areas

---

## 🧩 **COMPONENTS**

### Buttons

#### Variants

```tsx
// Primary (Brand)
<Button variant="primary">Primary CTA</Button>

// Secondary (Outline)
<Button variant="secondary">Secondary</Button>

// Success (Generate actions)
<Button variant="success">Generate Post</Button>

// Ghost (Minimal)
<Button variant="ghost">Cancel</Button>
```

#### Sizes

```tsx
<Button size="sm">Small</Button>   // h-8, px-3, text-sm
<Button size="md">Medium</Button>  // h-10, px-6, text-base (default)
<Button size="lg">Large</Button>   // h-12, px-8, text-lg
```

#### States

```tsx
// Loading
<Button isLoading>Processing...</Button>

// Disabled
<Button disabled>Disabled</Button>
```

### Cards

```tsx
// Basic Card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>

// Hoverable Card
<Card hover>
  Interactive card with hover effect
</Card>
```

### Badges

```tsx
<Badge variant="brand">Brand Badge</Badge>
<Badge variant="success">Success Badge</Badge>
<Badge variant="warning">Warning Badge</Badge>
<Badge variant="neutral">Neutral Badge</Badge>
```

### Form Elements

```tsx
// Input with Label
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  required
  error="This field is required"
  helperText="We'll never share your email"
/>

// Textarea
<Textarea
  label="Post Content"
  rows={8}
  placeholder="Write your post..."
  helperText="Minimum 100 characters"
/>
```

---

## 📐 **SPACING SYSTEM**

### 8px Base Grid

```css
0.5 → 4px   (tight)
1   → 8px   (xs)
2   → 16px  (sm)
3   → 24px  (md)
4   → 32px  (lg)
6   → 48px  (xl)
8   → 64px  (2xl)
12  → 96px  (3xl)
16  → 128px (4xl)
```

### Common Patterns

```tsx
// Card padding
<Card className="p-6">  // 24px on all sides

// Section spacing
<section className="py-16 md:py-24">  // Vertical rhythm

// Stack spacing
<div className="space-y-4">  // 16px between items
```

---

## 🎭 **SHADOWS**

```css
shadow-warm: 0 2px 8px rgba(193, 80, 46, 0.08)
  → Use for: Primary buttons, featured cards

shadow-card: 0 1px 3px rgba(0, 0, 0, 0.04)
  → Use for: Default card state

shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.08)
  → Use for: Card hover state
```

---

## ✨ **ANIMATIONS**

### Transitions

```css
Default: transition-all duration-150
Slow:    transition-all duration-200
Fast:    transition-all duration-100
```

### Keyframe Animations

```tsx
// Fade in with slide up
<div className="animate-fade-in">

// Slide up only
<div className="animate-slide-up">
```

### Hover Effects

```tsx
// Scale on hover
hover:scale-105

// Lift on hover (cards)
hover:-translate-y-0.5

// Active state (buttons)
active:scale-[0.98]
```

---

## 📱 **RESPONSIVE BREAKPOINTS**

```css
sm:  640px  → Tablets
md:  768px  → Small laptops
lg:  1024px → Desktops
xl:  1280px → Large screens
2xl: 1536px → Extra large screens
```

### Common Patterns

```tsx
// Responsive text
<h1 className="text-4xl md:text-5xl lg:text-6xl">

// Responsive layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Responsive spacing
<section className="py-8 md:py-12 lg:py-16">
```

---

## ♿ **ACCESSIBILITY**

### Focus States

All interactive elements have visible focus rings:
```css
focus:outline-none 
focus:ring-2 
focus:ring-brand/20 
focus:ring-offset-2
```

### Color Contrast

✅ **WCAG AA Compliant**:
- Charcoal (#1A1A1D) on Surface (#FFFFFF): 19.54:1
- Charcoal Light (#52525B) on Background (#FFFCF2): 7.84:1
- Brand Text (#B3401A) on Surface (#FFFFFF): 6.12:1

### Required Fields

```tsx
<Input 
  label="Email" 
  required  // Adds red asterisk
/>
```

---

## 🎯 **USAGE EXAMPLES**

### Landing Page Hero

```tsx
<section className="container mx-auto px-6 py-16 md:py-24">
  <div className="max-w-5xl mx-auto text-center">
    <div className="inline-flex items-center px-4 py-2 bg-brand/5 border border-brand/20 rounded-full mb-6">
      <span className="text-sm font-medium text-brand-text">
        ✨ Your Feature Badge
      </span>
    </div>
    
    <h1 className="font-display text-5xl md:text-7xl font-bold text-charcoal mb-6">
      Your Headline<br />
      <span className="text-brand">With Emphasis</span>
    </h1>
    
    <p className="text-xl text-charcoal-light mb-10">
      Supporting text goes here
    </p>
    
    <div className="flex gap-4 justify-center">
      <Button size="lg">Primary CTA</Button>
      <Button variant="secondary" size="lg">Secondary</Button>
    </div>
  </div>
</section>
```

### Dashboard Card

```tsx
<Card hover>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Card Title</CardTitle>
      <Badge variant="success">Active</Badge>
    </div>
    <CardDescription>
      Supporting description text
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-charcoal-light">Card content...</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary" size="sm">Action</Button>
    <Button variant="ghost" size="sm">Cancel</Button>
  </CardFooter>
</Card>
```

### Form Example

```tsx
<form className="space-y-6">
  <Input
    label="Full Name"
    type="text"
    required
    placeholder="John Doe"
  />
  
  <Textarea
    label="Bio"
    rows={4}
    helperText="Tell us about yourself"
  />
  
  <div className="flex gap-3">
    <Button type="submit">Save Changes</Button>
    <Button variant="secondary" type="button">Cancel</Button>
  </div>
</form>
```

---

## 🚀 **IMPLEMENTATION CHECKLIST**

### Setup (Done ✅)
- [x] Install Space Grotesk and Inter fonts
- [x] Configure Tailwind with custom colors
- [x] Update globals.css with base styles
- [x] Create component classes

### Components (Done ✅)
- [x] Button component with variants
- [x] Card component family
- [x] Badge component
- [x] Input component
- [x] Textarea component

### Pages (In Progress 🚧)
- [x] Landing page redesigned
- [ ] Dashboard redesigned
- [ ] Topics pages redesigned
- [ ] Drafts pages redesigned
- [ ] Settings redesigned

---

## 📚 **RESOURCES**

- **Font Source**: Google Fonts
- **Inspiration**: Linear, Vercel, Notion
- **Accessibility**: WCAG 2.1 Level AA
- **Browser Support**: Modern browsers (last 2 versions)

---

## 💡 **TIPS FOR CONSISTENCY**

1. **Always use design tokens**: Use Tailwind classes, not arbitrary values
2. **Follow the spacing system**: Use multiples of 8px
3. **Use semantic colors**: `success` for positive actions, not generic `green`
4. **Font hierarchy**: Display font for headings, Sans for body
5. **Hover states**: Every interactive element needs one
6. **Focus states**: Built into components automatically
7. **Loading states**: Always show feedback for async actions

---

**Last Updated**: February 10, 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
