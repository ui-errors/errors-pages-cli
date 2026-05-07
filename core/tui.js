const readline = require("readline")
const chalk = require("chalk")

function createUI({ framework }, callback) {
  const state = {
    pages: { "404": false, "500": false },
    mode: "manual",
    index: 0
  }

  const pages = ["404", "500"]

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  function render() {
    console.clear()

    console.log(chalk.cyan("UI-ERRORS INSTALLER\n"))
    console.log("Framework:", framework)

    console.log("\nSelect pages:\n")

    pages.forEach((p, i) => {
      const mark = state.pages[p] ? "[x]" : "[ ]"
      const pointer = i === state.index ? ">" : " "

      console.log(pointer, mark, p)
    })

    console.log("\nMode:")
    console.log(state.mode === "manual" ? "> manual" : "  manual")
    console.log(state.mode === "random" ? "> random" : "  random")

    console.log("\nControls:")
    console.log("↑ ↓ move | SPACE toggle | m manual | r random | ENTER install")
  }

  function toggle() {
    const p = pages[state.index]
    state.pages[p] = !state.pages[p]
  }

  function submit() {
    rl.close()
    process.stdin.setRawMode(false)

    const selectedPages = pages.filter(p => state.pages[p])

    callback({
      pages: selectedPages,
      mode: state.mode
    })
  }

  process.stdin.setRawMode(true)
  process.stdin.resume()

  process.stdin.on("data", (key) => {
    const k = key.toString()

    if (k === "\u0003") process.exit()

    if (k === "\r") return submit()

    if (k === "\u001b[A") state.index = Math.max(0, state.index - 1)
    if (k === "\u001b[B") state.index = Math.min(1, state.index + 1)

    if (k === " ") toggle()

    if (k === "m") state.mode = "manual"
    if (k === "r") state.mode = "random"

    render()
  })

  render()
}

module.exports = { createUI }
