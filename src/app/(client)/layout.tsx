import { getSession } from "@/lib/auth";
import { Navigation } from "@/components/Navigation";
import { prisma } from "@/lib/prisma";

export default async function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  
  // Hard DB Validation: Ensure ghost tokens don't render navigation
  let isActiveUser = false;
  if (session?.userId) {
      const userExists = await prisma.user.findUnique({ where: { id: session.userId as string }, select: { id: true } });
      if (userExists) isActiveUser = true;
  }

  return (
    <div className="flex justify-center bg-gray-100 h-[100dvh] font-sans w-full overflow-hidden">
      <div className="w-full max-w-[480px] bg-white h-[100dvh] flex flex-col shadow-2xl border-x border-flx-border relative">
        <main className="flex-1 overflow-y-auto w-full scroll-smooth scrollbar-hide relative pb-10">
          {children}
        </main>
        {isActiveUser && (
           <div className="w-full bg-white z-50 border-t border-flx-border relative top-0">
             <Navigation />
           </div>
        )}
      </div>
    </div>
  );
}
