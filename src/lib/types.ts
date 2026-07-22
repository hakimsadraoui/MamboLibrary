// Shared data model for the Mambo Video Library.
// data/steps.json is the single source of truth; everything renders from it.

export type StepType =
  | 'step'
  | 'combination'
  | 'technique'
  | 'drill'
  | 'correction'
  | 'musicality';

export type Level = 'Beginner' | 'Improver' | 'Intermediate' | 'Advanced';

export type SectionKind =
  | 'explanation'
  | 'slow-demo'
  | 'counts-demo'
  | 'music-demo'
  | 'recap-demo'
  | 'mistake'
  | 'variation'
  | 'other';

export interface CueOverlay {
  /** Seconds relative to the start of the section */
  start: number;
  end: number;
  text: string;
  kind?: 'cue' | 'mistake' | 'info';
}

export interface CountOverlaySpec {
  /** Seconds (relative to section start) at which count "1" of the first bar lands */
  startAt: number;
  /** Seconds per count (60 / bpm) */
  secondsPerCount: number;
  /** The count sequence to cycle, e.g. ["1","2","3","4","5","6","7","8"] */
  sequence: string[];
  /** How many full cycles to display */
  cycles: number;
}

export interface ClipSection {
  kind: SectionKind;
  /** Badge shown during this section, e.g. "Slow demonstration" */
  label: string;
  /** Start/end within the SOURCE video, in seconds */
  sourceStart: number;
  sourceEnd: number;
  overlays?: CueOverlay[];
  /** Only present when counts were confidently identified */
  countOverlay?: CountOverlaySpec;
  /** 0–1 volume applied to the source audio in this section (default 1) */
  volume?: number;
}

export interface CaptionCue {
  /** Seconds relative to the final clip timeline */
  start: number;
  end: number;
  text: string;
}

export interface StepRecord {
  id: string;
  title: string;
  aliases: string[];
  slug: string;
  type: StepType;
  category: string;
  subcategory: string;
  level: Level;
  timing: 'On1' | 'On2' | '';
  counts: string;
  direction: string;
  startingFoot: string;
  prerequisites: string[];
  relatedSteps: string[];
  tags: string[];
  instructor: string;
  /** id of the record in data/source-videos.json */
  sourceVideo: string;
  /** HH:MM:SS(.mmm) within the ORIGINAL source video */
  sourceStartTime: string;
  sourceEndTime: string;
  explanationStartTime: string;
  slowDemoStartTime: string;
  musicDemoStartTime: string;
  durationSeconds: number;
  summary: string;
  keyTechniquePoints: string[];
  commonMistakes: string[];
  practiceTips: string[];
  musicBpm: number | null;
  hasExplanation: boolean;
  hasSlowDemo: boolean;
  hasMusicDemo: boolean;
  confidence: number;
  reviewRequired: boolean;
  reviewReason: string;
  clipPath: string;
  thumbnailPath: string;
  captionsPath: string;
  /** Editing plan for the rendered clip */
  sections: ClipSection[];
  /** Source-video second used for the thumbnail frame */
  thumbnailTime: number;
  /** Version label, e.g. "Primary Explanation", "Front View" */
  versionLabel: string;
  /** ids of alternative versions of the same step */
  alternateVersions: string[];
  /** Burn captions into the rendered file (player VTT captions always exist) */
  burnCaptions: boolean;
  /** Marks synthetic pipeline-validation content */
  demo?: boolean;
  addedAt: string;
  updatedAt: string;
}

export interface SourceVideoRecord {
  id: string;
  filename: string;
  path: string;
  durationSeconds: number;
  width: number;
  height: number;
  fps: number;
  videoCodec: string;
  audioCodec: string | null;
  hasAudio: boolean;
  sizeBytes: number;
  mtime: string;
  recordingDate: string;
  instructor: string;
  existingTitle: string;
  technicalQuality: string;
  fullBodyVisible: string;
  feetVisible: string;
  musicPresent: string;
  speechClear: string;
  transcribable: string;
  potentialDuplicateOf: string[];
  notes: string;
  /** Web-compatible working copy under public/sources/ */
  preppedPath: string;
  auditedAt: string;
}

export interface ClipProps {
  /** staticFile-relative path of the prepped source, e.g. "sources/<id>.mp4" */
  sourceVideo: string;
  title: string;
  category: string;
  categoryColor: string;
  level: string;
  timing: string;
  counts: string;
  instructor: string;
  versionLabel: string;
  sections: ClipSection[];
  captions: CaptionCue[];
  burnCaptions: boolean;
  keyPoints: string[];
  practiceTip: string;
  sourceRef: {filename: string; start: string; end: string};
  musicDemoAvailable: boolean;
}

export interface ThumbnailProps {
  /** staticFile-relative path of the extracted frame image */
  frameImage: string;
  title: string;
  category: string;
  categoryColor: string;
  level: string;
  viewLabel: string;
}
