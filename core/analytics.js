import axios from "axios";

/**
 * Vercel analytics endpoint
 */
const ANALYTICS_URL = "https://ui-errors.vercel.app/install";

/**
 * Sends install usage stats (anonymous)
 * Only tracks template usage, not identity or device data
 */
export async function trackInstall(data) {
  try {
    await axios.post(
      ANALYTICS_URL,
      {
        template: data.template,
        framework: data.framework,
        type: data.type,
        source: "cli"
      },
      {
        timeout: 2000,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (err) {
    // Never block installer if analytics fails
    return;
  }
}
