

# Founder Page — Integration Plan

## Overview
Add a new `/founder` page as the second pre-sign-in page, converting the provided HTML into a React component using the existing Tailwind/Bebas Neue/neon-orange design system. Link it from the landing page and navigation.

## Content Sections (from provided HTML)
1. **Hero** — "NOT A GURU. JUST SOMEONE WHO GETS IT."
2. **Founder Photo** — Spinning orange ring with photo placeholder (user can add image later)
3. **Opener Statement** — Big quote about building Unbreakable
4. **Origin Story** — "WHERE IT STARTED" section
5. **Three Pillars** — Ability / Mindset / Longevity cards (matching existing pillar style)
6. **Core Beliefs** — Numbered belief cards
7. **What Showing Up Looks Like** — Chip tags
8. **Timeline** — Journey milestones with orange dot timeline
9. **Orange Block** — Highlighted founder statement
10. **CTA** — "START YOUR JOURNEY" sign-up button

## Technical Approach

### 1. Create `src/pages/Founder.tsx`
- Convert all HTML sections to React/Tailwind using existing design tokens (`text-primary`, `bg-card`, `border-border`, `font-display`, `neon-glow-subtle`, etc.)
- Use `motion` from framer-motion for scroll animations (matching LandingPage pattern)
- Reuse `ThemedLogo`, `Button`, `Card`, `UnifiedFooter`, `NavigationDrawer`, `ThemeToggle` components
- Accept `onSignIn`/`onSignUp` props same as LandingPage
- Photo placeholder — use the spinning ring CSS animation with a placeholder icon; user can replace with real image later

### 2. Update `src/App.tsx`
- Add route: `<Route path="/founder" element={<Index />} />` — or more cleanly, a dedicated page that mirrors the Index pattern for unauthenticated access

### 3. Update `src/pages/Index.tsx`
- Pass through to LandingPage unchanged; the Founder page is a separate route

### 4. Update `src/components/landing/LandingPage.tsx`
- Add a "MEET THE FOUNDER" link/button in the footer or coach banner area pointing to `/founder`

### 5. Cross-linking
- Founder page header nav includes "Back to Home" and "Start Your Journey" buttons
- Founder page CTA triggers the same auth modal sign-up flow

### Key Style Mappings (HTML → Tailwind)
| HTML class | Tailwind equivalent |
|---|---|
| `var(--orange)` | `text-primary` / `bg-primary` |
| `var(--dark)` | `bg-background` (dark mode) |
| `var(--card)` | `bg-card` |
| `var(--border)` | `border-border` |
| `font-family: Bebas Neue` | `font-display` |
| `var(--soft)` / `var(--muted)` | `text-muted-foreground` |
| Orange glow effects | `neon-glow-subtle` / `neon-border-subtle` |
| Pull quote left border | `border-l-4 border-primary bg-primary/10` (already used in LandingPage) |

### Files to Create/Edit
- **Create**: `src/pages/Founder.tsx`
- **Edit**: `src/App.tsx` (add route)
- **Edit**: `src/components/landing/LandingPage.tsx` (add founder link)

