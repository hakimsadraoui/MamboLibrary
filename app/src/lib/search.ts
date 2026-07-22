import Fuse from 'fuse.js';
import type {LibraryData, Step} from './data';

export interface Filters {
  category: string;
  subcategory: string;
  level: string;
  type: string;
  instructor: string;
  timing: string;
  startingFoot: string;
  direction: string;
  hasMusicDemo: boolean | null;
  hasSlowDemo: boolean | null;
  review: 'all' | 'flagged' | 'clean';
}

export const emptyFilters: Filters = {
  category: '',
  subcategory: '',
  level: '',
  type: '',
  instructor: '',
  timing: '',
  startingFoot: '',
  direction: '',
  hasMusicDemo: null,
  hasSlowDemo: null,
  review: 'all',
};

interface Indexed extends Step {
  aliasText: string;
  globalAliases: string;
}

export const buildSearch = (data: LibraryData) => {
  const indexed: Indexed[] = data.steps.map((step) => {
    // Fold the global alias map into each step's searchable text so
    // "susie q" finds "Suzie Q" even if the record lists no aliases.
    const global = Object.entries(data.aliases)
      .filter(([canonical]) => !canonical.startsWith('_'))
      .filter(
        ([canonical, alts]) =>
          step.title.toLowerCase().includes(canonical.toLowerCase()) ||
          alts.some((a) => step.title.toLowerCase().includes(a.toLowerCase())),
      )
      .flatMap(([canonical, alts]) => [canonical, ...alts])
      .join(' ');
    return {
      ...step,
      aliasText: step.aliases.join(' '),
      globalAliases: global,
    };
  });

  const fuse = new Fuse(indexed, {
    threshold: 0.34, // tolerant of minor misspellings
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      {name: 'title', weight: 3},
      {name: 'aliasText', weight: 2.5},
      {name: 'globalAliases', weight: 2.5},
      {name: 'category', weight: 1.2},
      {name: 'subcategory', weight: 1},
      {name: 'tags', weight: 1.2},
      {name: 'counts', weight: 1},
      {name: 'instructor', weight: 1},
      {name: 'summary', weight: 0.8},
      {name: 'keyTechniquePoints', weight: 0.8},
      {name: 'commonMistakes', weight: 0.8},
      {name: 'type', weight: 0.6},
    ],
  });

  return (query: string, filters: Filters): Step[] => {
    let results: Step[] = query.trim()
      ? fuse.search(query.trim()).map((r) => r.item)
      : [...indexed].sort(
          (a, b) =>
            new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
        );
    if (filters.category) {
      results = results.filter((s) => s.category === filters.category);
    }
    if (filters.subcategory) {
      results = results.filter((s) => s.subcategory === filters.subcategory);
    }
    if (filters.level) {
      results = results.filter((s) => s.level === filters.level);
    }
    if (filters.type) {
      results = results.filter((s) => s.type === filters.type);
    }
    if (filters.instructor) {
      results = results.filter((s) => s.instructor === filters.instructor);
    }
    if (filters.timing) {
      results = results.filter((s) => s.timing === filters.timing);
    }
    if (filters.startingFoot) {
      results = results.filter((s) => s.startingFoot === filters.startingFoot);
    }
    if (filters.direction) {
      results = results.filter((s) => s.direction === filters.direction);
    }
    if (filters.hasMusicDemo !== null) {
      results = results.filter((s) => s.hasMusicDemo === filters.hasMusicDemo);
    }
    if (filters.hasSlowDemo !== null) {
      results = results.filter((s) => s.hasSlowDemo === filters.hasSlowDemo);
    }
    if (filters.review === 'flagged') {
      results = results.filter((s) => s.reviewRequired);
    } else if (filters.review === 'clean') {
      results = results.filter((s) => !s.reviewRequired);
    }
    return results;
  };
};
