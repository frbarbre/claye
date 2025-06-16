import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["cjs"], // CommonJS for Node.js CLI
  target: "node18",
  outDir: "dist",
  clean: true,
  minify: true,
  bundle: true,
  splitting: false,
  sourcemap: false,
  onSuccess: async () => {
    // Make the file executable after build
    const { chmod } = await import("fs/promises");
    await chmod("dist/index.js", "755");
  },
});
