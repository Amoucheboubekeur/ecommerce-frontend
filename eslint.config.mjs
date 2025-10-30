import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import tseslint from "@typescript-eslint/eslint-plugin";

export default defineConfig([
  ...next,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
]);
