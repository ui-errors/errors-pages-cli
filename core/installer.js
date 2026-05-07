const axios = require("axios")
const fs = require("fs-extra")
const path = require("path")

const REPO =
  "https://api.github.com/repos/ui-errors/error-pages-templates/contents"

const RAW =
  "https://raw.githubusercontent.com/ui-errors/error-pages-templates/main"

async function getTemplates() {
  const res = await axios.get(REPO)
  return res.data.filter(t => t.type === "dir").map(t => t.name)
}

function getTargetPath(framework, page) {
  const map = {
    next: `error-pages/${page}.js`,
    react: `error-pages/${page}.jsx`,
    express: `error-pages/${page}.html`,
    vite: `error-pages/${page}.jsx`,
    static: `error-pages/${page}.html`
  }

  return map[framework] || map.static
}

async function install(root, framework, page, template) {
  const url = `${RAW}/${template}/${page}.html`

  const res = await axios.get(url)

  const target = path.join(root, getTargetPath(framework, page))

  await fs.ensureDir(path.dirname(target))
  await fs.writeFile(target, res.data)

  console.log(`✔ ${page} → ${template}`)
}

module.exports = { getTemplates, install }
