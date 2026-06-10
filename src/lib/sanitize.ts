import DOMPurify from "isomorphic-dompurify";

/**
 * Tag & atribut yang diizinkan untuk konten "tulisan" (Suara Alumni,
 * Profil Alumni Pilihan, Info) yang dibuat lewat rich text editor.
 * Daftar ini sengaja dibatasi agar aman dari XSS namun tetap mendukung
 * format dasar ala Notion/Medium: heading, list, quote, link, gambar, dsb.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "img",
  "hr",
  "code",
  "pre",
  "span",
];

const ALLOWED_ATTR = ["href", "src", "alt", "title", "target", "rel", "class"];

/**
 * Membersihkan HTML hasil rich text editor sebelum disimpan ke database
 * maupun sebelum dirender ke halaman publik (defense in depth).
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";

  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });

  // Pastikan link eksternal tidak bisa digunakan untuk tabnabbing
  return clean.replace(
    /<a\s+([^>]*?)href=/gi,
    '<a target="_blank" rel="noopener noreferrer nofollow" $1href='
  );
}

/**
 * Cek apakah string HTML kosong secara visual (tidak ada teks/gambar).
 * Berguna untuk validasi "konten wajib diisi" pada editor rich text,
 * karena editor kosong tetap menghasilkan markup seperti "<p></p>".
 */
export function isHtmlEmpty(html: string): boolean {
  if (!html) return true;
  const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim();
  if (text.length > 0) return false;
  // Konten visual non-teks (gambar) tetap dianggap tidak kosong
  return !/<img\b/i.test(html);
}
