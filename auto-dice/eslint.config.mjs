import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config(
  eslint.configs.recommended,
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/coverage/**",
      "**/storybook-static/**",
      "apps/web/public/sw.js",
      "apps/web/public/workbox-*.js",
      "apps/web/next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript").map((config) => ({
    ...config,
    files: ["apps/web/**/*.{ts,tsx,js,jsx}"],
    settings: {
      ...config.settings,
      next: { rootDir: "apps/web" },
    },
  })),
  {
    ignores: ["apps/web/scripts/**"],
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["packages/domain/**/*.ts"],
  })),
);
