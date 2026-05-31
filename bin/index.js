#!/usr/bin/env node

import React from "react";
import { render } from "ink";
import path from "path";
import fs from "fs-extra";
import process from "process";
import App from "../core/tui.js";
//import InitApp from "../core/init.js";

const command = process.argv[2];

if (command === "init") {
  render(React.createElement(InitApp));
} else {
  render(React.createElement(App));
}
