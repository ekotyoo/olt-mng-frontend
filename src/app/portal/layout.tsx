import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buroq.net - Customer Portal",
  description: "Customer Self Service Portal",
};

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Simple Header */}
      <header className="bg-white border-b h-14 flex items-center px-4 justify-between sticky top-0 z-50">
        <div className="font-bold text-lg text-blue-600">Buroq.net</div>
        {/* Placeholder for Logout or User Menu */}
      </header>
      <main className="p-4 md:max-w-xl md:mx-auto">
        {children}
      </main>
    </div>
  );
}
