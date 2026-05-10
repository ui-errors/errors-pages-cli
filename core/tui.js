import React, { useState, useEffect } from "react";
import { Box, Text, useInput, Spacer } from "ink";
import Spinner from "ink-spinner";
import chalk from "chalk";

import { detectFramework } from "./detect.js";
import { install, getTemplates } from "./installer.js";

export default function App() {
  const framework = detectFramework();

  const [screen, setScreen] = useState(0);
  const [selected, setSelected] = useState(0);
  const [type, setType] = useState("404");
  const [templates, setTemplates] = useState([]);
  const [template, setTemplate] = useState(null);
  const [installedPath, setInstalledPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Animation logic for the progress bar
  useEffect(() => {
    let timer;
    if (loading && progress < 100) {
      timer = setTimeout(() => setProgress((p) => Math.min(p + 5, 100)), 80);
    }
    return () => clearTimeout(timer);
  }, [loading, progress]);

  useInput(async (_, key) => {
    if (loading) return;
    if (key.upArrow) setSelected((p) => (p > 0 ? p - 1 : p));
    if (key.downArrow) {
      const max = screen === 0 ? 2 : templates.length - 1;
      setSelected((p) => (p < max ? p + 1 : p));
    }

    if (key.return) {
      if (screen === 0) {
        const options = ["404", "500", "random"];
        const chosenType = options[selected] === "random" ? (Math.random() > 0.5 ? "404" : "500") : options[selected];
        setType(chosenType);
        setLoading(true);
        setProgress(0);
        const list = await getTemplates(chosenType);
        setTemplates([...list, { name: "random" }]);
        setLoading(false);
        setSelected(0);
        setScreen(1);
      } else if (screen === 1) {
        const chosen = templates[selected];
        setLoading(true);
        setProgress(0);
        const result = await install({ framework, type, templateName: chosen.name });
        setTemplate(result.template.name);
        setInstalledPath(result.installedPath);
        setLoading(false);
        setScreen(2);
      }
    }
  });

  // --- VANILLA UI COMPONENTS (No JSX) ---

  const createHeader = () => React.createElement(
    Box, 
    { borderStyle: "single", borderColor: "white", paddingX: 1, marginBottom: 1 },
    React.createElement(Text, { bold: true, color: "blue" }, " SYSTEM "),
    React.createElement(Text, { color: "white" }, " :: UI-ERRORS"),
    React.createElement(Spacer),
    React.createElement(Text, { color: "gray" }, `ENV: ${framework.toUpperCase()}`)
  );

  const createProgressBar = (pct) => {
    const width = 20;
    const filled = Math.floor((pct / 100) * width);
    return React.createElement(Box, { flexDirection: "column", marginTop: 1 },
      React.createElement(Box, null,
        React.createElement(Text, { color: "blue" }, "█".repeat(filled)),
        React.createElement(Text, { color: "gray" }, "░".repeat(width - filled)),
        React.createElement(Text, null, ` ${pct}%`)
      )
    );
  };

  // --- RENDER LOGIC ---

  // LOADING SCREEN
  if (loading) {
    return React.createElement(Box, { flexDirection: "column", padding: 1 },
      createHeader(),
      React.createElement(Box, { 
        flexDirection: "column", 
        alignItems: "center", 
        borderStyle: "round", 
        padding: 1,
        width: 50 
      },
        React.createElement(Text, null, React.createElement(Spinner, { type: "dots" }), " DEPLOYING ASSETS..."),
        createProgressBar(progress)
      )
    );
  }

  // DONE SCREEN
  if (screen === 2) {
    return React.createElement(Box, { flexDirection: "column", padding: 1 },
      createHeader(),
      React.createElement(Box, { borderStyle: "double", borderColor: "green", paddingX: 2, flexDirection: "column" },
        React.createElement(Text, { color: "green", bold: true }, "COMPLETED SUCCESSFULLY"),
        React.createElement(Box, { marginTop: 1, flexDirection: "column" },
          React.createElement(Text, null, `TYPE:     ${type}`),
          React.createElement(Text, null, `TEMPLATE: ${template}`),
          React.createElement(Text, null, `PATH:     ${installedPath}`)
        )
      )
    );
  }

  // MAIN MENU
  const currentOptions = screen === 0 ? ["404", "500", "Random"] : templates;

  return React.createElement(Box, { flexDirection: "column", padding: 1 },
    createHeader(),
    React.createElement(Box, null,
      // Sidebar
      React.createElement(Box, { flexDirection: "column", width: 15, borderStyle: "single", borderColor: "gray", paddingX: 1 },
        React.createElement(Text, { bold: true, color: "gray" }, "STEPS"),
        React.createElement(Text, { color: screen === 0 ? "white" : "gray" }, screen === 0 ? "> TYPE" : "  TYPE"),
        React.createElement(Text, { color: screen === 1 ? "white" : "gray" }, screen === 1 ? "> DESIGN" : "  DESIGN")
      ),
      // Content
      React.createElement(Box, { flexDirection: "column", paddingX: 2 },
        React.createElement(Text, { bold: true, underline: true }, screen === 0 ? "SELECT CATEGORY" : "SELECT TEMPLATE"),
        React.createElement(Box, { flexDirection: "column", marginTop: 1 },
          currentOptions.map((item, index) => {
            const label = typeof item === "string" ? item : item.name;
            const isSelected = selected === index;
            return React.createElement(Text, { 
              key: label, 
              color: isSelected ? "white" : "gray",
              backgroundColor: isSelected ? "blue" : undefined
            }, isSelected ? ` ${label.toUpperCase()} ` : `  ${label.toUpperCase()} `);
          })
        )
      )
    ),
    React.createElement(Box, { marginTop: 1 },
      React.createElement(Text, { color: "gray" }, "USE ARROWS TO NAVIGATE • ENTER TO CONFIRM")
    )
  );
}
