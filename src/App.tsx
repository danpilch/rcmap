import { useMemo, useState } from "react";
import type { FeatureKey, Property } from "./types";
import rawData from "./data/properties.json";
import { countriesFromData } from "./filters";
import { useFilteredProperties } from "./useFilteredProperties";
import { Sidebar } from "./components/Sidebar";
import { MapView } from "./components/MapView";
import { PropertyDetail } from "./components/PropertyDetail";

const properties = rawData as unknown as Property[];

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  next.has(value) ? next.delete(value) : next.add(value);
  return next;
}

export function App() {
  const [query, setQuery] = useState("");
  const [countries, setCountries] = useState<Set<string>>(new Set());
  const [amenities, setAmenities] = useState<Set<FeatureKey>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const countryList = useMemo(() => countriesFromData(properties), []);
  const results = useFilteredProperties(properties, { query, countries, amenities });
  const selected = selectedId ? properties.find((p) => p.id === selectedId) ?? null : null;

  const reset = () => {
    setQuery("");
    setCountries(new Set());
    setAmenities(new Set());
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSheetOpen(false);
  };

  return (
    <div className="app">
      <div className={`sidebar${sheetOpen ? " sidebar--open" : ""}`}>
        <div className="mobile-toggle" onClick={() => setSheetOpen((v) => !v)} />
        <Sidebar
          all={properties}
          results={results}
          countries={countryList}
          query={query}
          activeCountries={countries}
          activeAmenities={amenities}
          selectedId={selectedId}
          onQuery={(q) => {
            setQuery(q);
            setSheetOpen(true);
          }}
          onToggleCountry={(c) => setCountries((s) => toggle(s, c))}
          onToggleAmenity={(a) => setAmenities((s) => toggle(s, a))}
          onReset={reset}
          onSelect={handleSelect}
          onHover={setHoveredId}
        />
      </div>

      <div className="map-pane">
        <div className="map-overlay-title">
          <b>{results.length}</b> of {properties.length} properties
        </div>
        <MapView
          properties={results}
          all={properties}
          selectedId={selectedId}
          hoveredId={hoveredId}
          onSelect={handleSelect}
          onHover={setHoveredId}
        />
        {selected && (
          <PropertyDetail property={selected} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  );
}
