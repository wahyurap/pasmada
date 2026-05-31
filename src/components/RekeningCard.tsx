"use client";

import { useState } from "react";

const NOMOR_REKENING = "2075-01-000612-56-5";
const NOMOR_REKENING_RAW = "2075010006125655";

export default function RekeningCard() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(NOMOR_REKENING_RAW);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable; silently ignore
    }
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7F1D1D] via-[#991B1B] to-[#450A0A] shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D97706]/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D97706]/10 rounded-full translate-y-12 -translate-x-12" />

          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0 w-14 h-14 bg-[#D97706] rounded-xl flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2zM7 15h.01M11 15h2"
                />
              </svg>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <p className="text-[#D97706] text-xs font-semibold uppercase tracking-wider">
                Rekening Resmi PASMADA
              </p>
              <p className="mt-1 text-white text-sm">
                Bank BRI &middot; a.n.{" "}
                <span className="font-semibold">Perkumpulan PASMADA</span>
              </p>
              <p className="mt-2 font-mono text-xl sm:text-2xl font-bold text-white tracking-wider">
                {NOMOR_REKENING}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-[#D97706] hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition"
              aria-label="Salin nomor rekening"
            >
              {copied ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Tersalin
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Salin
                </>
              )}
            </button>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-gray-500">
          Dukungan donasi alumni untuk kegiatan PASMADA &middot; konfirmasi
          transfer ke pengurus
        </p>
      </div>
    </section>
  );
}
