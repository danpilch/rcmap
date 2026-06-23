import type { Property } from "../types";

interface Props {
  property: Property;
  active: boolean;
  onClick: () => void;
  onHover: (id: string | null) => void;
}

export function PropertyCard({ property: p, active, onClick, onHover }: Props) {
  const loc = [p.city, p.region].filter((v) => v && v !== p.country).join(", ");
  return (
    <button
      className={`card${active ? " card--active" : ""}`}
      onClick={onClick}
      onMouseEnter={() => onHover(p.id)}
      onMouseLeave={() => onHover(null)}
    >
      {p.heroImage && (
        <img className="card__thumb" src={p.heroImage} alt={p.name} loading="lazy" />
      )}
      <div className="card__body">
        <span className="card__region">{p.country}</span>
        <span className="card__name">{p.name}</span>
        <span className="card__loc">{loc}</span>
        <div className="card__tags">
          {p.restaurant && p.restaurant.stars > 0 && (
            <span className="tag tag--stars">
              {"★".repeat(p.restaurant.stars)} Michelin
            </span>
          )}
          {p.rooms && <span className="tag">{p.rooms} rooms</span>}
          {p.priceFromLabel && <span className="tag">from {p.priceFromLabel}</span>}
        </div>
      </div>
    </button>
  );
}
