"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    errorParam === "CredentialsSignin"
      ? "Email atau password salah."
      : errorParam
        ? "Terjadi kesalahan. Silakan coba lagi."
        : ""
  );
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailNotVerified(false);
    setResendMsg("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("EMAIL_NOT_VERIFIED")) {
          setEmailNotVerified(true);
          setError("Email Anda belum diverifikasi. Silakan cek folder inbox atau spam.");
        } else {
          setError("Email atau password salah.");
        }
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMsg("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setResendMsg(data.message || data.error || "Gagal mengirim ulang.");
    } catch {
      setResendMsg("Gagal mengirim ulang. Coba lagi nanti.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Masuk
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
          {emailNotVerified && email && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="mb-2 text-red-600">Tidak menerima email verifikasi?</p>
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="w-full py-1.5 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] rounded-lg transition disabled:opacity-50"
              >
                {resendLoading ? "Mengirim..." : "Kirim Ulang Email Verifikasi"}
              </button>
              {resendMsg && (
                <p className="mt-2 text-xs text-green-700">{resendMsg}</p>
              )}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#991B1B] focus:border-transparent outline-none transition"
            placeholder="alamat@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#991B1B] focus:border-transparent outline-none transition"
            placeholder="Masukkan password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#991B1B] text-white py-2.5 rounded-lg font-medium hover:bg-[#7F1D1D] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Belum punya akun?{" "}
        <Link href="/register" className="text-[#991B1B] font-medium hover:underline">
          Daftar di sini
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl shadow-lg p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#991B1B]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
