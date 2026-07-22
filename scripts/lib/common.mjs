import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {promisify} from 'node:util';

export const execFileAsync = promisify(execFile);

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

export const PATHS = {
  sourceVideos: path.join(ROOT, 'source-videos'),
  data: path.join(ROOT, 'data'),
  steps: path.join(ROOT, 'data', 'steps.json'),
  sources: path.join(ROOT, 'data', 'source-videos.json'),
  categories: path.join(ROOT, 'data', 'categories.json'),
  aliases: path.join(ROOT, 'data', 'aliases.json'),
  processingLog: path.join(ROOT, 'data', 'processing-log.json'),
  revisions: path.join(ROOT, 'data', 'revisions.json'),
  captionsBundle: path.join(ROOT, 'data', 'captions-bundle.json'),
  transcripts: path.join(ROOT, 'data', 'transcripts'),
  captionsData: path.join(ROOT, 'data', 'captions'),
  segmentsDraft: path.join(ROOT, 'data', 'segments-draft'),
  public: path.join(ROOT, 'public'),
  publicSources: path.join(ROOT, 'public', 'sources'),
  publicClips: path.join(ROOT, 'public', 'clips'),
  publicThumbs: path.join(ROOT, 'public', 'thumbnails'),
  publicCaptions: path.join(ROOT, 'public', 'captions'),
  publicData: path.join(ROOT, 'public', 'data'),
  thumbFrames: path.join(ROOT, 'public', 'thumbnails', '.frames'),
  renders: path.join(ROOT, 'renders'),
  reports: path.join(ROOT, 'reports'),
  entry: path.join(ROOT, 'src', 'index.ts'),
};

export const VIDEO_EXTENSIONS = new Set([
  '.mp4',
  '.mov',
  '.mkv',
  '.avi',
  '.webm',
  '.m4v',
]);

// Remotion needs old-headless-mode Chromium. Playwright's full Chromium
// removed it, but its standalone headless shell implements exactly that.
const headlessShell = () => {
  const base = '/opt/pw-browsers';
  if (!fs.existsSync(base)) return null;
  for (const dir of fs.readdirSync(base)) {
    if (dir.startsWith('chromium_headless_shell')) {
      const candidate = path.join(base, dir, 'chrome-linux', 'headless_shell');
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
};

export const BROWSER_EXECUTABLE =
  process.env.REMOTION_BROWSER_EXECUTABLE || headlessShell();

export const readJson = (file, fallback = undefined) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    if (fallback !== undefined) return fallback;
    throw err;
  }
};

export const writeJson = (file, data) => {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
};

export const sha1 = (input) =>
  createHash('sha1').update(input).digest('hex');

export const shortHash = (input, len = 10) => sha1(input).slice(0, len);

export const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const parseTimecode = (tc) => {
  if (typeof tc === 'number') return tc;
  if (!tc) return 0;
  const parts = String(tc).split(':').map(Number);
  if (parts.some(Number.isNaN)) return 0;
  return parts.reduce((acc, p) => acc * 60 + p, 0);
};

export const formatTimecode = (totalSeconds, withMs = false) => {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(Math.floor(n)).padStart(2, '0');
  const secStr = withMs
    ? sec.toFixed(3).padStart(6, '0')
    : pad(sec);
  return `${pad(h)}:${pad(m)}:${secStr}`;
};

export const ffprobe = async (file) => {
  const {stdout} = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-print_format', 'json',
    '-show_format',
    '-show_streams',
    file,
  ], {maxBuffer: 32 * 1024 * 1024});
  return JSON.parse(stdout);
};

export const probeSummary = async (file) => {
  const info = await ffprobe(file);
  const video = info.streams.find((s) => s.codec_type === 'video');
  const audio = info.streams.find((s) => s.codec_type === 'audio');
  const fpsParts = (video?.avg_frame_rate || '0/1').split('/');
  const fps =
    Number(fpsParts[1]) > 0 ? Number(fpsParts[0]) / Number(fpsParts[1]) : 0;
  return {
    durationSeconds: Number(info.format?.duration ?? video?.duration ?? 0),
    width: video?.width ?? 0,
    height: video?.height ?? 0,
    fps: Math.round(fps * 100) / 100,
    videoCodec: video?.codec_name ?? 'unknown',
    audioCodec: audio?.codec_name ?? null,
    hasAudio: Boolean(audio),
    sizeBytes: Number(info.format?.size ?? 0),
    container: info.format?.format_name ?? '',
    creationTime:
      info.format?.tags?.creation_time ||
      video?.tags?.creation_time ||
      '',
  };
};

export const appendLog = (event, detail) => {
  const log = readJson(PATHS.processingLog, {entries: [], renders: {}});
  log.entries.push({
    at: new Date().toISOString(),
    event,
    ...detail,
  });
  writeJson(PATHS.processingLog, log);
  return log;
};

export const csvEscape = (value) => {
  const s = String(value ?? '');
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export const writeCsv = (file, header, rows) => {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  const lines = [header.join(',')];
  for (const row of rows) {
    lines.push(header.map((key) => csvEscape(row[key])).join(','));
  }
  fs.writeFileSync(file, lines.join('\n') + '\n');
};

export const listSourceFiles = () => {
  const results = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (VIDEO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        results.push(full);
      }
    }
  };
  walk(PATHS.sourceVideos);
  return results.sort();
};

/** Stable source id derived from relative path only — survives re-runs. */
export const sourceIdFor = (absPath) => {
  const rel = path.relative(PATHS.sourceVideos, absPath);
  return `src-${shortHash(rel)}`;
};

export const loadSteps = () => readJson(PATHS.steps, []);
export const saveSteps = (steps) => writeJson(PATHS.steps, steps);
export const loadSources = () => readJson(PATHS.sources, {sources: []});
export const saveSources = (data) => writeJson(PATHS.sources, data);

/** Hash of every field that affects the rendered output of a step. */
export const renderHashFor = (step, templateVersion = 'v1') => {
  const relevant = {
    templateVersion,
    title: step.title,
    category: step.category,
    level: step.level,
    timing: step.timing,
    instructor: step.instructor,
    versionLabel: step.versionLabel,
    sections: step.sections,
    keyTechniquePoints: step.keyTechniquePoints,
    practiceTips: step.practiceTips,
    burnCaptions: step.burnCaptions,
    hasMusicDemo: step.hasMusicDemo,
    sourceVideo: step.sourceVideo,
  };
  return sha1(JSON.stringify(relevant));
};

export const toFileUrl = (p) => pathToFileURL(p).href;
