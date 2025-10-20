// eslint.config.js
import js from "@eslint/js";
import react from "eslint-plugin-react";
import prettier from "eslint-plugin-prettier";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: true,
        document: true,
        localStorage: true,
        alert: true,
        confirm: true,
        console: true,
        JSX: true,
      },
    },
    plugins: {
      react,
      "@typescript-eslint": tseslint,
      prettier,
    },
    rules: {
      // 🧹 Formato y estilo
      "prettier/prettier": ["warn", { endOfLine: "auto" }],

      // ⚛️ React
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/display-name": "off",

      // 🧠 TypeScript
      "@typescript-eslint/no-unused-vars": ["warn"],
      "@typescript-eslint/no-explicit-any": "off",

      // 🧩 Generales
      "no-console": "off",
      "no-alert": "off",
      "no-undef": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
];
