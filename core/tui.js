import React, {
  useState
} from "react";

import {
  Box,
  Text,
  useInput
} from "ink";

import chalk from "chalk";

import { detectFramework } from "./detect.js";

import {
  install,
  getTemplates
} from "./installer.js";

const screens = [
  "type",
  "template",
  "done"
];

export default function App() {
  const framework =
    detectFramework();

  const [screen, setScreen] =
    useState(0);

  const [selected, setSelected] =
    useState(0);

  const [type, setType] =
    useState("404");

  const [templates, setTemplates] =
    useState([]);

  const [template, setTemplate] =
    useState(null);

  const [installedPath, setInstalledPath] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useInput(async (_, key) => {
    if (loading) return;

    if (key.upArrow) {
      setSelected((p) =>
        p > 0 ? p - 1 : p
      );
    }

    if (key.downArrow) {
      const max =
        screen === 0
          ? 2
          : templates.length - 1;

      setSelected((p) =>
        p < max ? p + 1 : p
      );
    }

    if (key.return) {
      if (screen === 0) {
        const options = [
          "404",
          "500",
          "random"
        ];

        const picked =
          options[selected];

        let chosenType = picked;

        if (picked === "random") {
          chosenType =
            Math.random() > 0.5
              ? "404"
              : "500";
        }

        setType(chosenType);

        setLoading(true);

        const list =
          await getTemplates(
            chosenType
          );

        setTemplates([
          ...list,
          { name: "random" }
        ]);

        setLoading(false);

        setSelected(0);

        setScreen(1);
      }

      else if (screen === 1) {
        const chosen =
          templates[selected];

        setLoading(true);

        const result =
          await install({
            framework,
            type,
            templateName:
              chosen.name
          });

        setTemplate(
          result.template.name
        );

        setInstalledPath(
          result.installedPath
        );

        setLoading(false);

        setScreen(2);
      }
    }
  });

  if (loading) {
    return (
      <Text color="yellow">
        Installing...
      </Text>
    );
  }

  if (screens[screen] === "done") {
    return (
      <Box flexDirection="column">
        <Text color="green">
          ✔ Installed Successfully
        </Text>

        <Text>
          Framework:{" "}
          {chalk.cyan(framework)}
        </Text>

        <Text>
          Type: {chalk.yellow(type)}
        </Text>

        <Text>
          Template:{" "}
          {chalk.magenta(template)}
        </Text>

        <Text>
          Path:{" "}
          {chalk.green(installedPath)}
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">
        UI Errors
      </Text>

      <Text color="gray">
        Detected: {framework}
      </Text>

      <Box marginTop={1} flexDirection="column">
        {screen === 0 &&
          ["404", "500", "Random"].map(
            (item, index) => (
              <Text
                key={item}
                color={
                  selected === index
                    ? "green"
                    : "white"
                }
              >
                {selected === index
                  ? "❯ "
                  : "  "}
                {item}
              </Text>
            )
          )}

        {screen === 1 &&
          templates.map(
            (item, index) => (
              <Text
                key={item.name}
                color={
                  selected === index
                    ? "green"
                    : "white"
                }
              >
                {selected === index
                  ? "❯ "
                  : "  "}
                {item.name}
              </Text>
            )
          )}
      </Box>

      <Box marginTop={1}>
        <Text color="gray">
          ↑ ↓ navigate • enter select
        </Text>
      </Box>
    </Box>
  );
}
