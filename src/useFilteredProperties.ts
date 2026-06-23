import { useMemo } from "react";
import Fuse from "fuse.js";
import type { FeatureKey, Property } from "./types";

export interface Filters {
  query: string;
  countries: Set<string>;
  amenities: Set<FeatureKey>;
}

function passesFacets(p: Property, countries: Set<string>, amenities: Set<FeatureKey>) {
  if (countries.size && !countries.has(p.country)) return false;
  for (const a of amenities) if (!p.features[a]) return false;
  return true;
}

export function useFilteredProperties(properties: Property[], filters: Filters) {
  const fuse = useMemo(
    () =>
      new Fuse(properties, {
        threshold: 0.38,
        ignoreLocation: true,
        keys: [
          { name: "name", weight: 3 },
          { name: "city", weight: 2 },
          { name: "country", weight: 2 },
          { name: "region", weight: 2 },
          { name: "county", weight: 1.5 },
          "architecture",
          "services",
          "restaurant.chef",
          "restaurant.cuisine",
          "description",
        ],
      }),
    [properties],
  );

  return useMemo(() => {
    const q = filters.query.trim();
    const base = q ? fuse.search(q).map((r) => r.item) : properties;
    return base.filter((p) => passesFacets(p, filters.countries, filters.amenities));
  }, [fuse, properties, filters.query, filters.countries, filters.amenities]);
}
