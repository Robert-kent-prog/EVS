const fs = require("fs");
const path = require("path");

const appJsonPath = path.join(__dirname, "app.json");
const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
const config = JSON.parse(JSON.stringify(appJson.expo));

const isDev = process.env.NODE_ENV !== "production";

if (isDev) {
  // Avoid Expo account/certificate prompts during `expo start` in local dev.
  delete config.runtimeVersion;
  delete config.updates;
  if (config.extra?.eas) {
    delete config.extra.eas;
  }
}

module.exports = { expo: config };
