"use client";

import React, { useState, useEffect } from 'react';
import { 
  RiHistoryLine, 
  RiAddCircleLine, 
  RiCheckboxCircleLine, 
  RiAlertLine, 
  RiSearchLine, 
  RiTimeLine, 
  RiUser3Line, 
  RiComputerLine, 
  RiCloseLine,
  RiCheckLine,
  RiArrowRightLine,
  RiFilter3Line,
  RiToolsLine
} from 'react-icons/ri';
import StatCard from '../../components/admin/StatCard';
import type { BitacoraItem, DeviceItem, ReservacionItem } from '../../../lib/db';

export default function BitacoraPage() {
  const [logs, setLogs] = useState<BitacoraItem[]>([]);
  const [equipos, setEquipos] = useState<DeviceItem[]>([]);
  const [reservaciones, setReservaciones] = useState<ReservacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Modales
  const [isEntregaModalOpen, setIsEntregaModalOpen] = useState(false);
  const [isDevolucionModalOpen, setIsDevolucionModalOpen] = useState(false);
  const [selectedLogForReturn, setSelectedLogForReturn] = useState<BitacoraItem | null>(null);

  // Formulario Entrega
  const [entregaReservaId, setEntregaReservaId] = useState('');
  const [entregaCodigoPlai, setEntregaCodigoPlai] = useState('');
  const [entregaUsuarioNombre, setEntregaUsuarioNombre] = useState('');
  const [entregaUsuarioEmail, setEntregaUsuarioEmail] = useState('');
  const [entregaUsuarioDependencia, setEntregaUsuarioDependencia] = useState('');
  const [entregaFecha, setEntregaFecha] = useState('');
  const [entregaFechaEstimada, setEntregaFechaEstimada] = useState('');
  const [entregaCondicion, setEntregaCondicion] = useState<'Excelente' | 'Bueno' | 'Regular'>('Excelente');
  const [entregaAccesorios, setEntregaAccesorios] = useState('Equipo completo con cables y accesorios estándar');
  const [entregaObservaciones, setEntregaObservaciones] = useState('');
  const [entregaAdmin, setEntregaAdmin] = useState('Administrador General PLAi');

  // Formulario Devolución
  const [devolucionFechaReal, setDevolucionFechaReal] = useState('');
  const [devolucionCondicion, setDevolucionCondicion] = useState<'Excelente' | 'Bueno' | 'Observación' | 'En revisión' | 'Dañado'>('Excelente');
  const [devolucionAccesorios, setDevolucionAccesorios] = useState('Todos los accesorios devueltos en orden');
  const [devolucionObservaciones, setDevolucionObservaciones] = useState('');
  const [devolucionIncidencia, setDevolucionIncidencia] = useState(false);
  const [devolucionDescripcionIncidencia, setDevolucionDescripcionIncidencia] = useState('');
  const [devolucionAdmin, setDevolucionAdmin] = useState('Administrador General PLAi');

  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bitRes, eqRes, resRes] = await Promise.all([
        fetch('/api/bitacora').then(r => r.json()),
        fetch('/api/equipos').then(r => r.json()),
        fetch('/api/reservaciones').then(r => r.json()).catch(() => ({ data: [] })),
      ]);

      if (bitRes.data) setLogs(bitRes.data);
      if (eqRes.data) setEquipos(eqRes.data);
      if (resRes.data) setReservaciones(resRes.data);
    } catch {
      setNotification({ text: 'Error al cargar registros de la bitácora', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEntregaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entregaCodigoPlai || !entregaUsuarioNombre || !entregaFecha || !entregaFechaEstimada) {
      setNotification({ text: 'Por favor completa los campos obligatorios de entrega.', type: 'error' });
      return;
    }

    try {
      const res = await fetch('/api/bitacora', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservaId: entregaReservaId || undefined,
          codigoPlai: entregaCodigoPlai,
          usuarioNombre: entregaUsuarioNombre,
          usuarioEmail: entregaUsuarioEmail,
          usuarioDependencia: entregaUsuarioDependencia,
          fechaEntrega: entregaFecha,
          fechaDevolucionEstimada: entregaFechaEstimada,
          condicionEntrega: entregaCondicion,
          accesoriosEntregados: entregaAccesorios,
          observacionesEntrega: entregaObservaciones,
          adminEntrega: entregaAdmin,
        })
      });

      const json = await res.json();
      if (json.success) {
        setNotification({
          text: 'Entrega registrada exitosamente en la bitácora. El equipo y su reservación pasaron a estado "En uso".',
          type: 'success',
        });
        setIsEntregaModalOpen(false);
        resetEntregaForm();
        fetchData();
      } else {
        setNotification({ text: json.message || 'Error al registrar entrega', type: 'error' });
      }
    } catch {
      setNotification({ text: 'Error de conexión al registrar entrega', type: 'error' });
    }
  };

  const handleDevolucionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLogForReturn || !devolucionFechaReal) return;

    try {
      const res = await fetch('/api/bitacora', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLogForReturn.id,
          fechaDevolucionReal: devolucionFechaReal,
          condicionDevolucion: devolucionCondicion,
          accesoriosDevueltos: devolucionAccesorios,
          observacionesDevolucion: devolucionObservaciones,
          incidenciaGenerada: devolucionIncidencia,
          descripcionIncidencia: devolucionDescripcionIncidencia,
          adminRecibe: devolucionAdmin,
        })
      });

      const json = await res.json();
      if (json.success) {
        setNotification({ 
          text: devolucionIncidencia 
            ? 'Devolución guardada, reservación marcada como Completada y se generó una incidencia técnica en Mantenimiento.' 
            : 'Devolución registrada exitosamente. Reservación completada y equipo disponible para préstamo.', 
          type: 'success' 
        });
        setIsDevolucionModalOpen(false);
        setSelectedLogForReturn(null);
        fetchData();
      } else {
        setNotification({ text: json.message || 'Error al registrar devolución', type: 'error' });
      }
    } catch {
      setNotification({ text: 'Error de conexión al registrar devolución', type: 'error' });
    }
  };

  const resetEntregaForm = () => {
    setEntregaReservaId('');
    setEntregaCodigoPlai('');
    setEntregaUsuarioNombre('');
    setEntregaUsuarioEmail('');
    setEntregaUsuarioDependencia('');
    setEntregaFecha('');
    setEntregaFechaEstimada('');
    setEntregaCondicion('Excelente');
    setEntregaAccesorios('Equipo completo con cables y accesorios estándar');
    setEntregaObservaciones('');
  };

  const openReturnModal = (log: BitacoraItem) => {
    setSelectedLogForReturn(log);
    const now = new Date().toISOString().slice(0, 16);
    setDevolucionFechaReal(now);
    setDevolucionCondicion('Excelente');
    setDevolucionAccesorios('Todos los accesorios devueltos en orden');
    setDevolucionObservaciones('');
    setDevolucionIncidencia(false);
    setDevolucionDescripcionIncidencia('');
    setIsDevolucionModalOpen(true);
  };

  // Filtrado
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.codigoPlai.toLowerCase().includes(search.toLowerCase()) ||
      log.equipoNombre.toLowerCase().includes(search.toLowerCase()) ||
      log.usuarioNombre.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'Todos' || log.estadoPrestamo === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRegistros = logs.length;
  const activos = logs.filter(l => l.estadoPrestamo === 'Activo').length;
  const devueltos = logs.filter(l => l.estadoPrestamo === 'Devuelto').length;
  const conIncidencia = logs.filter(l => l.estadoPrestamo === 'Con Incidencia').length;

  return (
    <div className="flex animate-pop-in flex-col gap-8 pb-16">
      {/* Encabezado */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">
            Bitácora de Uso y Préstamos
          </h1>
          <p className="text-sm text-plai-muted md:text-base">
            Control cronológico de entregas y devoluciones de dispositivos con verificación de condiciones y accesorios
          </p>
        </div>

        <button
          onClick={() => {
            const now = new Date().toISOString().slice(0, 16);
            setEntregaFecha(now);
            const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
            setEntregaFechaEstimada(tomorrow);
            setIsEntregaModalOpen(true);
          }}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-plai px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-plai-hover"
        >
          <RiAddCircleLine size={18} />
          <span>Registrar Salida / Entrega</span>
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="cursor-pointer text-gray-500 hover:text-black">
            <RiCloseLine size={18} />
          </button>
        </div>
      )}

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Registros" value={loading ? '...' : totalRegistros} icon={<RiHistoryLine />} variant="primary" />
        <StatCard title="Préstamos en Curso" value={loading ? '...' : activos} icon={<RiTimeLine />} variant="warning" />
        <StatCard title="Equipos Devueltos" value={loading ? '...' : devueltos} icon={<RiCheckboxCircleLine />} variant="success" />
        <StatCard title="Con Incidencias" value={loading ? '...' : conIncidencia} icon={<RiAlertLine />} variant="danger" />
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/[0.08] bg-white p-4 shadow-sm">
        <div className="relative min-w-[240px] flex-1">
          <RiSearchLine className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código PLAi, equipo o nombre de usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-navy focus:border-plai focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <RiFilter3Line className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-navy focus:border-plai focus:outline-none"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activos (En préstamo)</option>
            <option value="Devuelto">Devueltos</option>
            <option value="Con Incidencia">Con Incidencia</option>
          </select>
        </div>
      </div>

      {/* Tabla de la Bitácora */}
      <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50/80 text-xs font-bold uppercase tracking-wider text-navy">
              <tr>
                <th className="px-5 py-3.5">Código PLAi / Dispositivo</th>
                <th className="px-5 py-3.5">Usuario Responsable</th>
                <th className="px-5 py-3.5">Fecha Entrega</th>
                <th className="px-5 py-3.5">Devolución Estimada / Real</th>
                <th className="px-5 py-3.5">Condiciones y Accesorios</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-plai-muted">
                    No se encontraron registros de bitácora con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-heading font-bold text-navy">{log.codigoPlai}</span>
                      </div>
                      <span className="text-xs text-plai-muted block">{log.equipoNombre}</span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">{log.usuarioNombre}</div>
                      <div className="text-xs text-plai-muted">{log.usuarioEmail}</div>
                      {log.usuarioDependencia && (
                        <div className="text-[11px] text-gray-400">{log.usuarioDependencia}</div>
                      )}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-700">
                      <div>{log.fechaEntrega ? log.fechaEntrega.replace('T', ' ').slice(0, 16) : ''}</div>
                      <span className="text-[10px] text-gray-400">Entrega: {log.adminEntrega}</span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-xs">
                      <div className="text-gray-500">Est: {log.fechaDevolucionEstimada ? log.fechaDevolucionEstimada.replace('T', ' ').slice(0, 16) : ''}</div>
                      {log.fechaDevolucionReal ? (
                        <div className="font-bold text-emerald-700">Real: {log.fechaDevolucionReal.replace('T', ' ').slice(0, 16)}</div>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-600">Pendiente de retorno</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs">
                      <div>
                        <span className="font-semibold text-gray-700">Salida:</span> {log.condicionEntrega}
                      </div>
                      {log.condicionDevolucion && (
                        <div>
                          <span className="font-semibold text-gray-700">Retorno:</span> {log.condicionDevolucion}
                        </div>
                      )}
                      <div className="text-[11px] text-plai-muted truncate max-w-[220px]" title={log.accesoriosEntregados}>
                        Accesorios: {log.accesoriosEntregados}
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                        log.estadoPrestamo === 'Activo'
                          ? 'bg-amber-100 text-amber-800'
                          : log.estadoPrestamo === 'Devuelto'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.estadoPrestamo}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      {log.estadoPrestamo === 'Activo' ? (
                        <button
                          onClick={() => openReturnModal(log)}
                          className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          <RiCheckboxCircleLine size={15} />
                          <span>Registrar Devolución</span>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Concluido</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: REGISTRAR ENTREGA */}
      {isEntregaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl animate-pop-in max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <RiAddCircleLine className="text-2xl text-plai" />
                <h3 className="font-heading text-xl font-bold text-navy">
                  Registrar Entrega de Dispositivo (Salida)
                </h3>
              </div>
              <button onClick={() => setIsEntregaModalOpen(false)} className="cursor-pointer text-gray-400 hover:text-black">
                <RiCloseLine size={22} />
              </button>
            </div>

            <form onSubmit={handleEntregaSubmit} className="flex flex-col gap-4">
              {reservaciones.filter(r => r.estado === 'Aprobada' || r.estado === 'Pendiente').length > 0 && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-blue-900">
                    Vincular con Reservación Aprobada / Pendiente (Opcional - Autocompleta datos)
                  </label>
                  <select
                    value={entregaReservaId}
                    onChange={(e) => {
                      const resId = e.target.value;
                      setEntregaReservaId(resId);
                      const r = reservaciones.find(x => x.id === resId);
                      if (r) {
                        if (r.codigoPlaiAsignado) setEntregaCodigoPlai(r.codigoPlaiAsignado);
                        setEntregaUsuarioNombre(r.usuarioNombre || '');
                        setEntregaUsuarioEmail(r.usuarioEmail || '');
                        setEntregaUsuarioDependencia(r.usuarioInstitucion || '');
                        if (r.accesoriosIncluidos) setEntregaAccesorios(r.accesoriosIncluidos);
                        setEntregaObservaciones(`Folio ${r.folio}: ${r.actividad}`);
                      }
                    }}
                    className="w-full rounded-lg border border-blue-300 bg-white p-2 text-xs text-navy focus:border-plai focus:outline-none"
                  >
                    <option value="">-- Entrega directa sin reservación previa o selecciona un folio --</option>
                    {reservaciones
                      .filter(r => r.estado === 'Aprobada' || r.estado === 'Pendiente')
                      .map(r => (
                        <option key={r.id} value={r.id}>
                          [{r.estado}] {r.folio} — {r.usuarioNombre} ({r.codigoPlaiAsignado || r.categoriaId}) · {r.fechaUso}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">
                    Seleccionar Dispositivo por Código PLAi *
                  </label>
                  <select
                    required
                    value={entregaCodigoPlai}
                    onChange={(e) => {
                      const code = e.target.value;
                      setEntregaCodigoPlai(code);
                      const eq = equipos.find(x => x.inventoryNumber === code);
                      if (eq && eq.accessories && eq.accessories.length > 0) {
                        setEntregaAccesorios(eq.accessories.join(', '));
                      }
                    }}
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-plai focus:outline-none"
                  >
                    <option value="">-- Elige un dispositivo de inventario --</option>
                    {equipos.map(eq => (
                      <option key={eq.id} value={eq.inventoryNumber}>
                        {eq.inventoryNumber} - {eq.name} ({eq.category}) [{eq.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">
                    Nombre del Usuario Solicitante *
                  </label>
                  <input
                    type="text"
                    required
                    value={entregaUsuarioNombre}
                    onChange={(e) => setEntregaUsuarioNombre(e.target.value)}
                    placeholder="Ej: Lic. Mariana Torres"
                    className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-plai focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={entregaUsuarioEmail}
                    onChange={(e) => setEntregaUsuarioEmail(e.target.value)}
                    placeholder="correo@institucion.edu.mx"
                    className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-plai focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">
                    Institución / Dependencia / Empresa
                  </label>
                  <input
                    type="text"
                    value={entregaUsuarioDependencia}
                    onChange={(e) => setEntregaUsuarioDependencia(e.target.value)}
                    placeholder="Ej: Universidad de Guadalajara / Startup CCD"
                    className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-plai focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">
                    Fecha y Hora de Entrega *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={entregaFecha}
                    onChange={(e) => setEntregaFecha(e.target.value)}
                    className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-plai focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">
                    Fecha y Hora Estimada de Devolución *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={entregaFechaEstimada}
                    onChange={(e) => setEntregaFechaEstimada(e.target.value)}
                    className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-plai focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">
                    Condición Física Inicial
                  </label>
                  <select
                    value={entregaCondicion}
                    onChange={(e) => setEntregaCondicion(e.target.value as any)}
                    className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-plai focus:outline-none"
                  >
                    <option value="Excelente">Excelente (Impecable, sin marcas)</option>
                    <option value="Bueno">Bueno (Operativo, marcas mínimas)</option>
                    <option value="Regular">Regular (Desgaste visible)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">
                    Administrador que Entrega
                  </label>
                  <input
                    type="text"
                    value={entregaAdmin}
                    onChange={(e) => setEntregaAdmin(e.target.value)}
                    className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-plai focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">
                    Accesorios Entregados
                  </label>
                  <input
                    type="text"
                    value={entregaAccesorios}
                    onChange={(e) => setEntregaAccesorios(e.target.value)}
                    placeholder="Ej: Controles, cable de corriente, maletín, cargador"
                    className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-plai focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">
                    Observaciones de Entrega
                  </label>
                  <textarea
                    rows={2}
                    value={entregaObservaciones}
                    onChange={(e) => setEntregaObservaciones(e.target.value)}
                    placeholder="Notas sobre el propósito de uso, responsabilidades o detalles iniciales..."
                    className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-plai focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEntregaModalOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-plai px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-plai-hover"
                >
                  Confirmar Entrega de Dispositivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: REGISTRAR DEVOLUCIÓN */}
      {isDevolucionModalOpen && selectedLogForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl animate-pop-in max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <RiCheckboxCircleLine className="text-2xl text-emerald-600" />
                <h3 className="font-heading text-xl font-bold text-navy">
                  Recepción y Devolución de Dispositivo
                </h3>
              </div>
              <button onClick={() => setIsDevolucionModalOpen(false)} className="cursor-pointer text-gray-400 hover:text-black">
                <RiCloseLine size={22} />
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
              <p><strong>Dispositivo:</strong> {selectedLogForReturn.codigoPlai} - {selectedLogForReturn.equipoNombre}</p>
              <p className="mt-1"><strong>Usuario:</strong> {selectedLogForReturn.usuarioNombre} ({selectedLogForReturn.usuarioEmail})</p>
              <p className="mt-1 text-gray-500"><strong>Accesorios que se entregaron:</strong> {selectedLogForReturn.accesoriosEntregados}</p>
            </div>

            <form onSubmit={handleDevolucionSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">
                  Fecha y Hora Real de Devolución *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={devolucionFechaReal}
                  onChange={(e) => setDevolucionFechaReal(e.target.value)}
                  className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-plai focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">
                  Condición Física al Recibir *
                </label>
                <select
                  value={devolucionCondicion}
                  onChange={(e) => setDevolucionCondicion(e.target.value as any)}
                  className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-plai focus:outline-none"
                >
                  <option value="Excelente">Excelente (Sin novedades ni daños)</option>
                  <option value="Bueno">Bueno (Limpio y 100% funcional)</option>
                  <option value="Observación">Observación (Detalles estéticos menores)</option>
                  <option value="En revisión">En revisión (Requiere diagnóstico técnico)</option>
                  <option value="Dañado">Dañado (Falla operativa o daño físico evidente)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">
                  Verificación de Accesorios Devueltos
                </label>
                <input
                  type="text"
                  value={devolucionAccesorios}
                  onChange={(e) => setDevolucionAccesorios(e.target.value)}
                  placeholder="Ej: Todos completos y probados / Falta cable de carga"
                  className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-plai focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">
                  Observaciones de Devolución
                </label>
                <textarea
                  rows={2}
                  value={devolucionObservaciones}
                  onChange={(e) => setDevolucionObservaciones(e.target.value)}
                  placeholder="Comentarios de recepción, pruebas de encendido realizadas..."
                  className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-plai focus:outline-none"
                />
              </div>

              {/* Parámetro de Incidencia Técnica vinculada a Mantenimiento */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
                <label className="flex items-center gap-2 font-bold text-xs text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={devolucionIncidencia}
                    onChange={(e) => setDevolucionIncidencia(e.target.checked)}
                    className="size-4 rounded text-plai focus:ring-plai"
                  />
                  <span>¿Reportar Incidencia de Mantenimiento? (Pone el equipo en mantenimiento automáticamente)</span>
                </label>

                {devolucionIncidencia && (
                  <div className="mt-3 flex flex-col gap-1.5 animate-pop-in">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                      Descripción de la falla o daño para el área de Mantenimiento
                    </label>
                    <textarea
                      rows={2}
                      required={devolucionIncidencia}
                      value={devolucionDescripcionIncidencia}
                      onChange={(e) => setDevolucionDescripcionIncidencia(e.target.value)}
                      placeholder="Describe qué ocurrió con el equipo para que el técnico lo inspeccione..."
                      className="rounded-lg border border-amber-300 bg-white p-2 text-xs focus:border-plai focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDevolucionModalOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
                >
                  Completar Devolución
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
