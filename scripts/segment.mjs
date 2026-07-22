// PHASE 2b/3 — Segmentation assistance.
// Combines audio silence detection, scene-change detection and transcript
// keyword spotting to propose clip boundaries and step candidates for each
// source video. Results go to data/segments-draft/<sourceId>.json and
// reports/segment-drafts/<sourceId>.md for curation.
//
// With --auto-steps, low-confidence step skeletons (neutral working titles,
// reviewRequired=true) are appended to data/steps.json for any segment not
// already covered by an existing step. Nothing confident is ever invented:
// auto-created records always land in the review queue.

import fs from 'node:fs';
import path from 'node:path';
import {
  PATHS,
  appendLog,
  execFileAsync,
  formatTimecode,
  loadSources,
  loadSteps,
  parseTimecode,
  readJson,
  saveSteps,
  shortHash,
  slugify,
  writeJson,
} from './lib/common.mjs';

const args = process.argv.slice(2);
const force = args.includes('--force');
const autoSteps = args.includes('--auto-steps');

// Phrases that usually signal a teaching moment / boundary.
const STEP_NAME_PATTERNS = [
  /this (?:step|move|shine|combination|figure) is called ([^.,!?]+)/i,
  /(?:it'?s|it is) called ([^.,!?]+)/i,
  /we call (?:this|it) ([^.,!?]+)/i,
  /(?:the|el|la) ([\w\s-]+?) step\b/i,
];
const BOUNDARY_HINTS = [
  {re: /\b(?:five|cinco)?[,\s]*(?:six|seis)[,\s]*(?:seven|siete)[,\s]*(?:eight|ocho)\b/i, label: 'count-in (5-6-7-8)'},
  {re: /\bwith (?:the )?music\b/i, label: 'music demo cue'},
  {re: /\bslow(?:ly| motion| version)?\b/i, label: 'slow demo cue'},
  {re: /\bnext (?:step|move|one|combination)\b/i, label: 'topic change'},
  {re: /\blet'?s (?:try|do|start|move on)\b/i, label: 'topic change'},
  {re: /\bcommon mistake|don'?t do|be careful\b/i, label: 'mistake correction'},
  {re: /\bone more time|again from the top|from the beginning\b/i, label: 'repeat demo'},
];

const detectSilences = async (input) => {
  const {stderr} = await execFileAsync('ffmpeg', [
    '-hide_banner', '-nostats',
    '-i', input,
    '-map', 'a:0?',
    '-af', 'silencedetect=noise=-35dB:d=1.5',
    '-f', 'null', '-',
  ], {maxBuffer: 64 * 1024 * 1024, timeout: 0});
  const silences = [];
  const re = /silence_start:\s*([\d.]+)[\s\S]*?silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/g;
  let m;
  while ((m = re.exec(stderr))) {
    silences.push({
      start: Number(m[1]),
      end: Number(m[2]),
      duration: Number(m[3]),
    });
  }
  return silences;
};

const detectScenes = async (input) => {
  try {
    const {stderr} = await execFileAsync('ffmpeg', [
      '-hide_banner', '-nostats',
      '-i', input,
      '-vf', "select='gt(scene,0.35)',metadata=print",
      '-an', '-f', 'null', '-',
    ], {maxBuffer: 64 * 1024 * 1024, timeout: 0});
    const scenes = [];
    const re = /pts_time:([\d.]+)/g;
    let m;
    while ((m = re.exec(stderr))) {
      scenes.push(Number(m[1]));
    }
    return scenes;
  } catch {
    return [];
  }
};

const main = async () => {
  const data = loadSources();
  const sources = data.sources.filter((s) => !s.missing);
  fs.mkdirSync(PATHS.segmentsDraft, {recursive: true});
  const reportDir = path.join(PATHS.reports, 'segment-drafts');
  fs.mkdirSync(reportDir, {recursive: true});

  for (const source of sources) {
    const out = path.join(PATHS.segmentsDraft, `${source.id}.json`);
    const prev = readJson(out, {});
    if (!force && prev.sourceMtime === source.mtime) {
      continue;
    }
    const input = path.join(PATHS.sourceVideos, source.path);
    console.log(`Segmenting ${source.filename} …`);

    const silences = source.hasAudio ? await detectSilences(input) : [];
    const scenes = await detectScenes(input);
    const transcript = readJson(
      path.join(PATHS.transcripts, `${source.id}.json`),
      null,
    );

    const hints = [];
    if (transcript) {
      for (const seg of transcript.segments) {
        for (const pattern of STEP_NAME_PATTERNS) {
          const m = seg.text.match(pattern);
          if (m) {
            hints.push({
              time: seg.start,
              kind: 'possible-step-name',
              label: m[1].trim(),
              text: seg.text,
            });
          }
        }
        for (const {re, label} of BOUNDARY_HINTS) {
          if (re.test(seg.text)) {
            hints.push({time: seg.start, kind: label, text: seg.text});
          }
        }
      }
    }

    // Candidate boundaries: long silences and hard scene changes, merged
    // when closer than 3 s.
    const rawBoundaries = [
      0,
      ...silences.map((s) => (s.start + s.end) / 2),
      ...scenes,
      source.durationSeconds,
    ].sort((a, b) => a - b);
    const boundaries = rawBoundaries.filter(
      (t, i) => i === 0 || t - rawBoundaries[i - 1] > 3,
    );
    const segments = [];
    for (let i = 0; i < boundaries.length - 1; i += 1) {
      const start = boundaries[i];
      const end = boundaries[i + 1];
      if (end - start < 8) continue; // too short to be a learning unit
      segments.push({
        start,
        end,
        startTc: formatTimecode(start),
        endTc: formatTimecode(end),
        hints: hints.filter((h) => h.time >= start && h.time < end),
      });
    }

    const draft = {
      sourceId: source.id,
      sourceMtime: source.mtime,
      generatedAt: new Date().toISOString(),
      hasTranscript: Boolean(transcript),
      silences,
      sceneChanges: scenes,
      hints,
      segments,
    };
    writeJson(out, draft);

    const md = [
      `# Segment draft — ${source.filename}`,
      '',
      `Transcript available: ${transcript ? 'yes' : 'NO — install whisper for far better segmentation'}`,
      `Detected silences ≥1.5 s: ${silences.length} · Scene changes: ${scenes.length}`,
      '',
      '| # | Start | End | Length | Hints |',
      '| - | ----- | --- | ------ | ----- |',
      ...segments.map((s, i) => {
        const hintText = s.hints
          .map((h) =>
            h.kind === 'possible-step-name'
              ? `**name? "${h.label}"**`
              : h.kind,
          )
          .join('; ');
        return `| ${i + 1} | ${s.startTc} | ${s.endTc} | ${Math.round(s.end - s.start)}s | ${hintText || '—'} |`;
      }),
      '',
      'These are *draft* boundaries. Curate them into `data/steps.json`',
      '(or run `npm run segment -- --auto-steps` to create flagged skeletons).',
      '',
    ].join('\n');
    fs.writeFileSync(path.join(reportDir, `${source.id}.md`), md);
    appendLog('segment', {sourceId: source.id, segments: segments.length});
  }

  if (autoSteps) {
    const steps = loadSteps();
    let created = 0;
    for (const source of sources) {
      const draft = readJson(
        path.join(PATHS.segmentsDraft, `${source.id}.json`),
        null,
      );
      if (!draft) continue;
      for (const seg of draft.segments) {
        const covered = steps.some(
          (st) =>
            st.sourceVideo === source.id &&
            parseTimecode(st.sourceStartTime) < seg.end &&
            parseTimecode(st.sourceEndTime) > seg.start,
        );
        if (covered) continue;
        const nameHint = seg.hints.find((h) => h.kind === 'possible-step-name');
        const index = created + 1;
        const title = nameHint
          ? nameHint.label.replace(/\b\w/g, (c) => c.toUpperCase())
          : `Unreviewed Segment ${String(index).padStart(2, '0')} (${source.filename})`;
        const id = `step-${shortHash(`${source.id}:${seg.startTc}`)}`;
        if (steps.some((st) => st.id === id)) continue;
        steps.push({
          id,
          title,
          aliases: [],
          slug: slugify(`${title}-${shortHash(id, 4)}`),
          type: 'step',
          category: 'Extra+',
          subcategory: '',
          level: 'Improver',
          timing: '',
          counts: '',
          direction: '',
          startingFoot: '',
          prerequisites: [],
          relatedSteps: [],
          tags: ['auto-segmented'],
          instructor: source.instructor || '',
          sourceVideo: source.id,
          sourceStartTime: seg.startTc,
          sourceEndTime: seg.endTc,
          explanationStartTime: seg.startTc,
          slowDemoStartTime: '',
          musicDemoStartTime: '',
          durationSeconds: Math.round(seg.end - seg.start),
          summary: '',
          keyTechniquePoints: [],
          commonMistakes: [],
          practiceTips: [],
          musicBpm: null,
          hasExplanation: true,
          hasSlowDemo: false,
          hasMusicDemo: false,
          confidence: nameHint ? 0.5 : 0.25,
          reviewRequired: true,
          reviewReason: nameHint
            ? `Auto-segmented; name "${nameHint.label}" heard in transcript but unverified. Verify boundaries, name, category, level.`
            : 'Auto-segmented with no name evidence. Needs identification, boundaries, category, level.',
          clipPath: '',
          thumbnailPath: '',
          captionsPath: '',
          sections: [
            {
              kind: 'explanation',
              label: 'Explanation',
              sourceStart: seg.start,
              sourceEnd: seg.end,
            },
          ],
          thumbnailTime: (seg.start + seg.end) / 2,
          versionLabel: '',
          alternateVersions: [],
          burnCaptions: false,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        created += 1;
      }
    }
    if (created) {
      saveSteps(steps);
      console.log(
        `--auto-steps: created ${created} flagged step skeleton(s) in data/steps.json.`,
      );
      appendLog('segment-auto-steps', {created});
    }
  }

  console.log('Segmentation drafts complete.');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
