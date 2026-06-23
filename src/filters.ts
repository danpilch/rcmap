import type { FeatureKey, Property } from "./types";

export interface AmenityFilter {
  key: FeatureKey;
  label: string;
}

// Discriminating amenity filters (gardens/golf are near-universal, so omitted).
export const AMENITY_FILTERS: AmenityFilter[] = [
  { key: "michelin", label: "Michelin" },
  { key: "spa", label: "Spa" },
  { key: "pool", label: "Pool" },
];

export interface CountryCount {
  country: string;
  count: number;
}

// Countries present in the data, ordered by number of properties (desc).
export function countriesFromData(properties: Property[]): CountryCount[] {
  const counts = new Map<string, number>();
  for (const p of properties) counts.set(p.country, (counts.get(p.country) ?? 0) + 1);
  return [...counts.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));
}
