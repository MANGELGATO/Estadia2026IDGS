"use client";

import React, { useState, useEffect } from 'react';
import StatCard from '../../components/admin/StatCard';
import {
  RiComputerLine, RiAppsLine, RiCalendarCheckLine,
  RiToolsLine, RiUserLine, RiAlertLine, RiFileExcel2Line, RiPrinterLine
} from 'react-icons/ri';
import { DeviceItem } from '../../../lib/mockData';
import { BitacoraItem, ReservacionItem, IncidenciaItem } from '../../../lib/db';

export default function ReportesPage() {
  const [equipos, setEquipos] = useState<DeviceItem[]>([]);
  const [bitacora, setBitacora] = useState<BitacoraItem[]>([]);
  const [reservaciones, setReservaciones] = useState<ReservacionItem[]>([]);
  const [incidencias, setIncidencias] = useState<IncidenciaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/equipos').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/bitacora').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/reservaciones').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/mantenimiento').then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([eq, bit, res, inc]) => {
      if (eq.data) setEquipos(eq.data);
      if (bit.data) setBitacora(bit.data);
      if (res.data) setReservaciones(res.data);
      if (inc.data) setIncidencias(inc.data);
      setLoading(false);
    });
  }, []);

  const totalEquipos = equipos.length;
  const disponibles = equipos.filter(e => e.status === 'Disponible').length;
  const enMantenimiento = equipos.filter(e => e.status === 'En mantenimiento').length;
  const enUso = equipos.filter(e => e.status === 'En uso' || e.status === 'Reservado').length;

  const normalizeStr = (s?: string) =>
    (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/-/g, ' ').trim();

  // Categorías calculadas dinámicamente con datos 100% reales
  const categoryNames = ['Realidad Virtual', 'Robótica', 'Fabricación digital', 'Drones', 'Cómputo'];
  const categoriasCalculadas = categoryNames.map(cat => {
    const catNorm = normalizeStr(cat);
    const totalCat = equipos.filter(e => normalizeStr(e.category) === catNorm).length;
    const activosCat = equipos.filter(e => normalizeStr(e.category) === catNorm && e.status === 'Disponible').length;
    const reservs = reservaciones.filter(r => {
      const rNorm = normalizeStr(r.categoriaId);
      return rNorm.includes(catNorm) || (catNorm !== '' && catNorm.includes(rNorm));
    }).length;
    return {
      nombre: cat,
      equipos: totalCat,
      activos: activosCat,
      reservaciones: reservs,
    };
  });

  // Exportar Excel (CSV con UTF-8 BOM)
  const handleExportExcel = () => {
    const today = new Date().toISOString().split('T')[0];
    let csvContent = '\uFEFF'; // BOM para compatibilidad con acentos y caracteres especiales en Excel

    // Header institucional
    csvContent += 'REPORTE GENERAL DE INVENTARIO Y RECURSOS TECNOLÓGICOS - PLAi JALISCO\r\n';
    csvContent += `Fecha de generación: ${new Date().toLocaleString('es-MX')}\r\n`;
    csvContent += 'Ciudad Creativa Digital, Guadalajara, Jalisco\r\n\r\n';

    // Sección 1: Resumen
    csvContent += 'RESUMEN EJECUTIVO\r\n';
    csvContent += `Total de Equipos Registrados,${totalEquipos}\r\n`;
    csvContent += `Equipos Disponibles,${disponibles}\r\n`;
    csvContent += `Equipos en Mantenimiento,${enMantenimiento}\r\n`;
    csvContent += `Equipos en Préstamo Activo,${enUso}\r\n`;
    csvContent += `Total Préstamos en Bitácora,${bitacora.length}\r\n`;
    csvContent += `Total Incidencias Reportadas,${incidencias.length}\r\n\r\n`;

    // Sección 2: Detalle de Equipos
    csvContent += 'DETALLE DE EQUIPOS E INVENTARIO PATRIMONIAL\r\n';
    csvContent += 'Código PLAi,Nombre,Categoría,Marca,Modelo,Estado,Ubicación,Responsable\r\n';
    equipos.forEach(eq => {
      const row = [
        `"${eq.inventoryNumber}"`,
        `"${eq.name.replace(/"/g, '""')}"`,
        `"${eq.category}"`,
        `"${eq.brand}"`,
        `"${eq.model}"`,
        `"${eq.status}"`,
        `"${eq.location || 'Laboratorio PLAi'}"`,
        `"${eq.responsible || 'Coordinación PLAi'}"`,
      ].join(',');
      csvContent += row + '\r\n';
    });
    csvContent += '\r\n';

    // Sección 3: Bitácora de Préstamos
    csvContent += 'HISTÓRICO DE PRÉSTAMOS (BITÁCORA DE USO)\r\n';
    csvContent += 'ID / Registro,Código PLAi,Dispositivo,Usuario,Dependencia / Institución,Fecha Entrega,Fecha Devolución Estimada,Estado,Condición Devolución\r\n';
    bitacora.forEach(b => {
      const row = [
        `"${b.id}"`,
        `"${b.codigoPlai}"`,
        `"${b.equipoNombre}"`,
        `"${b.usuarioNombre}"`,
        `"${b.usuarioDependencia || 'Particular'}"`,
        `"${b.fechaEntrega}"`,
        `"${b.fechaDevolucionEstimada}"`,
        `"${b.estadoPrestamo}"`,
        `"${b.condicionDevolucion || 'En préstamo activo'}"`,
      ].join(',');
      csvContent += row + '\r\n';
    });
    csvContent += '\r\n';

    // Sección 4: Reservaciones
    csvContent += 'HISTÓRICO DE SOLICITUDES Y RESERVACIONES\r\n';
    csvContent += 'Folio,Solicitante,Correo,Institución,Categoría,Código Asignado,Fecha Uso,Horario,Estado,Actividad\r\n';
    reservaciones.forEach(r => {
      const row = [
        `"${r.folio || r.id}"`,
        `"${(r.usuarioNombre || '').replace(/"/g, '""')}"`,
        `"${r.usuarioEmail || ''}"`,
        `"${(r.usuarioInstitucion || 'Particular').replace(/"/g, '""')}"`,
        `"${r.categoriaId || ''}"`,
        `"${r.codigoPlaiAsignado || 'Por asignar'}"`,
        `"${r.fechaUso || ''}"`,
        `"${r.horaInicio || ''} - ${r.horaFin || ''}"`,
        `"${r.estado || ''}"`,
        `"${(r.actividad || '').replace(/"/g, '""')}"`,
      ].join(',');
      csvContent += row + '\r\n';
    });
    csvContent += '\r\n';

    // Sección 5: Mantenimiento e Incidencias
    csvContent += 'HISTÓRICO DE INCIDENCIAS Y MANTENIMIENTO\r\n';
    csvContent += 'Folio,Código PLAi,Equipo,Falla,Severidad,Estado,Técnico Responsable,Fecha Reporte\r\n';
    incidencias.forEach(i => {
      const row = [
        `"${i.folio}"`,
        `"${i.codigoPlai}"`,
        `"${i.equipoNombre}"`,
        `"${i.tipoFalla}"`,
        `"${i.severidad}"`,
        `"${i.estado}"`,
        `"${i.tecnicoResponsable}"`,
        `"${String(i.fechaReporte).split('T')[0]}"`,
      ].join(',');
      csvContent += row + '\r\n';
    });

    // Disparar descarga en el navegador
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_Inventario_PLAi_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Exportar PDF mediante Vista de Impresión Oficial
  const handleExportPDF = () => {
    window.print();
  };

  const safeTotal = totalEquipos || 1;

  return (
    <div className="flex animate-pop-in flex-col gap-8 print:p-0">
      {/* Botones y Header Superior */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">Reportes y Estadísticas</h1>
          <p className="text-sm text-plai-muted md:text-base">Métricas del inventario, uso de recursos y actividad del sistema PLAi</p>
        </div>
        <div className="flex gap-3 print:hidden">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 cursor-pointer rounded-lg bg-[#ed8d1b] px-4 py-2 font-heading text-xs font-semibold text-white shadow-plai-sm transition-all hover:-translate-y-0.5 hover:bg-[#d67a10] hover:shadow-plai-md"
          >
            <RiPrinterLine className="text-base text-white" /> Exportar PDF / Imprimir
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 cursor-pointer rounded-lg bg-[#ed8d1b] px-4 py-2 font-heading text-xs font-semibold text-white shadow-plai-sm transition-all hover:-translate-y-0.5 hover:bg-[#d67a10] hover:shadow-plai-md"
          >
            <RiFileExcel2Line className="text-base text-white" /> Exportar a Excel (.CSV)
          </button>
        </div>
      </div>

      {/* Cabecera institucional visible solo al imprimir en PDF */}
      <div className="hidden print:block border-b-2 border-navy pb-4 mb-4">
        <h2 className="text-2xl font-black text-navy uppercase">Plataforma Abierta de Innovación y Desarrollo (PLAi)</h2>
        <p className="text-xs text-gray-600">Gobierno del Estado de Jalisco · Ciudad Creativa Digital, Guadalajara</p>
        <p className="text-xs text-gray-500 font-mono mt-1">Reporte Oficial de Recursos Tecnológicos · Generado: {new Date().toLocaleString('es-MX')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
        <StatCard title="Total Equipos"        value={totalEquipos}    icon={<RiComputerLine />}      variant="primary" />
        <StatCard title="Equipos Disponibles"  value={disponibles}     icon={<RiComputerLine />}      variant="success" />
        <StatCard title="En Mantenimiento"     value={enMantenimiento} icon={<RiToolsLine />}         variant="warning" />
        <StatCard title="En Uso / Préstamo"    value={enUso}           icon={<RiAppsLine />}          variant="primary" />
        <StatCard title="Reservaciones"        value={reservaciones.length} icon={<RiCalendarCheckLine />} variant="success" />
        <StatCard title="Préstamos Bitácora"   value={bitacora.length}  icon={<RiUserLine />}          variant="primary" />
        <StatCard title="Incidencias Abiertas" value={incidencias.filter(i => i.estado !== 'Resuelta').length} icon={<RiAlertLine />} variant="danger" />
        <StatCard title="Solventadas"          value={incidencias.filter(i => i.estado === 'Resuelta').length} icon={<RiAlertLine />} variant="success" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 print:grid-cols-2">
        {/* Distribución general */}
        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-plai-sm">
          <h3 className="mb-1 font-heading text-base font-bold text-navy">Distribución del Inventario</h3>
          <p className="mb-4 text-xs text-plai-muted">Estado actual de operatividad ({totalEquipos} activos)</p>
          <div className="my-4 flex justify-center">
            <div className="relative flex size-[140px] items-center justify-center rounded-full" style={{
              background: `conic-gradient(
                #059669 0% ${(disponibles / safeTotal) * 100}%,
                #D97706 ${(disponibles / safeTotal) * 100}% ${((disponibles + enMantenimiento) / safeTotal) * 100}%,
                #1e5ca7 ${((disponibles + enMantenimiento) / safeTotal) * 100}% 100%
              )`
            }}>
              <div className="flex size-[90px] flex-col items-center justify-center rounded-full bg-white">
                <span className="font-heading text-2xl font-extrabold leading-none text-navy">{totalEquipos}</span>
                <span className="mt-0.5 text-[10px] text-plai-muted">Activos</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="size-2.5 shrink-0 rounded-full bg-[#059669]" />
              <span className="flex-1 text-gray-600">Disponibles</span>
              <span className="font-bold text-navy">{disponibles}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <span className="size-2.5 shrink-0 rounded-full bg-[#D97706]" />
              <span className="flex-1 text-gray-600">En Mantenimiento</span>
              <span className="font-bold text-navy">{enMantenimiento}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <span className="size-2.5 shrink-0 rounded-full bg-[#1e5ca7]" />
              <span className="flex-1 text-gray-600">En Préstamo / Uso</span>
              <span className="font-bold text-navy">{enUso}</span>
            </div>
          </div>
        </div>

        {/* Resumen de actividad */}
        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-plai-sm">
          <h3 className="mb-1 font-heading text-base font-bold text-navy">Préstamos y Reservas Recientes</h3>
          <p className="mb-4 text-xs text-plai-muted">Monitoreo del flujo de laboratorios</p>
          <div className="flex flex-col gap-3">
            {bitacora.slice(0, 5).map(b => (
              <div key={b.id} className="flex items-center justify-between border-b border-gray-100 pb-2 text-xs">
                <div>
                  <div className="font-semibold text-navy">{b.equipoNombre}</div>
                  <div className="text-gray-500">{b.usuarioNombre} · {b.fechaEntrega.split(' ')[0]}</div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  b.estadoPrestamo === 'Activo' ? 'bg-amber-100 text-amber-800' :
                  b.estadoPrestamo === 'Con Incidencia' ? 'bg-rose-100 text-rose-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {b.estadoPrestamo}
                </span>
              </div>
            ))}
            {bitacora.length === 0 && (
              <p className="text-xs text-gray-500 italic">No hay registros de bitácora recientes.</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabla por categoría */}
      <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white p-6 shadow-plai-sm">
        <h3 className="mb-2 font-heading text-base font-bold text-navy">Desglose de Inventario por Categoría</h3>
        <table className="mt-4 w-full min-w-[600px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-gray-100">
              <th className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Categoría</th>
              <th className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Total Equipos</th>
              <th className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Disponibles</th>
              <th className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Tasa de Operatividad</th>
              <th className="px-4 py-3 font-heading text-xs font-bold uppercase tracking-wider text-plai-muted">Reservaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categoriasCalculadas.map(c => {
              const pct = c.equipos > 0 ? Math.round((c.activos / c.equipos) * 100) : 100;
              return (
                <tr key={c.nombre} className="transition-colors hover:bg-gray-50/75">
                  <td className="px-4 py-3.5 font-semibold text-navy">{c.nombre}</td>
                  <td className="px-4 py-3.5 text-gray-700">{c.equipos}</td>
                  <td className="px-4 py-3.5 text-gray-700">{c.activos}</td>
                  <td className="px-4 py-3.5">
                    <div className="mb-1 h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 80 ? '#059669' : pct > 50 ? '#D97706' : '#DC2626' }} />
                    </div>
                    <span className="text-xs text-plai-muted">{pct}%</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-700">{c.reservaciones}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
