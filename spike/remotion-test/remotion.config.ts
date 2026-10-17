import {Config} from '@remotion/cli/config';
// Chrome download from remotion.media is blocked in this environment; use the preinstalled Playwright Chromium.
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');
