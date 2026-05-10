import axios from "axios";
import fs from "fs-extra";
import path from "path";

const BASE =
  "https://raw.githubusercontent.com/ui-errors/error-pages-templates/main";

/**
 * Fetches the registry JSON for a given type (404 or 500)
 */
async function fetchRegistry(type) {
  const { data } = await axios.get(`${BASE}/registry/${type}.json`);
  return data;
}

/**
 * Returns a random template from a list
 */
function randomTemplate(templates) {
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Downloads a template file content
 */
async function downloadTemplate(filePath) {
  const url = `${BASE}/${filePath}`;
  const { data } = await axios.get(url);
  return data;
}

/**
 * Writes the template content to the proper file path
 * Handles cross-platform paths (Windows/Linux/macOS)
 */
async function writeFile(framework, type, content) {
  const targets = {
    react: type === "404" ? "src/pages/NotFound.jsx" : "src/pages/ServerError.jsx",
    next: type === "404" ? "app/not-found.js" : "app/error.js",
    vue: type === "404" ? "src/pages/404.vue" : "src/pages/500.vue",
    svelte: "src/routes/+error.svelte",
    express: type === "404" ? "views/404.ejs" : "views/500.ejs",
    vite: type === "404" ? "public/404.html" : "public/500.html",
    static: type === "404" ? "404.html" : "500.html",
  };

  const target = targets[framework];

  if (!target) {
    throw new Error(`Invalid framework or type: ${framework}, ${type}`);
  }

  // Use Node.js path utilities
  const dir = path.dirname(target);

  if (dir && dir !== ".") {
    await fs.ensureDir(dir); // safely create directories
  }

  await fs.writeFile(target, content);

  return target;
}

/**
 * Installs a template for a specific framework and type (404/500)
 */
export async function install({ framework, type, templateName }) {
  const registry = await fetchRegistry(type);

  let template;
  if (templateName === "random") {
    template = randomTemplate(registry.templates);
  } else {
    template = registry.templates.find((t) => t.name === templateName);
  }

  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }

  const frameworkData = template.frameworks[framework];
  if (!frameworkData) {
    throw new Error(`Framework "${framework}" unsupported`);
  }

  const content = await downloadTemplate(frameworkData.path);
  const installedPath = await writeFile(framework, type, content);

  return {
    template,
    installedPath,
  };
}

/**
 * Returns all available templates for a type (404/500)
 */
export async function getTemplates(type) {
  const registry = await fetchRegistry(type);
  return registry.templates;
}
