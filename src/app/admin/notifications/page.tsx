"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  message: string;
  data: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotifData {
  userId: string;
  namaLengkap: string;
  email: string;
  tahunLulus: number;
  matches: string[];
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const res = await fetch("/api/admin/notifications");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function markRead(id: string) {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  async function markAllRead() {
    setMarkingAll(true);
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarkingAll(false);
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifikasi Admin</h2>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="px-4 py-2 text-sm font-medium text-[#991B1B] border border-[#991B1B] rounded-lg hover:bg-red-50 transition disabled:opacity-50"
          >
            {markingAll ? "Memproses..." : "Tandai semua dibaca"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Memuat...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Tidak ada notifikasi</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            let parsed: NotifData | null = null;
            try {
              if (notif.data) parsed = JSON.parse(notif.data);
            } catch {}

            return (
              <div
                key={notif.id}
                className={`bg-white rounded-xl border p-5 ${
                  notif.isRead ? "border-gray-100" : "border-yellow-300 bg-yellow-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          notif.type === "POTENTIAL_DUPLICATE"
                            ? "bg-orange-100 text-orange-700"
                            : notif.type === "NEW_REGISTRATION"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {notif.type === "POTENTIAL_DUPLICATE"
                          ? "Potensi Duplikat"
                          : notif.type === "NEW_REGISTRATION"
                          ? "Pendaftar Baru"
                          : notif.type}
                      </span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                      )}
                    </div>

                    <p className="text-sm text-gray-800 font-medium mb-2">
                      {notif.message}
                    </p>

                    {parsed?.matches && parsed.matches.length > 0 && (
                      <ul className="text-sm text-gray-600 space-y-1 mb-3">
                        {parsed.matches.map((m, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">⚠</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {parsed?.userId && (
                      <Link
                        href={`/admin/pengguna`}
                        className="text-xs text-[#991B1B] hover:underline"
                      >
                        Lihat di Manajemen Pengguna →
                      </Link>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notif.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => markRead(notif.id)}
                      className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
