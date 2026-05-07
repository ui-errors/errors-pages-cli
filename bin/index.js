#!/usr/bin/env node

const chalk = require("chalk")
const { createUI } = require("../core/tui")
const { detectFramework } = require("../core/detect")
const { getTemplates, install } = require("../core/installer")

async function start() {
  const cwd = process.cwd()
  const framework = detectFramework(cwd)
  const templates = await getTemplates()

  console.log(chalk.cyan("\nUI-ERRORS CLI"))
  console.log(chalk.gray("Detected framework:", framework, "\n"))

  createUI({ framework }, async ({ pages, mode }) => {
    if (pages.length === 0) {
      console.log(chalk.red("No pages selected"))
      return
    }

    for (const page of pages) {
      const template =
        mode === "random"
          ? templates[Math.floor(Math.random() * templates.length)]
          : await askTemplateManually(templates, page)

      await install(cwd, framework, page, template)
    }

    console.log(chalk.green("\n✔ Installation complete\n"))
  })
}

async function askTemplateManually(templates, page) {
  // fallback simple auto-pick (keeps CLI light)
  return templates[0]
}

start()
