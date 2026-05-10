import axios from "axios";
import fs from "fs-extra";

const BASE =
  "https://raw.githubusercontent.com/ui-errors/error-pages-templates/main";

async function fetchRegistry(type) {
  const { data } = await axios.get(
    `${BASE}/registry/${type}.json`
  );

  return data;
}

function randomTemplate(templates) {
  return templates[
    Math.floor(Math.random() * templates.length)
  ];
}

async function downloadTemplate(path) {
  const url = `${BASE}/${path}`;

  const { data } = await axios.get(url);

  return data;
}

async function writeFile(
  framework,
  type,
  content
) {
  const targets = {
    react:
      type === "404"
        ? "src/pages/NotFound.jsx"
        : "src/pages/ServerError.jsx",

    next:
      type === "404"
        ? "app/not-found.js"
        : "app/error.js",

    vue:
      type === "404"
        ? "src/pages/404.vue"
        : "src/pages/500.vue",

    svelte: "src/routes/+error.svelte",

    express:
      type === "404"
        ? "views/404.ejs"
        : "views/500.ejs",

    vite:
      type === "404"
        ? "public/404.html"
        : "public/500.html",

    static:
      type === "404"
        ? "404.html"
        : "500.html"
  };

  const target = targets[framework];

  await fs.ensureDir(
    target.split("/").slice(0, -1).join("/")
  );

  await fs.writeFile(target, content);

  return target;
}

export async function install({
  framework,
  type,
  templateName
}) {
  const registry = await fetchRegistry(type);

  let template;

  if (templateName === "random") {
    template = randomTemplate(
      registry.templates
    );
  } else {
    template = registry.templates.find(
      (t) => t.name === templateName
    );
  }

  if (!template) {
    throw new Error(
      `Template "${templateName}" not found`
    );
  }

  const frameworkData =
    template.frameworks[framework];

  if (!frameworkData) {
    throw new Error(
      `Framework "${framework}" unsupported`
    );
  }

  const content =
    await downloadTemplate(
      frameworkData.path
    );

  const installedPath = await writeFile(
    framework,
    type,
    content
  );

  return {
    template,
    installedPath
  };
}

export async function getTemplates(type) {
  const registry = await fetchRegistry(type);

  return registry.templates;
}
