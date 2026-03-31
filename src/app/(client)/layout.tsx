import { Navigation } from "@/components/Navigation";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full w-full flex justify-center bg-gray-100 min-h-screen">
      <div className="w-full max-w-[480px] h-screen bg-flx-dark text-flx-text relative shadow-2xl flex flex-col border-x border-flx-border">
        <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          {children}
        </main>
        <Navigation />
      </div>
    </div>
  );
}
