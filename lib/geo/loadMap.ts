import type { FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import { feature } from "topojson-client";
import type { MapRegion } from "@/types/blocks";

export type MapGeoProperties = { name: string };
export type MapGeoCollection = FeatureCollection<Geometry, MapGeoProperties>;

type WorldTopology = Topology<{ countries: GeometryCollection }>;
type UsTopology = Topology<{ states: GeometryCollection }>;

const cache: Partial<Record<MapRegion, MapGeoCollection>> = {};
const loadPromises: Partial<Record<MapRegion, Promise<MapGeoCollection>>> = {};

async function loadWorldCountries(): Promise<MapGeoCollection> {
  const res = await fetch("/geo/world-110m.json");
  if (!res.ok) throw new Error("Failed to load world map");
  const topology = (await res.json()) as WorldTopology;
  return feature(topology, topology.objects.countries) as MapGeoCollection;
}

async function loadUsStates(): Promise<MapGeoCollection> {
  const res = await fetch("/geo/us-states-10m.json");
  if (!res.ok) throw new Error("Failed to load US states map");
  const topology = (await res.json()) as UsTopology;
  return feature(topology, topology.objects.states) as MapGeoCollection;
}

export async function loadMapGeo(mapRegion: MapRegion = "world"): Promise<MapGeoCollection> {
  if (cache[mapRegion]) return cache[mapRegion]!;

  if (!loadPromises[mapRegion]) {
    loadPromises[mapRegion] =
      mapRegion === "usa" ? loadUsStates() : loadWorldCountries();
    loadPromises[mapRegion]!.then((geo) => {
      cache[mapRegion] = geo;
    });
  }

  return loadPromises[mapRegion]!;
}

/** @deprecated Use loadMapGeo("world") */
export async function loadWorldCountriesLegacy(): Promise<MapGeoCollection> {
  return loadMapGeo("world");
}
