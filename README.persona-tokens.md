# Persona Token Compliance

## How to Keep Styles Persona-Token Compliant

- **Never use hardcoded green, emerald, or lime colors, or their hex codes/classes.**
- **All accent colors must use tokens:**
  - Use `bg-[hsl(var(--brand))]`, `text-[hsl(var(--ink))]`, `text-[hsl(var(--muted))]` for accents and text.
  - Use only gray/slate for neutrals.
- **Persona palettes:**
  - Source all persona colors from `[data-persona]` CSS variables.
  - Never set green hues for any persona.
- **Fonts:**
  - Use Inter (sans), Source Serif 4 (serif), and a mono font for specs.
- **Animations:**
  - Only use fade, hover-lift, and hover-scale. Remove or avoid noisy/unused effects.
- **Verification:**
  - Grep for banned classes/tokens before merging.
  - Ensure no visual regressions when persona is unset.
  - Personas must swap colors only via CSS vars.

**If in doubt, ask for review before introducing new color or animation tokens.**
