import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import * as XLSX from "xlsx";

function isAdmin(session: { user?: { role?: string } } | null) {
  return session?.user?.role === "ADMIN";
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!["xlsx", "xls"].includes(ext ?? "")) {
    return NextResponse.json({ error: "Format file harus .xlsx atau .xls" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  if (rows.length === 0) {
    return NextResponse.json({ error: "File Excel kosong" }, { status: 400 });
  }

  // Normalize column names (case-insensitive, trim whitespace)
  function getField(row: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
      for (const col of Object.keys(row)) {
        if (col.trim().toLowerCase() === key.toLowerCase()) {
          return String(row[col] ?? "").trim();
        }
      }
    }
    return "";
  }

  const data: { namaLengkap: string; tahunLulus: number; noHp: string | null; pekerjaan: string | null }[] = [];
  const skipped: number[] = [];

  rows.forEach((row, i) => {
    const namaLengkap = getField(row, "namalengkap", "nama lengkap", "nama_lengkap", "nama");
    const tahunStr = getField(row, "tahunlulus", "tahun lulus", "tahun_lulus", "tahun", "angkatan");
    const tahunLulus = parseInt(tahunStr);
    const noHp = getField(row, "nohp", "no hp", "no_hp", "nomor hp", "telepon", "hp") || null;
    const pekerjaan = getField(row, "pekerjaan", "profesi", "jabatan", "pekerjaan saat ini") || null;

    if (!namaLengkap || isNaN(tahunLulus) || tahunLulus < 1960 || tahunLulus > new Date().getFullYear()) {
      skipped.push(i + 2); // Excel row number (1-indexed + header)
      return;
    }

    data.push({ namaLengkap, tahunLulus, noHp, pekerjaan });
  });

  const result = await prisma.alumniImport.createMany({
    data,
    skipDuplicates: true,
  });

  return NextResponse.json({
    inserted: result.count,
    skipped: skipped.length,
    skippedRows: skipped.slice(0, 10),
    total: rows.length,
  });
}
