# TROUBLESHOOTING.md

## Lab Essentials Next.js + Tailwind: Common Pitfalls & Fixes

This file documents critical issues and solutions for future developers and LLM agents working on this project. **Read this before making config or dependency changes!**

---

### 1. Tailwind CSS Not Applying

- **Symptoms:** No Tailwind styles, only plain HTML.
- **Root Causes:**
  - Multiple Tailwind config files (e.g., both `tailwind.config.js` and `tailwind.config.ts`).
  - Wrong PostCSS plugin in `postcss.config.js`.
  - Tailwind v4+ is not fully compatible with Next.js 15 as of 2025.
- **Fix:**
  - Use only `tailwind.config.ts` (delete any `.js` version).
  - In `postcss.config.js`, use:
    ```js
    module.exports = {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    };
    ```
  - Use Tailwind v3.4.3 for full compatibility: `npm install tailwindcss@3.4.3`
  - Remove `@tailwindcss/postcss` from dependencies.

---

### 2. Build/Runtime Errors (ENOENT, Type Errors)

- **Symptoms:** ENOENT errors, type errors in dynamic routes, build fails.
- **Fix:**
  - Ensure all dynamic route files export a valid React component.
  - Use `props: any` in dynamic route components if type errors persist.
  - Delete `.next`, `.turbo`, and `tsconfig.tsbuildinfo` after major config changes.

---

### 3. PostCSS Plugin Confusion

- **Symptoms:** Errors like "Cannot apply unknown utility class" or "use @tailwindcss/postcss".
- **Fix:**
  - For Tailwind v3.4.3, use only `tailwindcss` in `postcss.config.js`.
  - Do NOT use `@tailwindcss/postcss` as a plugin.

---

### 4. Next.js + Tailwind v4+ Compatibility

- **Symptoms:** Persistent build errors, utility classes not recognized.
- **Fix:**
  - Downgrade to Tailwind v3.4.3 until Next.js 15+ officially supports Tailwind v4+.

---

### 5. General Best Practices

- Use only one Tailwind config file (`tailwind.config.ts`).
- Always check Tailwind and Next.js compatibility before upgrading.
- Use mock data structured for real API integration during development.
- Document all fixes and keep this troubleshooting log up to date.

---

**LLM Agent Note:**
If you are an AI agent or developer, always check this file before making changes to Tailwind, Next.js, or PostCSS configuration. Follow the above steps to avoid common pitfalls and save hours of debugging.
