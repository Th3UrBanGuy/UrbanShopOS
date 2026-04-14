## Design System: Aero Resin Dashboard

### Pattern
- **Name:** Horizontal Scroll Journey
- **Conversion Focus:** Immersive product discovery. High engagement. Keep navigation visible.
- **CTA Placement:** Floating Sticky CTA or End of Horizontal Track
- **Color Strategy:** Continuous palette transition. Chapter colors. Progress bar #000000.
- **Sections:** 1. Intro (Vertical), 2. The Journey (Horizontal Track), 3. Detail Reveal, 4. Vertical Footer

### Style
- **Name:** Liquid Glass
- **Mode Support:** Light ✓ Full | Dark ✓ Full
- **Keywords:** Flowing glass, morphing, smooth transitions, fluid effects, translucent, animated blur, iridescent, chromatic aberration
- **Best For:** Premium SaaS, high-end e-commerce, creative platforms, branding experiences, luxury portfolios
- **Performance:** ⚠ Moderate-Poor | **Accessibility:** ⚠ Text contrast

### Colors
| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#334155` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#475569` | `--color-secondary` |
| Accent/CTA | `#059669` | `--color-accent` |
| Background | `#F8FAFC` | `--color-background` |
| Foreground | `#0F172A` | `--color-foreground` |
| Muted | `#F2F3F4` | `--color-muted` |
| Border | `#E6E8EA` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| Ring | `#334155` | `--color-ring` |

*Notes: Industrial slate + stock green*

### Typography
- **Heading:** Inter
- **Body:** Inter
- **Mood:** dark, cinematic, technical, precision, clean, premium, developer, professional, high-end utility
- **Best For:** Developer tools, fintech/trading, AI dashboards, streaming platforms, high-end productivity apps
- **Google Fonts:** https://fonts.google.com/share?selection.family=Inter:wght@300;400;500;600;700
- **CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

### Key Effects
Morphing elements (SVG/CSS), fluid animations (400-600ms curves), dynamic blur (backdrop-filter), color transitions

### Avoid (Anti-patterns)
- Cheap visuals
- Fast animations

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px

