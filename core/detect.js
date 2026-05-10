import fs from "fs";
import path from "path";

export function detectFramework() {
  const pkgPath = path.join(
    process.cwd(),
    "package.json"
  );

  if (!fs.existsSync(pkgPath)) {
    return "static";
  }

  const pkg = JSON.parse(
    fs.readFileSync(pkgPath, "utf-8")
  );

  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies
  };

  if (deps.next) return "next";
  if (deps.react) return "react";
  if (deps.vue) return "vue";
  if (deps.svelte) return "svelte";
  if (deps.express) return "express";

  return "static";
}
