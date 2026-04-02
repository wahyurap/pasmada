"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalAlumni: number;
  totalBerita: number;
  totalAgenda: number;
  totalAlbums: number;
}

interface Berita {
  id: string;
  judul: string;
  penulis: string;
  published: boolean;
  createdAt: string;
}

interface Agenda {
  id: string;
  judul: string;
  tanggal: string;
  lokasi: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBerita, setRecentBerita] = useState<Berita[]>([]);
  const [recentAgenda, setRecentAgenda] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, beritaRes, agendaRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/berita?limit=5"),
          fetch("/api/agenda?limit=3"),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
        if (beritaRes.ok) {
          const data = await beritaRes.json();
          setRecentBerita(data.data || []);
        }
        if (agendaRes.ok) {
          const data = await agendaRes.json();
          setRecentAgenda(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statCards = [
    {
      label: "Total Alumni",
      value: stats?.totalAlumni ?? 0,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "bg-blue-50 text-[#1e40af]",
    },
    {
      label: "Total Berita",
      value: stats?.totalBerita ?? 0,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      color: "bg-green-50 text-green-700",
    },
    {
      label: "Total Agenda",
      value: stats?.totalAgenda ?? 0,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-orange-50 text-orange-700",
    },
    {
      label: "Total Album Galeri",
      value: stats?.totalAlbums ?? 0,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-purple-50 text-purple-700",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e40af]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Selamat datang di panel admin PASMADA</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${card.color}`}>{card.icon}</div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Berita */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Berita Terbaru</h3>
          {recentBerita.length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada berita</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-3 font-medium text-gray-500">Judul</th>
                    <th className="text-left pb-3 font-medium text-gray-500">Penulis</th>
                    <th className="text-left pb-3 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBerita.map((b) => (
                    <tr key={b.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 pr-4 font-medium text-gray-800 truncate max-w-[160px]">
                        {b.judul}
                      </td>
                      <td className="py-3 pr-4 text-gray-500">{b.penulis}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            b.published
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {b.published ? "Published" : "Draft"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Agenda */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agenda Mendatang</h3>
          {recentAgenda.length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada agenda</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-3 font-medium text-gray-500">Judul</th>
                    <th className="text-left pb-3 font-medium text-gray-500">Tanggal</th>
                    <th className="text-left pb-3 font-medium text-gray-500">Lokasi</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAgenda.map((a) => (
                    <tr key={a.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 pr-4 font-medium text-gray-800 truncate max-w-[140px]">
                        {a.judul}
                      </td>
                      <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                        {new Date(a.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 text-gray-500 truncate max-w-[120px]">
                        {a.lokasi}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
