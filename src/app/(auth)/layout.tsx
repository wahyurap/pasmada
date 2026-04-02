export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#991B1B] via-[#7F1D1D] to-[#450A0A] batak-pattern flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center">
        <img src="/logo.png" alt="PASMADA" className="h-20 w-auto mx-auto drop-shadow-lg" />
        <h1 className="text-2xl font-bold text-white mt-2">PASMADA</h1>
        <p className="text-sm text-red-200 mt-1">
          Parsadaan Alumni SMAN Sada
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
