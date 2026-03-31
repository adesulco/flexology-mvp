export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`border-[3px] border-[#1A1A1A] bg-white flex flex-col justify-between p-1.5 aspect-square relative ${className}`}>
      <div className="absolute top-1 right-2 text-[#1A1A1A] font-medium text-[10px] leading-none">
        55
      </div>
      <div className="flex-1 flex items-center justify-center mt-2 mb-1">
        <span className="text-[#1A1A1A] font-black tracking-tighter text-4xl leading-none" style={{ transform: 'scaleY(1.1)' }}>
          Flx
        </span>
      </div>
      <div className="text-[#1A1A1A] text-[7px] font-medium tracking-[0.3em] text-center uppercase pb-0.5">
        Flexology
      </div>
    </div>
  );
}
