import { UAParser } from "ua-parser-js";

export function parseUserAgent(userAgent: string) {
  const parser = new UAParser();
  parser.setUA(userAgent);

  const result = parser.getResult();

  return {
    browser: result.browser.name || "Unknown",
    os: result.os.name || "Unknown",
    device: result.device.type || "Desktop",
  };
}
