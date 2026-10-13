export default function AgendaPage() {
  const cursos = [
    {
      id: "CUR-101",
      titulo: "Fabricación Digital Básica",
      fecha: "15 de Noviembre, 2026",
      hora: "10:00 AM - 14:00 PM",
      lugar: "Laboratorio PLAi Central",
      asistentes: 25,
      estado: "Confirmado",
      icon: "🖨️"
    },
    {
      id: "CUR-102",
      titulo: "Introducción a la Robótica",
      fecha: "22 de Noviembre, 2026",
      hora: "09:00 AM - 13:00 PM",
      lugar: "Aula Maker",
      asistentes: 30,
      estado: "Confirmado",
      icon: "🤖"
    }
  ];

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-2 font-heading text-3xl font-extrabold text-navy md:text-[2.2rem]">Mi Agenda</h1>
          <p className="text-base text-plai-muted md:text-[1.1rem]">Revisa los cursos que tienes agendados como institución.</p>
        </div>
        <button className="cursor-pointer rounded-lg bg-[#22C55E] px-6 py-3 font-heading font-semibold text-white shadow-[0_4px_10px_rgba(34,197,94,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[#16a34a]">
          + Agendar Curso
        </button>
      </div>

      <div className="relative flex flex-col gap-6 before:absolute before:bottom-0 before:left-5 before:top-0 before:w-0.5 before:bg-gray-200 before:content-['']">
        {cursos.map((curso) => (
          <div key={curso.id} className="relative flex gap-6">
            <div className="z-10 flex size-[42px] shrink-0 items-center justify-center rounded-full border-2 border-[#F59E0B] bg-white text-xl shadow-[0_0_0_4px_#F4F6F9]">
              {curso.icon}
            </div>
            <div className="flex-1 rounded-xl border border-black/[0.08] bg-white p-6 shadow-plai-sm transition-all duration-200 hover:translate-x-1 hover:shadow-plai-md">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="mb-1 font-heading text-lg font-bold text-navy">{curso.titulo}</h3>
                  <span className="text-xs text-plai-muted">ID: {curso.id}</span>
                </div>
                <span className="rounded-full bg-[#fef3c7] px-3 py-1 font-heading text-xs font-semibold text-[#F59E0B]">{curso.fecha}</span>
              </div>
              
              <div className="flex flex-col gap-2 text-[0.95rem] text-plai-gray">
                <div className="flex items-center gap-2">
                  <span>🕒</span> {curso.hora}
                </div>
                <div className="flex items-center gap-2">
                  <span>📍</span> {curso.lugar}
                </div>
                <div className="flex items-center gap-2">
                  <span>👥</span> {curso.asistentes} asistentes registrados
                </div>
              </div>

              <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
                <button className="cursor-pointer rounded-md border border-gray-200 bg-transparent px-4 py-2 font-heading text-xs font-medium text-plai-gray transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-navy">
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
