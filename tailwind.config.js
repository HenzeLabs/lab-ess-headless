module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        koala: {
          green: "#2D5A3D",
          "green-light": "#4A7861",
          "green-dark": "#1F3B2A",
          beige: "#F7F5F2",
          cream: "#FBF9F6",
          gray: "#6B7280",
          "gray-light": "#F5F5F5",
          "gray-dark": "#374151",
          yellow: "#FFC107",
          badge: {
            bestseller: "#FF6B6B",
            luxury: "#8B5CF6",
            new: "#10B981",
          },
        },
        primary: "#2D5A3D",
        secondary: "#F7F5F2",
        accent: "#FFC107",
        background: "#FFFFFF",
        foreground: "#1F2937",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        heading: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      fontSize: {
        hero: ["3.5rem", { lineHeight: "1.1", fontWeight: "700" }],
        "hero-mobile": ["2.5rem", { lineHeight: "1.15", fontWeight: "700" }],
        section: ["2.5rem", { lineHeight: "1.2", fontWeight: "600" }],
        "card-title": ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        card: "0 2px 8px 0 rgba(0, 0, 0, 0.08)",
        elevated: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        button: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        card: "12px",
        button: "8px",
        badge: "20px",
      },
      spacing: {
        section: "5rem",
        "section-mobile": "3rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in",
        "slide-up": "slideUp 0.6s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
