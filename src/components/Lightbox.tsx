import { useEffect, useCallback } from "react";

interface Props {
  images: string[];
  index: number;
  alt: string;
  onIndex: (i: number) => void;
  onClose: () => void;
}

export function Lightbox({ images, index, alt, onIndex, onClose }: Props) {
  const go = useCallback(
    (delta: number) => onIndex((index + delta + images.length) % images.length),
    [index, images.length, onIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const hi = images[index].replace(/\?.*$/, "?w=2000&h=1333");

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true">
      <button className="lightbox__close" aria-label="Close" onClick={onClose}>
        ✕
      </button>
      {images.length > 1 && (
        <button
          className="lightbox__nav lightbox__nav--prev"
          aria-label="Previous"
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
        >
          ‹
        </button>
      )}
      <img
        className="lightbox__img"
        src={hi}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
      />
      {images.length > 1 && (
        <>
          <button
            className="lightbox__nav lightbox__nav--next"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
          >
            ›
          </button>
          <div className="lightbox__count">
            {index + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
