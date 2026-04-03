"use client";

import { useState, useEffect, useCallback } from "react";

export default function HeroSlideshow({ photos }: { photos: string[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [photos.length, next]);

  if (!photos.length) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${current * (100 / photos.length)}%)`,
          width: `${photos.length * 100}%`,
        }}
      >
        {photos.map((url, i) => (
          <div
            key={i}
            className="relative flex-shrink-0 h-full"
            style={{ width: `${100 / photos.length}%` }}
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      {/* Dark red overlay agar teks tetap terbaca */}
      <div className="absolute inset-0 bg-[#7F1D1D]/80" />
      {/* Batak pattern overlay */}
      <div className="absolute inset-0 batak-pattern" />

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "bg-[#D97706] w-4" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
