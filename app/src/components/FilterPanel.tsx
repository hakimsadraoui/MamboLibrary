import React from 'react';
import type {LibraryData} from '../lib/data';
import {emptyFilters, type Filters} from '../lib/search';

const Select: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}> = ({label, value, options, onChange}) => (
  <label>
    {label}
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">All</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </label>
);

const TriState: React.FC<{
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}> = ({label, value, onChange}) => (
  <label>
    {label}
    <select
      value={value === null ? '' : value ? 'yes' : 'no'}
      onChange={(e) =>
        onChange(e.target.value === '' ? null : e.target.value === 'yes')
      }
    >
      <option value="">All</option>
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>
  </label>
);

export const FilterPanel: React.FC<{
  data: LibraryData;
  filters: Filters;
  onChange: (f: Filters) => void;
}> = ({data, filters, onChange}) => {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({...filters, [key]: value});
  const distinct = (fn: (s: LibraryData['steps'][number]) => string) =>
    [...new Set(data.steps.map(fn).filter(Boolean))].sort();

  return (
    <div className="filters">
      <Select
        label="Category"
        value={filters.category}
        options={data.categories.map((c) => c.name)}
        onChange={(v) => set('category', v)}
      />
      <Select
        label="Subcategory"
        value={filters.subcategory}
        options={distinct((s) => s.subcategory)}
        onChange={(v) => set('subcategory', v)}
      />
      <Select
        label="Level"
        value={filters.level}
        options={data.levels}
        onChange={(v) => set('level', v)}
      />
      <Select
        label="Type"
        value={filters.type}
        options={data.types}
        onChange={(v) => set('type', v)}
      />
      <Select
        label="Instructor"
        value={filters.instructor}
        options={distinct((s) => s.instructor)}
        onChange={(v) => set('instructor', v)}
      />
      <Select
        label="Timing"
        value={filters.timing}
        options={data.timings}
        onChange={(v) => set('timing', v)}
      />
      <Select
        label="Starting foot"
        value={filters.startingFoot}
        options={distinct((s) => s.startingFoot)}
        onChange={(v) => set('startingFoot', v)}
      />
      <Select
        label="Direction"
        value={filters.direction}
        options={distinct((s) => s.direction)}
        onChange={(v) => set('direction', v)}
      />
      <TriState
        label="Music demo"
        value={filters.hasMusicDemo}
        onChange={(v) => set('hasMusicDemo', v)}
      />
      <TriState
        label="Slow demo"
        value={filters.hasSlowDemo}
        onChange={(v) => set('hasSlowDemo', v)}
      />
      <label>
        Review status
        <select
          value={filters.review}
          onChange={(e) => set('review', e.target.value as Filters['review'])}
        >
          <option value="all">All</option>
          <option value="flagged">Needs review</option>
          <option value="clean">Reviewed / confident</option>
        </select>
      </label>
      <button className="clear-btn" onClick={() => onChange({...emptyFilters})}>
        Clear filters
      </button>
    </div>
  );
};
