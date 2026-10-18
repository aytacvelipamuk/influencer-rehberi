import { configDefaults, defineConfig } from "vitest/config";

// .next/standalone derlemede test dosyalarının kopyası var; iki kez koşmasın.
export default defineConfig({ test: { exclude: [...configDefaults.exclude, ".next/**"] } });
