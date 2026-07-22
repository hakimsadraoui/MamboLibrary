// Generates the CSV reports and syncs data/ → public/data/ so the web
// library (which is fully static) can fetch fresh metadata.

import fs from 'node:fs';
import path from 'node:path';
import {
  PATHS,
  appendLog,
  loadSources,
  loadSteps,
  readJson,
  writeCsv,
  writeJson,
} from './lib/common.mjs';

const main = () => {
  const steps = loadSteps();
  const sources = loadSources().sources;
  const srcById = new Map(sources.map((s) => [s.id, s]));

  // --- clip-manifest.csv ---
  writeCsv(
    path.join(PATHS.reports, 'clip-manifest.csv'),
    [
      'id', 'title', 'category', 'level', 'type', 'timing', 'durationSeconds',
      'sourceFile', 'sourceStart', 'sourceEnd', 'hasSlowDemo', 'hasMusicDemo',
      'confidence', 'reviewRequired', 'clipPath', 'thumbnailPath', 'captionsPath',
    ],
    steps.map((s) => ({
      id: s.id,
      title: s.title,
      category: s.category,
      level: s.level,
      type: s.type,
      timing: s.timing,
      durationSeconds: s.durationSeconds,
      sourceFile: srcById.get(s.sourceVideo)?.filename ?? s.sourceVideo,
      sourceStart: s.sourceStartTime,
      sourceEnd: s.sourceEndTime,
      hasSlowDemo: s.hasSlowDemo,
      hasMusicDemo: s.hasMusicDemo,
      confidence: s.confidence,
      reviewRequired: s.reviewRequired,
      clipPath: s.clipPath,
      thumbnailPath: s.thumbnailPath,
      captionsPath: s.captionsPath,
    })),
  );

  // --- review-required.csv ---
  const flagged = steps.filter((s) => s.reviewRequired || s.confidence < 0.75);
  writeCsv(
    path.join(PATHS.reports, 'review-required.csv'),
    [
      'id', 'proposedName', 'confidence', 'reason', 'suggestedAlternatives',
      'sourceFile', 'sourceTimestamp', 'clipPreview', 'thumbnail',
    ],
    flagged.map((s) => ({
      id: s.id,
      proposedName: s.title,
      confidence: s.confidence,
      reason:
        s.reviewReason ||
        (s.confidence < 0.75 ? 'Confidence below 0.75' : ''),
      suggestedAlternatives: (s.aliases ?? []).join(' | '),
      sourceFile: srcById.get(s.sourceVideo)?.filename ?? s.sourceVideo,
      sourceTimestamp: `${s.sourceStartTime}–${s.sourceEndTime}`,
      clipPreview: s.clipPath ? `public/${s.clipPath}` : 'not rendered',
      thumbnail: s.thumbnailPath ? `public/${s.thumbnailPath}` : 'not rendered',
    })),
  );

  // --- duplicates.csv ---
  const dupRows = [];
  // Step-level: alternate versions of the same step
  for (const s of steps) {
    for (const altId of s.alternateVersions ?? []) {
      const alt = steps.find((x) => x.id === altId);
      dupRows.push({
        kind: 'step-version',
        primary: s.title,
        primaryId: s.id,
        duplicate: alt?.title ?? altId,
        duplicateId: altId,
        decision: `kept as "${alt?.versionLabel || 'Alternative'}"`,
        reason: 'Same step, different take — both retained',
      });
    }
  }
  // Source-level duplicates from the audit
  for (const src of sources) {
    for (const dupId of src.potentialDuplicateOf ?? []) {
      if (src.id < dupId) continue; // report each pair once
      dupRows.push({
        kind: 'source-file',
        primary: src.filename,
        primaryId: src.id,
        duplicate: srcById.get(dupId)?.filename ?? dupId,
        duplicateId: dupId,
        decision: 'needs human confirmation',
        reason: 'Same size or near-identical duration/name',
      });
    }
  }
  writeCsv(
    path.join(PATHS.reports, 'duplicates.csv'),
    ['kind', 'primary', 'primaryId', 'duplicate', 'duplicateId', 'decision', 'reason'],
    dupRows,
  );

  // --- sync data → public/data (static library fetches these) ---
  fs.mkdirSync(PATHS.publicData, {recursive: true});
  for (const file of [
    'steps.json',
    'source-videos.json',
    'categories.json',
    'aliases.json',
  ]) {
    fs.copyFileSync(
      path.join(PATHS.data, file),
      path.join(PATHS.publicData, file),
    );
  }
  // The library's review queue also wants the log summary:
  const log = readJson(PATHS.processingLog, {entries: []});
  writeJson(path.join(PATHS.publicData, 'library-meta.json'), {
    generatedAt: new Date().toISOString(),
    totalSteps: steps.length,
    reviewCount: flagged.length,
    lastPipelineEvents: log.entries.slice(-20),
  });

  appendLog('manifest', {
    steps: steps.length,
    review: flagged.length,
    duplicates: dupRows.length,
  });
  console.log(
    `Manifest: ${steps.length} step(s), ${flagged.length} flagged for review, ${dupRows.length} duplicate pair(s). Reports + public/data updated.`,
  );
};

main();
