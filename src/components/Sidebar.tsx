import type { FeatureKey, Property } from "../types";
import { AMENITY_FILTERS, type CountryCount } from "../filters";
import { SearchIcon } from "./icons";
import { PropertyCard } from "./PropertyCard";

interface Props {
  all: Property[];
  results: Property[];
  countries: CountryCount[];
  query: string;
  activeCountries: Set<string>;
  activeAmenities: Set<FeatureKey>;
  selectedId: string | null;
  onQuery: (q: string) => void;
  onToggleCountry: (c: string) => void;
  onToggleAmenity: (a: FeatureKey) => void;
  onReset: () => void;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

export function Sidebar({
  all,
  results,
  countries,
  query,
  activeCountries,
  activeAmenities,
  selectedId,
  onQuery,
  onToggleCountry,
  onToggleAmenity,
  onReset,
  onSelect,
  onHover,
}: Props) {
  const hasFilters = query || activeCountries.size || activeAmenities.size;

  return (
    <>
      <header className="brand">
        <p className="brand__eyebrow">Relais &amp; Châteaux</p>
        <h1 className="brand__title">Europe</h1>
        <p className="brand__subtitle">
          {all.length} houses across {countries.length} countries
        </p>
      </header>

      <div className="controls">
        <div className="search">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search name, place, country, chef…"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
          {query && (
            <button className="search__clear" onClick={() => onQuery("")} aria-label="Clear">
              ✕
            </button>
          )}
        </div>

        <div className="filters">
          {AMENITY_FILTERS.map((a) => (
            <button
              key={a.key}
              className="chip"
              aria-pressed={activeAmenities.has(a.key)}
              onClick={() => onToggleAmenity(a.key)}
            >
              {a.label}
              <span className="chip__count">
                {all.filter((p) => p.features[a.key]).length}
              </span>
            </button>
          ))}
        </div>

        <div className="country-strip">
          {countries.map(({ country, count }) => (
            <button
              key={country}
              className="chip chip--country"
              aria-pressed={activeCountries.has(country)}
              onClick={() => onToggleCountry(country)}
            >
              {country}
              <span className="chip__count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="results-meta">
        <span className="results-meta__count">
          {results.length} {results.length === 1 ? "property" : "properties"}
        </span>
        {hasFilters && (
          <button className="results-meta__reset" onClick={onReset}>
            Reset
          </button>
        )}
      </div>

      <div className="list">
        {results.length === 0 ? (
          <div className="empty">
            <p className="empty__title">No houses match</p>
            <p>Try clearing a filter or searching a different place.</p>
          </div>
        ) : (
          results.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              active={p.id === selectedId}
              onClick={() => onSelect(p.id)}
              onHover={onHover}
            />
          ))
        )}
      </div>
    </>
  );
}
