import React, {useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {formatDuration, type LibraryData} from '../lib/data';
import {buildSearch, emptyFilters, type Filters} from '../lib/search';
import {getContinueWatching} from '../lib/store';
import {StepCard} from '../components/StepCard';
import {FilterPanel} from '../components/FilterPanel';

export const Home: React.FC<{data: LibraryData}> = ({data}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({...emptyFilters});
  const [showFilters, setShowFilters] = useState(false);

  const search = useMemo(() => buildSearch(data), [data]);
  const results = useMemo(
    () => search(query, filters),
    [search, query, filters],
  );

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) =>
      JSON.stringify(v) !==
      JSON.stringify(emptyFilters[k as keyof Filters]),
  ).length;
  const browsing = !query.trim() && activeFilterCount === 0;

  const continueIds = getContinueWatching();
  const continueSteps = continueIds
    .map((id) => data.steps.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .slice(0, 4);
  const recent = [...data.steps]
    .sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    )
    .slice(0, 8);
  const reviewSteps = data.steps.filter((s) => s.reviewRequired);
  const totalSeconds = data.steps.reduce(
    (acc, s) => acc + (s.durationSeconds || 0),
    0,
  );
  const featuredCategories = data.categories.filter((c) =>
    data.steps.some((s) => s.category === c.name),
  );

  return (
    <main className="container">
      <section className="hero">
        <h1>
          Find any step.
          <br />
          <span>Train it properly.</span>
        </h1>
        <div className="stats">
          <span>
            <strong>{data.steps.length}</strong> steps
          </span>
          <span>
            <strong>{data.sources.length}</strong> source videos
          </span>
          <span>
            <strong>{formatDuration(totalSeconds)}</strong> of focused clips
          </span>
          {reviewSteps.length > 0 ? (
            <span>
              <Link to="/review" style={{color: 'var(--accent-hot)'}}>
                <strong>{reviewSteps.length}</strong> awaiting review →
              </Link>
            </span>
          ) : null}
        </div>
      </section>

      <div className="search-row">
        <input
          className="search-input"
          placeholder="Search steps, aliases, techniques, mistakes… (typo-friendly)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button
          className={`filter-toggle ${showFilters || activeFilterCount ? 'active' : ''}`}
          onClick={() => setShowFilters((v) => !v)}
        >
          Filters{activeFilterCount ? ` · ${activeFilterCount}` : ''}
        </button>
      </div>
      {showFilters ? (
        <FilterPanel data={data} filters={filters} onChange={setFilters} />
      ) : null}

      {data.steps.length === 0 ? (
        <div className="empty-state">
          <h2>The library is ready — it just needs footage</h2>
          <p>
            Drop long-form teaching videos into <code>source-videos/</code>{' '}
            (e.g. downloaded from a GitHub Release), then run{' '}
            <code>npm run pipeline</code>. Steps will appear here
            automatically.
          </p>
        </div>
      ) : browsing ? (
        <>
          {continueSteps.length > 0 ? (
            <>
              <div className="section-title">Continue watching</div>
              <div className="grid">
                {continueSteps.map((s) => (
                  <StepCard key={s.id} step={s} data={data} />
                ))}
              </div>
            </>
          ) : null}

          <div className="section-title">Recently added</div>
          <div className="grid">
            {recent.map((s) => (
              <StepCard key={s.id} step={s} data={data} />
            ))}
          </div>

          {featuredCategories.map((cat) => {
            const inCat = data.steps.filter((s) => s.category === cat.name);
            return (
              <React.Fragment key={cat.id}>
                <div className="section-title">
                  <span style={{color: cat.color}}>■</span> {cat.name} ·{' '}
                  {inCat.length}
                </div>
                <div className="grid">
                  {inCat.slice(0, 8).map((s) => (
                    <StepCard key={s.id} step={s} data={data} />
                  ))}
                </div>
              </React.Fragment>
            );
          })}
        </>
      ) : (
        <>
          <div className="section-title">
            {results.length} result{results.length === 1 ? '' : 's'}
          </div>
          {results.length === 0 ? (
            <div className="empty-state">
              <h2>No matches</h2>
              <p>
                Try a shorter query — search also covers aliases, categories,
                technique keywords and common mistakes.
              </p>
            </div>
          ) : (
            <div className="grid">
              {results.map((s) => (
                <StepCard key={s.id} step={s} data={data} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
};
