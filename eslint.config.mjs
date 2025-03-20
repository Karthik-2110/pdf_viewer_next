import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Files and directories to ignore
    ignores: [
      // Build output
      ".next/**",
      "out/**",
      
      // Node modules
      "node_modules/**",
      
      // Package files
      "package-lock.json",
      
      // Public files
      "public/**",
      
      // Config files
      "next.config.ts",
      "next.config.js",
      "postcss.config.mjs",
      "tailwind.config.ts",
      
      // Environment files
      ".env*"
    ],
    rules: {
     "@typescript-eslint/no-unused-vars": "off", // Completely disable unused vars check
      "@typescript-eslint/no-explicit-any": "off", // Completely disable any type check
      "react-hooks/exhaustive-deps": "off", // Completely disable dependency array check
      "react/no-unescaped-entities": "off", // Turn off completely
    },
  }
];

export default eslintConfig;
