import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// The film treatment leans on CSS filters and blend modes, which need
// a real compositor — keep the default Chrome headless shell.
Config.setChromiumOpenGlRenderer("angle");
