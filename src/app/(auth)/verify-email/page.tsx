"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak ditemukan.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email berhasil diverifikasi!");
        } else {
          setStatus("error");
          setMessage(
            data.error ||
              "Gagal memverifikasi email. Token mungkin sudah kadaluarsa."
          );
        }
      } catch {
        setStatus("error");
        setMessage("Terjadi kesalahan. Silakan coba lagi.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      {status === "loading" && (
        <>
          <div className="w-16 h-16 border-4 border-[#1e40af] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Memverifikasi Email...
          </h2>
          <p className="text-gray-600">Mohon tunggu sebentar.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
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
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Verifikasi Berhasil!
          </h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            href="/login"
            className="inline-block bg-[#1e40af] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#1e3a8a] transition"
          >
            Masuk ke Akun
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Verifikasi Gagal
          </h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link
            href="/login"
            className="inline-block bg-[#1e40af] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#1e3a8a] transition"
          >
            Ke Halaman Masuk
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl shadow-lg p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e40af]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
