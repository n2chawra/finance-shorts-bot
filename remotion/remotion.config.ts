// Settings for the remotion CLI (studio, still). scripts/render.ts passes the same choices itself.
import { Config } from "@remotion/cli/config";
import { findBrowser } from "./scripts/browser";

const browser = findBrowser();
if (browser) Config.setBrowserExecutable(browser);
Config.setVideoImageFormat("jpeg");
Config.setConcurrency(4);
