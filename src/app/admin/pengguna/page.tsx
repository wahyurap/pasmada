"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  nama: string;
  email: string;
  role: "ADMIN" | "ALUMNI";
  emailVerified: string | null;
  createdAt: string;
}

interface ApiResponse {
  data: User[];
  meta: { total: number; page: number; totalPages: number };
}

export default function PenggunaPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(q); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [q]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: debouncedQ, page: String(page) });
      const res = await fetch(`/api/admin/users?${params}`);
      const json: ApiResponse = await res.json();
      setUsers(json.data);
      setTotal(json.meta.total);
      setTotalPages(json.meta.totalPages);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const doAction = async (id: string, body: object) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, true);
        fetchUsers();
      } else {
        showToast(data.error || "Gagal", false);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const doDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus pengguna "${nama}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, true);
        fetchUsers();
      } else {
        showToast(data.error || "Gagal", false);
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.ok ? "bg-green-600" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <p className="text-gray-500 mt-1">Kelola akun pengguna, verifikasi email, dan atur role.</p>
      </div>

      {/* Search + Stats */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#991B1B]"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-4 py-2.5">
          Total: <span className="font-semibold text-gray-900">{total}</span> pengguna
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Pengguna</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Status Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Daftar</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isLoading = actionLoading === user.id;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{user.nama}</div>
                        <div className="text-gray-500 text-xs">{user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        {user.emailVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            Terverifikasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Belum Diverifikasi
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-[#991B1B]/10 text-[#991B1B]"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {!user.emailVerified && (
                            <button
                              onClick={() => doAction(user.id, { action: "verify" })}
                              disabled={isLoading}
                              className="px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
                              title="Verifikasi email secara manual"
                            >
                              {isLoading ? "..." : "✓ Verifikasi"}
                            </button>
                          )}
                          {user.role === "ALUMNI" ? (
                            <button
                              onClick={() => doAction(user.id, { action: "set_role", role: "ADMIN" })}
                              disabled={isLoading}
                              className="px-2.5 py-1.5 text-xs font-medium text-[#991B1B] bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                            >
                              Jadikan Admin
                            </button>
                          ) : (
                            <button
                              onClick={() => doAction(user.id, { action: "set_role", role: "ALUMNI" })}
                              disabled={isLoading}
                              className="px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                            >
                              Jadikan Alumni
                            </button>
                          )}
                          <button
                            onClick={() => doDelete(user.id, user.nama)}
                            disabled={isLoading}
                            className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Halaman <span className="font-semibold">{page}</span> dari <span className="font-semibold">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white disabled:opacity-40 hover:bg-gray-50 transition"
              >
                ← Sebelumnya
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
