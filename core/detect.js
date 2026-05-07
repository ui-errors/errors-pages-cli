const fs = require("fs")
const path = require("path")

function detectFramework(dir) {
  const pkgPath = path.join(dir, "package.json")

  if (!fs.existsSync(pkgPath)) return "static"

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"))
  const deps = { ...pkg.dependencies, ...pkg.devDependencies }

  if (deps.next) return "next"
  if (deps.react) return "react"
  if (deps.express) return "express"
  if (deps.vite) return "vite"

  return "static"
}

module.exports = { detectFramework }
