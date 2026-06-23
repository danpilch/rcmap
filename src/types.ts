export interface PropertyFeatures {
  spa: boolean;
  pool: boolean;
  michelin: boolean;
  golf: boolean;
  gardens: boolean;
  fireplace: boolean;
  petFriendly: boolean;
  countryside: boolean;
  seaside: boolean;
}

export interface Restaurant {
  name: string;
  chef: string | null;
  cuisine: string | null;
  stars: number;
  description: string | null;
}

export interface Property {
  id: string;
  name: string;
  type: string;
  typeCode: string;
  architecture: string | null;
  city: string | null;
  county: string | null;
  country: string;
  region: string;
  postalCode: string | null;
  lat: number;
  lng: number;
  locationType: string[];
  memberSince: string | null;
  description: string;
  rooms: number | null;
  priceFrom: number | null;
  priceFromLabel: string | null;
  services: string[];
  features: PropertyFeatures;
  restaurant: Restaurant | null;
  heroImage: string | null;
  gallery: string[];
  website: string | null;
  rcUrl: string;
  phone: string | null;
  nearestAirport: string | null;
  nearestStation: string | null;
}

export type FeatureKey = keyof PropertyFeatures;
