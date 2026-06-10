import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

interface RichContentProps {
  html: string;
  className?: string;
}

/**
 * Menampilkan konten HTML hasil rich text editor (Suara Alumni, Profil
 * Alumni Pilihan, Info) dengan styling "prose" dan sanitasi tambahan
 * sebagai lapisan pertahanan kedua sebelum dirender ke browser.
 */
export default function RichContent({ html, className }: RichContentProps) {
  return (
    <div
      className={cn("prose prose-lg max-w-none text-gray-700", className)}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html || "") }}
    />
  );
}
