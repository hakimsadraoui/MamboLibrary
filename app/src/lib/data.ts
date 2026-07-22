// Client-side data layer: fetches the synced JSON from /data/ (written by
// scripts/manifest.mjs) and caches it for the session.

export interface ClipSection {
  kind: string;
  label: string;
  sourceStart: number;
  sourceEnd: number;
}

export interface Step {
  id: string;
  title: string;
  aliases: string[];
  slug: string;
  type: string;
  category: string;
  subcategory: string;
  level: string;
  timing: string;
  counts: string;
  direction: string;
  startingFoot: string;
  prerequisites: string[];
  relatedSteps: string[];
  tags: string[];
  instructor: string;
  sourceVideo: string;
  sourceStartTime: string;
  sourceEndTime: string;
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
  sections: ClipSection[];
  versionLabel: string;
  alternateVersions: string[];
  demo?: boolean;
  addedAt: string;
  updatedAt: string;
}

export interface SourceVideo {
  id: string;
  filename: string;
  path: string;
  durationSeconds: number;
  durationHuman?: string;
  width: number;
  height: number;
  fps: number;
  hasAudio: boolean;
  instructor: string;
  preppedPath: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface LibraryData {
  steps: Step[];
  sources: SourceVideo[];
  categories: Category[];
  levels: string[];
  types: string[];
  timings: string[];
  aliases: Record<string, string[]>;
  meta: {generatedAt?: string; totalSteps?: number; reviewCount?: number};
}

let cache: Promise<LibraryData> | null = null;

const get = async <T,>(url: string, fallback: T): Promise<T> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
};

export const loadLibrary = (): Promise<LibraryData> => {
  if (!cache) {
    cache = (async () => {
      const [steps, sourcesRaw, categoriesRaw, aliases, meta] =
        await Promise.all([
          get<Step[]>('data/steps.json', []),
          get<{sources: SourceVideo[]}>('data/source-videos.json', {sources: []}),
          get<{
            categories: Category[];
            levels: string[];
            types: string[];
            timings: string[];
          }>('data/categories.json', {
            categories: [],
            levels: [],
            types: [],
            timings: [],
          }),
          get<Record<string, string[]>>('data/aliases.json', {}),
          get<LibraryData['meta']>('data/library-meta.json', {}),
        ]);
      return {
        steps,
        sources: sourcesRaw.sources,
        categories: categoriesRaw.categories,
        levels: categoriesRaw.levels,
        types: categoriesRaw.types,
        timings: categoriesRaw.timings,
        aliases,
        meta,
      };
    })();
  }
  return cache;
};

export const categoryColor = (data: LibraryData, name: string): string =>
  data.categories.find((c) => c.name === name)?.color ?? '#E8B44F';

export const formatDuration = (seconds: number): string => {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `0:${String(s).padStart(2, '0')}`;
};
