import React, { useState, useEffect } from "react";
import { Box, Text, useInput, Spacer } from "ink";
import Spinner from "ink-spinner";
import chalk from "chalk";

import { detectProject } from "./detect.js";
import { install, getTemplates } from "./installer.js";

export default function App() {
  //  upgraded API (framework + structure available)
  const project = detectProject();
  const framework = project?.framework || "static";

  const [screen, setScreen] = useState(0);
  const [selected, setSelected] = useState(0);
  const [type, setType] = useState("404");
  const [templates, setTemplates] = useState([]);
  const [template, setTemplate] = useState(null);
  const [installedPath, setInstalledPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // -------------------------
  // PROGRESS ANIMATION
  // -------------------------
  useEffect(() => {
    let timer;

    if (loading && progress < 100) {
      timer = setTimeout(() => {
        setProgress((p) => Math.min(p + 5, 100));
      }, 80);
    }

    return () => clearTimeout(timer);
  }, [loading, progress]);

  // -------------------------
  // INPUT HANDLING
  // -------------------------
  useInput(async (_, key) => {
    if (loading) return;

    if (key.upArrow) {
      setSelected((p) => (p > 0 ? p - 1 : p));
    }

    if (key.downArrow) {
      const max = screen === 0 ? 2 : templates.length - 1;
      setSelected((p) => (p < max ? p + 1 : p));
    }

    if (key.return) {
      // -------------------------
      // SCREEN 0: TYPE SELECTION
      // -------------------------
      if (screen === 0) {
        const options = ["404", "500", "random"];

        const chosenType =
          options[selected] === "random"
            ? Math.random() > 0.5
              ? "404"
              : "500"
            : options[selected];

        setType(chosenType);
        setLoading(true);
        setProgress(0);

        const list = await getTemplates(chosenType);

        setTemplates([...list, { name: "random" }]);

        setLoading(false);
        setSelected(0);
        setScreen(1);
      }

      // -------------------------
      // SCREEN 1: TEMPLATE SELECTION
      // -------------------------
      else if (screen === 1) {
        const chosen = templates[selected];

        if (!chosen) return;

        setLoading(true);
        setProgress(0);

        const result = await install({
          framework,
          type,
          templateName: chosen.name,
        });

        setTemplate(result?.template?.name || "unknown");
        setInstalledPath(result?.installedPath || "unknown");

        setLoading(false);
        setScreen(2);
      }
    }
  });

  // -------------------------
  // CENTERED ASCII LOGO UI (With Prakrit Concept)
  // -------------------------
  const renderLogo = () => {
    const frame = chalk.cyan;
    const glitch = chalk.magenta.bold;
    const label = chalk.yellow.bold;

    return React.createElement(
      Box,
      { flexDirection: "column", alignItems: "center", marginBottom: 2, marginTop: 1 },
      React.createElement(Text, null, frame("       ____________________")),
      React.createElement(Text, null, frame("      |   ______  ______   |")),
      React.createElement(Text, null, frame("      |  |      ||      |  |")),
      React.createElement(Text, null, frame("      |  |  __  ||  __  |  |")),
      React.createElement(Text, null, frame("      |  | |  | || |  | |  |")),
      React.createElement(Text, null, glitch("======|==|_|==|_||_|==|_|==|======")),
      React.createElement(Text, null, frame("      |   ____   ||____/   |")),
      React.createElement(Text, null, frame("      |  |    \\  ||        |")),
      React.createElement(Text, null, frame("      |  |     | ||  ____  |")),
      React.createElement(Text, null, frame("      |  |____/  || |    | |")),
      React.createElement(Text, null, frame("      |__________||_|____|_|")),
      React.createElement(Box, { marginTop: 1 }, 
        React.createElement(Text, null, label("u i  -  e r r o r s"))
      )
    );
  };

  // -------------------------
  // HEADER UI
  // -------------------------
  const createHeader = () =>
    React.createElement(
      Box,
      {
        borderStyle: "round",
        borderColor: "cyan",
        paddingX: 1,
        marginBottom: 1,
      },
      React.createElement(Text, { bold: true, color: "black", backgroundColor: "cyan" }, " SYSTEM "),
      React.createElement(Text, { color: "white", bold: true }, " :: UI-OS"),
      React.createElement(Spacer),
      React.createElement(
        Text,
        { color: "magenta", bold: true },
        `ENV // ${framework.toUpperCase()}`
      )
    );

  // -------------------------
  // PROGRESS BAR UI
  // -------------------------
  const createProgressBar = (pct) => {
    const width = 24;
    const filled = Math.floor((pct / 100) * width);

    return React.createElement(
      Box,
      { flexDirection: "column", marginTop: 1 },
      React.createElement(
        Box,
        null,
        React.createElement(Text, { color: "magenta" }, "█".repeat(filled)),
        React.createElement(Text, { color: "gray" }, "░".repeat(width - filled)),
        React.createElement(Text, { color: "cyan", bold: true }, ` ${pct}%`)
      )
    );
  };

  // -------------------------
  // LOADING SCREEN
  // -------------------------
  if (loading) {
    return React.createElement(
      Box,
      { flexDirection: "column", padding: 1 },
      createHeader(),
      React.createElement(
        Box,
        {
          flexDirection: "column",
          alignItems: "center",
          borderStyle: "double",
          borderColor: "yellow",
          padding: 1,
          width: 54,
        },
        React.createElement(
          Text,
          { color: "yellow", bold: true },
          React.createElement(Spinner, { type: "earth" }),
          " TRANSMUTING ARCHITECTURAL FRAGMENTS..."
        ),
        createProgressBar(progress)
      )
    );
  }

  // -------------------------
  // SUCCESS SCREEN
  // -------------------------
  if (screen === 2) {
    return React.createElement(
      Box,
      { flexDirection: "column", padding: 1 },
      createHeader(),
      React.createElement(
        Box,
        {
          borderStyle: "round",
          borderColor: "green",
          paddingX: 2,
          paddingY: 1,
          flexDirection: "column",
          width: 54,
        },
        React.createElement(
          Text,
          { color: "black", backgroundColor: "green", bold: true },
          " FRACTURE ALIGNED SUCCESSFULLY "
        ),
        React.createElement(
          Box,
          { marginTop: 1, flexDirection: "column" },
          React.createElement(Text, null, `${chalk.cyan("MANIFEST:")}   ${type}`),
          React.createElement(Text, null, `${chalk.cyan("ELEMENT:")}    ${template}`),
          React.createElement(Text, null, `${chalk.cyan("ANCHOR:")}     ${installedPath}`)
        )
      )
    );
  }

  // -------------------------
  // MAIN SCREEN
  // -------------------------
  const currentOptions =
    screen === 0 ? ["404", "500", "Random"] : templates;

  return React.createElement(
    Box,
    { flexDirection: "column", padding: 1 },

    createHeader(),
    
    renderLogo(),

    React.createElement(
      Box,
      { marginBottom: 1 },

      // Sidebar
      React.createElement(
        Box,
        {
          flexDirection: "column",
          width: 16,
          borderStyle: "single",
          borderColor: "magenta",
          paddingX: 1,
        },
        React.createElement(Text, { bold: true, color: "magenta" }, "PATHWAY"),
        React.createElement(
          Text,
          { color: screen === 0 ? "yellow" : "gray", bold: screen === 0 },
          screen === 0 ? "● TYPE" : "  TYPE"
        ),
        React.createElement(
          Text,
          { color: screen === 1 ? "yellow" : "gray", bold: screen === 1 },
          screen === 1 ? "● DESIGN" : "  DESIGN"
        )
      ),

      // Content
      React.createElement(
        Box,
        { flexDirection: "column", paddingX: 3 },
        React.createElement(
          Text,
          { color: "cyan", bold: true },
          screen === 0 ? "» IDENTIFY CRITERIA" : "» SELECT GEOMETRY"
        ),

        React.createElement(
          Box,
          { flexDirection: "column", marginTop: 1 },
          currentOptions.map((item, index) => {
            const label = typeof item === "string" ? item : item.name;
            const isSelected = selected === index;

            return React.createElement(
              Text,
              {
                key: label,
                color: isSelected ? "black" : "white",
                backgroundColor: isSelected ? "yellow" : undefined,
                bold: isSelected,
              },
              isSelected ? ` ▶ ${label.toUpperCase()} ` : `   ${label.toUpperCase()} `
            );
          })
        )
      )
    ),

    // Footer & Philosophical Assertion Bar
    React.createElement(
      Box,
      { flexDirection: "column", marginTop: 1 },
      React.createElement(
        Box,
        { borderStyle: "classic", borderColor: "gray", paddingX: 1, marginBottom: 1 },
        React.createElement(
          Text,
          { color: "gray", italic: true },
          "Ūi: The primal exclamation upon discovering a structural divergence."
        )
      ),
      React.createElement(
        Text,
        { color: "cyan" },
        "▲ NAV: ARROW KEYS • CONFIRM: ENTER"
      )
    )
  );
}
