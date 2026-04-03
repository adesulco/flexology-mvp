import PosLoginClient from "./PosLoginClient";

export default function PosLoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-flx-teal selection:text-black relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-flx-teal/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <PosLoginClient />
        </div>
    </div>
  );
}
