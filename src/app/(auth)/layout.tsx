export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center">
        <img src="/logo.png" alt="PASMADA" className="h-16 w-auto mx-auto" />
        <h1 className="text-2xl font-bold text-[#991B1B] mt-2">PASMADA</h1>
        <p className="text-sm text-gray-500 mt-1">
          Parsadaan Alumni SMAN Sada
        </p>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
