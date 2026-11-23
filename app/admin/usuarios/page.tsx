"use client";

import React, { useState, useEffect } from 'react';
import DataTable, { Column } from '../../components/admin/DataTable';
import StatCard from '../../components/admin/StatCard';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { RiUserLine, RiUserSettingsLine, RiShieldUserLine } from 'react-icons/ri';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { UsuarioItem } from '../../../lib/db';

type UserRole = 'Administrador' | 'Colaborador' | 'Usuario Final';
type UserStatus = 'Activo' | 'Inactivo';

const roleConfig: Record<UserRole, { bg: string; color: string; icon: React.ReactNode }> = {
  Administrador: { bg: 'rgba(0,134,255,0.12)', color: '#0086ff', icon: <RiShieldUserLine /> },
  Colaborador:   { bg: 'rgba(30,92,167,0.12)', color: '#1e5ca7', icon: <RiUserSettingsLine /> },
  'Usuario Final': { bg: 'rgba(107,114,128,0.12)', color: '#6B7280', icon: <RiUserLine /> },
};

function RoleBadge({ value }: { value: UserRole }) {
  const cfg = roleConfig[value] || roleConfig['Usuario Final'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.25rem 0.75rem', borderRadius: '9999px',
      fontSize: '0.75rem', fontWeight: 600,
      backgroundColor: cfg.bg, color: cfg.color,
    }}>
      {cfg.icon} {value}
    </span>
  );
}

function StatusDot({ value }: { value: UserStatus }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      fontSize: '0.875rem', fontWeight: 500,
      color: value === 'Activo' ? '#059669' : '#6B7280',
    }}>
      <span style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: value === 'Activo' ? '#059669' : '#9CA3AF',
        display: 'inline-block',
        boxShadow: value === 'Activo' ? '0 0 0 3px rgba(5,150,105,0.15)' : 'none',
      }} />
      {value}
    </span>
  );
}

export default function UsuariosPage() {
  const [data, setData] = useState<UsuarioItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UsuarioItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UsuarioItem | null>(null);
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'warning' | 'success' } | null>(null);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('/api/usuarios');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  useEffect(() => {
    let active = true;
    fetch('/api/usuarios')
      .then((res) => res.json())
      .then((json) => {
        if (active && json.success && Array.isArray(json.data)) {
          setData(json.data);
        }
      })
      .catch((err) => console.error('Error al cargar usuarios:', err));
    return () => {
      active = false;
    };
  }, []);

  const admins = data.filter(u => u.role === 'Administrador').length;
  const colaboradores = data.filter(u => u.role === 'Colaborador').length;
  const activos = data.filter(u => u.status === 'Activo').length;

  const handleAdd = () => { setEditingItem(null); setIsModalOpen(true); };
  const handleEdit = (item: UsuarioItem) => { setEditingItem(item); setIsModalOpen(true); };
  const handleDelete = (item: UsuarioItem) => {
    if (item.role === 'Administrador') {
      setActionNotice({
        text: 'No puedes desactivar ni eliminar una cuenta con rol de Administrador.',
        type: 'warning',
      });
      return;
    }
    setActionNotice(null);
    setDeletingUser(item);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      id: editingItem?.id,
      name: (fd.get('name') as string).trim(),
      email: (fd.get('email') as string).trim().toLowerCase(),
      password: (fd.get('password') as string)?.trim() || undefined,
      role: fd.get('role') as UserRole,
      status: (fd.get('status') as UserStatus) || 'Activo',
      dependencia: (fd.get('dependencia') as string)?.trim() || 'Comunidad PLAi',
    };

    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setActionNotice({
          text: editingItem
            ? `Datos de ${payload.name} actualizados y sincronizados.`
            : `Usuario ${payload.name} creado exitosamente (puede iniciar sesión con su correo).`,
          type: 'success',
        });
        fetchUsuarios();
      }
    } catch (err) {
      console.error('Error guardando usuario:', err);
    }
  };

  const columns: Column[] = [
    {
      key: 'name',
      label: 'Usuario / Dependencia',
      render: (value, item: UsuarioItem) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0086ff] to-[#1e5ca7] text-sm font-bold text-white">
            {String(value || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-navy">{value}</div>
            <div className="text-xs text-plai-muted">{item.email}</div>
            {item.dependencia && (
              <div className="text-[11px] text-gray-400">{item.dependencia}</div>
            )}
          </div>
        </div>
      ),
    },
    { key: 'role', label: 'Rol', render: (value) => <RoleBadge value={value} /> },
    { key: 'status', label: 'Estado', render: (value) => <StatusDot value={value} /> },
    {
      key: 'reservations',
      label: 'Reservaciones / Préstamos',
      render: (v) => (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 font-mono text-xs font-bold text-blue-700">
          {v ?? 0} registros
        </span>
      ),
    },
    { key: 'lastLogin', label: 'Último Acceso' },
  ];

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">Gestión de Usuarios</h1>
          <p className="text-sm text-plai-muted md:text-base">
            Administra las cuentas institucionales, permisos y trazabilidad de préstamos por usuario
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Usuarios" value={data.length} icon={<RiUserLine />} variant="primary" />
        <StatCard title="Activos" value={activos} icon={<RiUserLine />} variant="success" />
        <StatCard title="Administradores" value={admins} icon={<RiShieldUserLine />} variant="warning" />
        <StatCard title="Colaboradores" value={colaboradores} icon={<RiUserSettingsLine />} variant="primary" />
      </div>

      {actionNotice && (
        <div
          role="alert"
          className={`flex items-center justify-between rounded-xl border p-4 animate-pop-in ${
            actionNotice.type === 'warning'
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {actionNotice.type === 'warning' ? (
              <AlertTriangle size={20} className="shrink-0 text-amber-600" />
            ) : (
              <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
            )}
            <span className="text-sm font-semibold">{actionNotice.text}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="rounded-lg px-2 py-1 text-xs font-bold hover:bg-black/5 transition-colors"
          >
            Cerrar
          </button>
        </div>
      )}

      <DataTable
        title={`Usuarios Registrados (${data.length})`}
        columns={columns}
        data={data}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addActionLabel="Agregar Usuario"
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-pop-in" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-[520px] rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl md:p-8" onClick={e => e.stopPropagation()}>
            <h2 className="mb-6 font-heading text-xl font-bold text-navy md:text-2xl">
              {editingItem ? 'Editar Usuario Institucional' : 'Nuevo Usuario Institucional'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">Nombre completo *</label>
                <input type="text" name="name" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.name} required />
              </div>
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Correo electrónico *</label>
                  <input type="email" name="email" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.email} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">
                    Contraseña {editingItem ? '(Opcional)' : '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder={editingItem ? 'Dejar vacío para conservar actual' : 'Mínimo 8 caracteres'}
                    minLength={editingItem ? undefined : 8}
                    required={!editingItem}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20"
                  />
                </div>
              </div>
              <div className="mb-4 flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">Institución / Dependencia</label>
                <input
                  type="text"
                  name="dependencia"
                  placeholder="Ej. Universidad de Guadalajara / PLAi Jalisco"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20"
                  defaultValue={editingItem?.dependencia || 'Comunidad PLAi'}
                />
              </div>
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Rol</label>
                  <select name="role" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.role || 'Colaborador'}>
                    <option value="Administrador">Administrador</option>
                    <option value="Colaborador">Colaborador</option>
                    <option value="Usuario Final">Usuario Final</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Estado</label>
                  <select name="status" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.status || 'Activo'}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="my-4 rounded-xl border border-black/[0.06] bg-gray-50 p-3.5 text-xs text-gray-600">
                <div className="mb-1 font-bold text-navy">Descripción de roles:</div>
                <div className="flex flex-col gap-1">
                  <div><strong>Administrador:</strong> Acceso total al panel administrativo, inventario y bitácora.</div>
                  <div><strong>Colaborador / Usuario Final:</strong> Acceso al portal de préstamos, agenda y reservaciones con autollenado de identidad.</div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="rounded-lg bg-plai px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-plai-dark">{editingItem ? 'Guardar Cambios' : 'Crear Usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deletingUser}
        title="¿Desactivar cuenta de usuario?"
        description={`La cuenta de "${deletingUser?.name}" pasará a estado Inactivo y se restringirá su acceso al sistema.`}
        confirmText="Desactivar"
        onConfirm={async () => {
          if (deletingUser) {
            await fetch('/api/usuarios', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...deletingUser, status: 'Inactivo' }),
            });
            fetchUsuarios();
          }
        }}
        onClose={() => setDeletingUser(null)}
      />
    </div>
  );
}
