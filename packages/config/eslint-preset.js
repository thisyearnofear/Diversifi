module.exports = {
  extends: [
    "next",
    "prettier",
    "plugin:tailwindcss/recommended",
  ],
  settings: {
    next: {
      rootDir: ["apps/*/", "packages/*/"],
    },
    tailwindcss: {
      config: "tailwind.config.js",
    },
  },
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/jsx-key": "warn",
    "tailwindcss/no-custom-classname": "warn",
  },
};
