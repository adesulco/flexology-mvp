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
    <div className="flex justify-center bg-gray-100 min-h-screen font-sans w-full">
      <div className="w-full max-w-[480px] bg-white min-h-screen relative shadow-2xl flex flex-col border-x border-flx-border">
        <main className="flex-1 pb-32">
          {children}
        </main>
        {isActiveUser && <Navigation />}
      </div>
    </div>
  );
}
