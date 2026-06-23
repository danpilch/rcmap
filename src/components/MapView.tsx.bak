import { useEffect, useMemo, useRef } from "react";
import Map, {
  Source,
  Layer,
  Marker,
  Popup,
  NavigationControl,
  type MapRef,
  type MapLayerMouseEvent,
  type LayerProps,
} from "react-map-gl/maplibre";
import type { GeoJSONSource } from "maplibre-gl";
import type { Property } from "../types";

interface Props {
  properties: Property[]; // filtered set (what's visible)
  all: Property[];
  selectedId: string | null;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
const SOURCE_ID = "properties";

const BRASS = "#a37e3d";
const BRASS_DEEP = "#7a5f23";

const clusterLayer: LayerProps = {
  id: "clusters",
  type: "circle",
  source: SOURCE_ID,
  filter: ["has", "point_count"],
  paint: {
    "circle-color": ["step", ["get", "point_count"], "#c2a05c", 10, BRASS, 30, BRASS_DEEP],
    "circle-radius": ["step", ["get", "point_count"], 16, 10, 21, 30, 27],
    "circle-stroke-width": 3,
    "circle-stroke-color": "rgba(255,253,248,0.85)",
  },
};

const clusterCountLayer: LayerProps = {
  id: "cluster-count",
  type: "symbol",
  source: SOURCE_ID,
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["Noto Sans Regular"],
    "text-size": 13,
  },
  paint: { "text-color": "#fffdf8" },
};

const unclusteredLayer: LayerProps = {
  id: "unclustered",
  type: "circle",
  source: SOURCE_ID,
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": BRASS,
    "circle-radius": 6,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#fffdf8",
  },
};

export function MapView({ properties, all, selectedId, hoveredId, onSelect, onHover }: Props) {
  const mapRef = useRef<MapRef>(null);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: properties.map((p) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [p.lng, p.lat] },
        properties: { id: p.id },
      })),
    }),
    [properties],
  );

  // Fly to the selected property.
  useEffect(() => {
    if (!selectedId) return;
    const p = all.find((x) => x.id === selectedId);
    if (!p || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [p.lng, p.lat],
      zoom: Math.max(mapRef.current.getZoom(), 7.5),
      duration: 1100,
      essential: true,
    });
  }, [selectedId, all]);

  const handleClick = (e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature) return;
    if (feature.properties?.point_count) {
      const clusterId = feature.properties.cluster_id;
      const src = mapRef.current?.getSource(SOURCE_ID) as GeoJSONSource | undefined;
      src?.getClusterExpansionZoom(clusterId).then((zoom) => {
        mapRef.current?.easeTo({
          center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: zoom + 0.4,
          duration: 700,
        });
      });
    } else if (feature.properties?.id) {
      onSelect(feature.properties.id as string);
    }
  };

  const handleMouseMove = (e: MapLayerMouseEvent) => {
    const f = e.features?.[0];
    const map = mapRef.current;
    if (map) map.getCanvas().style.cursor = f ? "pointer" : "";
    if (f && !f.properties?.point_count && f.properties?.id) {
      onHover(f.properties.id as string);
    } else {
      onHover(null);
    }
  };

  // The property whose tooltip to show (map-hover or list-hover).
  const popupProp =
    hoveredId && hoveredId !== selectedId
      ? all.find((p) => p.id === hoveredId) ?? null
      : null;
  const selected = selectedId ? all.find((p) => p.id === selectedId) ?? null : null;

  return (
    <Map
      ref={mapRef}
      initialViewState={{ longitude: 9, latitude: 48.5, zoom: 3.5 }}
      minZoom={3}
      maxZoom={16}
      mapStyle={MAP_STYLE}
      interactiveLayerIds={["clusters", "unclustered"]}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => onHover(null)}
    >
      <NavigationControl position="bottom-right" showCompass={false} />

      <Source
        id={SOURCE_ID}
        type="geojson"
        data={geojson}
        cluster
        clusterMaxZoom={9}
        clusterRadius={48}
      >
        <Layer {...clusterLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...unclusteredLayer} />
      </Source>

      {selected && (
        <Marker longitude={selected.lng} latitude={selected.lat} anchor="center">
          <div className="marker marker--active" />
        </Marker>
      )}

      {popupProp && (
        <Popup
          longitude={popupProp.lng}
          latitude={popupProp.lat}
          anchor="bottom"
          offset={14}
          closeButton={false}
          closeOnClick={false}
          className="map-tooltip"
        >
          <span className="map-tooltip__region">{popupProp.country}</span>
          {popupProp.name}
        </Popup>
      )}
    </Map>
  );
}
