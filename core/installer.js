import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { detectProject } from "./detect.js";

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
  const { data } = await axios.get(`${BASE}/${filePath}`);
  return data;
}

/**
 * Resolves correct file path based on framework + project structure
 */
function resolveTarget(framework, structure, type) {
  if (framework === "next") {
    if (structure === "src-app") {
      return type === "404"
        ? "src/app/not-found.js"
        : "src/app/error.js";
    }

    if (structure === "app") {
      return type === "404"
        ? "app/not-found.js"
        : "app/error.js";
    }

    if (structure === "src-pages") {
      return type === "404"
        ? "src/pages/404.js"
        : "src/pages/500.js";
    }

    if (structure === "pages") {
      return type === "404"
        ? "pages/404.js"
        : "pages/500.js";
    }
  }

  if (framework === "react") {
    return type === "404"
      ? "src/pages/NotFound.jsx"
      : "src/pages/ServerError.jsx";
  }

  if (framework === "vue") {
    return type === "404"
      ? "src/pages/404.vue"
      : "src/pages/500.vue";
  }

  if (framework === "svelte") {
    return "src/routes/+error.svelte";
  }

  if (framework === "express") {
    return type === "404"
      ? "views/404.ejs"
      : "views/500.ejs";
  }

  if (framework === "vite") {
    return type === "404"
      ? "public/404.html"
      : "public/500.html";
  }

  return type === "404" ? "404.html" : "500.html";
}

/**
 * Writes file safely
 */
async function writeFile(target, content) {
  const dir = path.dirname(target);

  if (dir && dir !== ".") {
    await fs.ensureDir(dir);
  }

  await fs.writeFile(target, content);

  return target;
}

/**
 * Installs a template for a specific framework and type (404/500)
 */
export async function install({ framework, type, templateName }) {
  const { structure } = detectProject();

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

  const target = resolveTarget(framework, structure, type);

  const installedPath = await writeFile(target, content);

  return {
    template,
    installedPath,
    framework,
    structure,
  };
}

/**
 * Returns all available templates for a type (404/500)
 */
export async function getTemplates(type) {
  const registry = await fetchRegistry(type);
  return registry.templates;
}
