// Lightweight persistence: resume positions, continue-watching list and
// player preferences, all in localStorage.

const KEY = 'mambo-library-v1';

interface Store {
  positions: Record<string, number>;
  lastWatched: string[];
  prefs: {
    captions: boolean;
    mirror: boolean;
    speed: number;
    showCounts: boolean;
  };
}

const defaults: Store = {
  positions: {},
  lastWatched: [],
  prefs: {captions: true, mirror: false, speed: 1, showCounts: false},
};

const read = (): Store => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(defaults);
    return {...structuredClone(defaults), ...JSON.parse(raw)};
  } catch {
    return structuredClone(defaults);
  }
};

const write = (store: Store) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // best-effort
  }
};

export const getResume = (stepId: string): number =>
  read().positions[stepId] ?? 0;

export const setResume = (stepId: string, seconds: number) => {
  const store = read();
  store.positions[stepId] = seconds;
  store.lastWatched = [
    stepId,
    ...store.lastWatched.filter((id) => id !== stepId),
  ].slice(0, 12);
  write(store);
};

export const getContinueWatching = (): string[] => read().lastWatched;

export const getPrefs = () => read().prefs;

export const setPref = <K extends keyof Store['prefs']>(
  key: K,
  value: Store['prefs'][K],
) => {
  const store = read();
  store.prefs[key] = value;
  write(store);
};
