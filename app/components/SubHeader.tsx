export default function SubHeader() {
  return (
    <div className="bg-plai py-4">
      <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-6">
        {/* Icon mirroring the CD symbol from the real site */}
        <div className="shrink-0 opacity-90">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="18" r="11" stroke="white" strokeWidth="2.5" fill="none"/>
            <circle cx="12" cy="18" r="5" stroke="white" strokeWidth="2.5" fill="none"/>
            <circle cx="24" cy="18" r="11" stroke="white" strokeWidth="2.5" fill="none"/>
            <circle cx="24" cy="18" r="5" stroke="white" strokeWidth="2.5" fill="none"/>
          </svg>
        </div>
        <div>
          <p className="mb-[0.15rem] text-[0.85rem] font-medium text-white/85">Aprender</p>
          <p className="text-[0.9rem] font-bold text-white">Las competencias del futuro y desarrollar el talento</p>
        </div>
      </div>
    </div>
  );
}
