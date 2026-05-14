import React, { useState } from "react";
import { Box, Text, useApp } from "ink";
import TextInput from "ink-text-input";
import SelectInput from "ink-select-input";
import fs from "fs-extra";
import path from "path";

export default function InitApp() {
  const { exit } = useApp();

  const folderName = path.basename(process.cwd());

  const [step, setStep] = useState(0);

  const [displayName, setDisplayName] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [registerAs, setRegisterAs] = useState(null);

  const saveConfig = async (type) => {
    const config = {
      name: folderName,
      displayName,
      author,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),

      registerAs: {
        [type]: true
      }
    };

    const filePath = path.join(process.cwd(), "template.json");

    await fs.writeJson(filePath, config, {
      spaces: 2
    });

    console.log("\nInitialized successfully");
    console.log(`Created: ${filePath}`);

    exit();
  };

  if (step === 0) {
    return (
      <Box flexDirection="column">
        <Text>Enter display name:</Text>

        <TextInput
          value={displayName}
          onChange={setDisplayName}
          onSubmit={() => setStep(1)}
        />
      </Box>
    );
  }

  if (step === 1) {
    return (
      <Box flexDirection="column">
        <Text>Enter author:</Text>

        <TextInput
          value={author}
          onChange={setAuthor}
          onSubmit={() => setStep(2)}
        />
      </Box>
    );
  }

  if (step === 2) {
    return (
      <Box flexDirection="column">
        <Text>Enter tags (comma separated):</Text>

        <TextInput
          value={tags}
          onChange={setTags}
          onSubmit={() => setStep(3)}
        />
      </Box>
    );
  }

  if (step === 3) {
    return (
      <Box flexDirection="column">
        <Text>Select register type:</Text>

        <SelectInput
          items={[
            { label: "404 Page", value: "404" },
            { label: "500 Page", value: "500" }
          ]}
          onSelect={(item) => saveConfig(item.value)}
        />
      </Box>
    );
  }

  return null;
}
