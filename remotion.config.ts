import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setAudioCodec('aac');
Config.setPixelFormat('yuv420p');

// The remote/CI environment ships a system Chromium (Playwright's build).
// Locally, Remotion downloads its own headless shell if this path is absent.
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
Config.setChromiumOpenGlRenderer('angle-egl');
