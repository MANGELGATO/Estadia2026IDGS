import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { mockApps } from '../../lib/mockData';

const platformIcon: Record<string, string> = {
  'Meta Quest': '🥽',
  'PC': '💻',
  'Meta Quest + PC': '🎮',
};

// Show only first 8 in the landing carousel
const PREVIEW_COUNT = 8;

export default function AppCarousel() {
  const preview = mockApps.slice(0, PREVIEW_COUNT);

  return (
    <div className="border-t border-dashed border-black/[0.08] bg-[#F4F6F9] py-12">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="mb-1 font-heading text-[1.4rem] font-extrabold text-navy">
              Catálogo de Software y Aplicaciones
            </h2>
            <p className="text-sm text-plai-muted">
              Juegos educativos e inmersivos para Meta Quest VR y PC disponibles en PLAi
            </p>
          </div>
          <Link
            href="/aplicaciones"
            className="mt-1 inline-flex shrink-0 items-center gap-[0.4rem] whitespace-nowrap font-heading text-[0.88rem] font-bold text-plai transition-all duration-[250ms] hover:gap-[0.6rem] hover:text-navy"
          >
            Ver catálogo completo <ArrowRight size={15} />
          </Link>
        </div>

        <div className="flex items-stretch gap-5 overflow-x-auto px-1 pb-5 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {preview.map((app) => (
            <div
              key={app.id}
              className="w-[260px] shrink-0 rounded-2xl border border-black/[0.08] bg-white transition-all duration-[250ms] hover:-translate-y-1 hover:border-[rgba(168,30,113,0.3)] hover:shadow-[0_10px_30px_rgba(27,54,93,0.08)]"
            >
              <div className="flex h-full flex-col gap-[0.9rem] p-5">
                <div className="flex size-[46px] items-center justify-center rounded-[10px] bg-[#F4F6F9]">
                  <span className="text-[1.6rem] leading-none">{app.iconUrl}</span>
                </div>
                <div className="flex flex-1 flex-col gap-[0.3rem]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-heading text-[0.65rem] font-extrabold uppercase tracking-[0.06em] text-plai">
                      {app.category}
                    </span>
                    <span className="font-heading text-[0.65rem] font-semibold text-plai-muted">
                      {platformIcon[app.platform]} {app.platform}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-extrabold leading-[1.2] text-navy">
                    {app.name}
                  </h3>
                  <p className="m-0 text-[0.75rem] text-plai-muted">{app.developer}</p>
                  <p className="flex-1 text-[0.8rem] leading-[1.5] text-plai-gray">{app.description}</p>
                  <span className="mt-auto inline-block w-fit rounded-full border border-black/[0.08] bg-[#F4F6F9] px-[0.6rem] py-[0.15rem] text-[0.7rem] font-semibold text-plai-muted">
                    👤 {app.ageRating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href="/aplicaciones"
            className="inline-flex items-center gap-2 rounded-full border-2 border-plai px-8 py-3 font-heading text-[0.9rem] font-bold text-plai transition-all duration-[250ms] hover:gap-3 hover:bg-plai hover:text-white"
          >
            Ver las {mockApps.length} aplicaciones disponibles <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
