import React from 'react';

export default function PrestamosPage() {
  const prestamos = [
    {
      id: "REQ-001",
      equipo: "Laptop HP ZBook",
      categoria: "Cómputo",
      fecha: "15 Oct 2026",
      estado: "Aprobado",
      icon: "💻"
    },
    {
      id: "REQ-002",
      equipo: "Visor Meta Quest 3",
      categoria: "Realidad Virtual",
      fecha: "18 Oct 2026",
      estado: "En revisión",
      icon: "🥽"
    },
    {
      id: "REQ-003",
      equipo: "Kit Arduino Mega",
      categoria: "Robótica",
      fecha: "02 Sep 2026",
      estado: "Devuelto",
      icon: "🤖"
    }
  ];

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-1 font-heading text-2xl font-extrabold text-[#162E50] md:text-3xl">Mis Préstamos</h1>
          <p className="text-sm text-gray-500 md:text-base">Historial y estado de tus solicitudes de equipo.</p>
        </div>
        <button className="btn rounded-lg border-none bg-[#E91E8C] px-6 font-semibold text-white shadow-[0_4px_10px_rgba(233,30,140,0.2)] transition-all hover:bg-[#c41876] hover:-translate-y-0.5">
          + Nueva Solicitud
        </button>
      </div>
      
      <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white shadow-sm">
        <table className="w-full min-w-[600px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Equipo / Dispositivo</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Fecha de Solicitud</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Estado</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {prestamos.map((prestamo) => (
              <tr key={prestamo.id} className="transition-colors hover:bg-gray-50/75">
                <td className="px-6 py-5 align-middle">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                      {prestamo.icon}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-gray-900">{prestamo.equipo}</h4>
                      <p className="text-xs text-gray-500">{prestamo.categoria} • {prestamo.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-gray-700 align-middle">{prestamo.fecha}</td>
                <td className="px-6 py-5 align-middle">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    prestamo.estado === 'Aprobado' ? 'bg-emerald-100 text-emerald-800' : 
                    prestamo.estado === 'En revisión' ? 'bg-amber-100 text-amber-800' : 
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {prestamo.estado}
                  </span>
                </td>
                <td className="px-6 py-5 align-middle">
                  <button className="rounded-md border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900">
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
