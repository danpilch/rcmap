import { useState } from "react";
import type { Property } from "../types";
import { Lightbox } from "./Lightbox";
import {
  PinIcon,
  StarIcon,
  ForkKnifeIcon,
  SpaIcon,
  PoolIcon,
  GolfIcon,
  GardenIcon,
  PlaneIcon,
  TrainIcon,
  CrownIcon,
} from "./icons";

interface Props {
  property: Property;
  onClose: () => void;
}

const AMENITY_ROWS = [
  { key: "michelin", label: "Michelin dining", Icon: StarIcon },
  { key: "spa", label: "Spa & wellness", Icon: SpaIcon },
  { key: "pool", label: "Swimming pool", Icon: PoolIcon },
  { key: "golf", label: "Golf", Icon: GolfIcon },
  { key: "gardens", label: "Gardens & grounds", Icon: GardenIcon },
] as const;

export function PropertyDetail({ property: p, onClose }: Props) {
  const loc = [p.city, p.county, p.postalCode].filter(Boolean).join(", ");
  const amenities = AMENITY_ROWS.filter((a) => p.features[a.key]);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const gallery = p.gallery.slice(0, 6);

  return (
    <>
    <aside className="detail">
      <div className="detail__scroll">
        <div className="detail__hero">
          <button className="detail__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
          {p.heroImage && <img src={p.heroImage} alt={p.name} />}
          <div className="detail__hero-cap">
            <div className="detail__hero-region">{p.region}</div>
            <h2 className="detail__hero-name">{p.name}</h2>
          </div>
        </div>

        <div className="detail__body">
          <div className="detail__loc">
            <PinIcon />
            <span>{loc}</span>
          </div>

          <div className="stat-row">
            {p.rooms && (
              <div className="stat">
                <div className="stat__value">{p.rooms}</div>
                <div className="stat__label">Rooms</div>
              </div>
            )}
            {p.restaurant && p.restaurant.stars > 0 && (
              <div className="stat">
                <div className="stat__value stat__value--gold">{p.restaurant.stars}★</div>
                <div className="stat__label">Michelin</div>
              </div>
            )}
            {p.priceFromLabel && (
              <div className="stat">
                <div className="stat__value">{p.priceFromLabel}</div>
                <div className="stat__label">Per night</div>
              </div>
            )}
            {p.memberSince && (
              <div className="stat">
                <div className="stat__value">{p.memberSince}</div>
                <div className="stat__label">Member since</div>
              </div>
            )}
          </div>

          {p.description && (
            <>
              <h3>The House</h3>
              <p className="detail__desc">{p.description}</p>
            </>
          )}

          {p.restaurant && (
            <>
              <h3>
                <ForkKnifeIcon style={{ width: 13, height: 13, verticalAlign: "-1px" }} /> Dining
              </h3>
              <div className="restaurant">
                <div className="restaurant__name">
                  {p.restaurant.name}
                  {p.restaurant.stars > 0 && (
                    <span className="restaurant__stars">
                      {Array.from({ length: p.restaurant.stars }).map((_, i) => (
                        <StarIcon key={i} style={{ width: 13, height: 13 }} />
                      ))}
                    </span>
                  )}
                </div>
                {(p.restaurant.chef || p.restaurant.cuisine) && (
                  <div className="restaurant__chef">
                    {[p.restaurant.chef, p.restaurant.cuisine].filter(Boolean).join(" · ")}
                  </div>
                )}
                {p.restaurant.description && (
                  <p className="restaurant__desc">{p.restaurant.description}</p>
                )}
              </div>
            </>
          )}

          {amenities.length > 0 && (
            <>
              <h3>Amenities</h3>
              <div className="amenities">
                {amenities.map(({ key, label, Icon }) => (
                  <div className="amenity" key={key}>
                    <Icon />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {p.services.length > 0 && (
            <>
              <h3>Services &amp; activities</h3>
              <div className="service-list">
                {p.services.slice(0, 16).map((s, i) => (
                  <span className="tag" key={i}>
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}

          {gallery.length > 1 && (
            <>
              <h3>Gallery</h3>
              <div className="gallery">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    className="gallery__item"
                    onClick={() => setLightbox(i)}
                    aria-label={`View image ${i + 1} larger`}
                  >
                    <img src={src} alt={`${p.name} ${i + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            </>
          )}

          {(p.nearestAirport || p.nearestStation) && (
            <>
              <h3>Getting there</h3>
              <div className="getting-there">
                {p.nearestAirport && (
                  <div>
                    <PlaneIcon style={{ width: 14, height: 14, verticalAlign: "-2px", color: "var(--brass)" }} />{" "}
                    <span>Airport</span> {p.nearestAirport}
                  </div>
                )}
                {p.nearestStation && (
                  <div>
                    <TrainIcon style={{ width: 14, height: 14, verticalAlign: "-2px", color: "var(--brass)" }} />{" "}
                    <span>Station</span> {p.nearestStation}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="detail__cta">
            {p.website && (
              <a className="btn btn--primary" href={p.website} target="_blank" rel="noreferrer">
                Visit hotel
              </a>
            )}
            <a className="btn btn--ghost" href={p.rcUrl} target="_blank" rel="noreferrer">
              <CrownIcon style={{ width: 14, height: 14, verticalAlign: "-2px" }} /> On R&amp;C
            </a>
          </div>
        </div>
      </div>
    </aside>
    {lightbox !== null && (
      <Lightbox
        images={gallery}
        index={lightbox}
        alt={p.name}
        onIndex={setLightbox}
        onClose={() => setLightbox(null)}
      />
    )}
    </>
  );
}
