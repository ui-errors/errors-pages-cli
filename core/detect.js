import fs from "fs";
import path from "path";

function exists(p) {
  return fs.existsSync(path.join(process.cwd(), p));
}

/**
 * Main project detection (existing function)
 */
export function detectProject() {
  const pkgPath = path.join(process.cwd(), "package.json");

  if (!fs.existsSync(pkgPath)) {
    return {
      framework: "static",
      structure: null,
    };
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  let framework = "static";

  // -------------------------
  // FRAMEWORK DETECTION
  // -------------------------
  if (deps.next) framework = "next";
  else if (deps.react) framework = "react";
  else if (deps.vue) framework = "vue";
  else if (deps.svelte) framework = "svelte";
  else if (deps.express) framework = "express";
  else if (deps.vite) framework = "vite";

  // -------------------------
  // STRUCTURE DETECTION
  // -------------------------
  let structure = null;

  if (framework === "next") {
    if (exists("src/app")) structure = "src-app";
    else if (exists("app")) structure = "app";
    else if (exists("src/pages")) structure = "src-pages";
    else if (exists("pages")) structure = "pages";
    else structure = "unknown";
  }

  if (framework === "react") {
    if (exists("src/pages")) structure = "src-pages";
    else if (exists("src")) structure = "src";
    else structure = "flat";
  }

  if (framework === "vue") {
    if (exists("src/views")) structure = "views";
    else if (exists("src/pages")) structure = "pages";
    else structure = "flat";
  }

  if (framework === "svelte") {
    if (exists("src/routes")) structure = "routes";
    else structure = "flat";
  }

  if (framework === "express") {
    if (exists("views")) structure = "views";
    else if (exists("src/views")) structure = "src-views";
    else structure = "flat";
  }

  if (framework === "vite") {
    if (exists("src")) structure = "src";
    else structure = "flat";
  }

  if (!structure) structure = "flat";

  return {
    framework,
    structure,
  };
}

/**
 * Compatibility alias for older imports:
 * import { detectFramework }
 */
export function detectFramework() {
  return detectProject().framework;
}
