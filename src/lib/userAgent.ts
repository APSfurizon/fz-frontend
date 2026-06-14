import { UAParser } from "ua-parser-js";

const customBrowsers = [
  [/(FurizonApp)\/([\w\.]+)/i],
  [UAParser.BROWSER.NAME, UAParser.BROWSER.VERSION, [UAParser.BROWSER.TYPE, "app"]],
];

export const UA = UAParser(navigator.userAgent, { browser: customBrowsers });

export function isMobile() {
  return UA.device.type == "mobile";
}

export function uaFriendly(ua?: string) {
  const uaResult = ua ? UAParser(ua, { browser: customBrowsers }) : UA;
  return `${uaResult.browser.name} ${uaResult.browser.version} - ${uaResult.os.name} ${uaResult.os.version}`;
}
