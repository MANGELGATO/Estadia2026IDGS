"use client";

import React, { useState } from 'react';
import DataTable, { Column } from '../../components/admin/DataTable';
import StatCard from '../../components/admin/StatCard';
import { RiUserLine, RiUserSettingsLine, RiShieldUserLine } from 'react-icons/ri';

type UserRole = 'Administrador' | 'Colaborador' | 'Usuario Final';
type UserStatus = 'Activo' | 'Inactivo';

type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  reservations: number;
};

const initialData: User[] = [
  { id: 1, name: 'Juan Pérez',    email: 'juan.perez@plai.edu.mx',    role: 'Administrador',  status: 'Activo',   lastLogin: '2026-09-21', reservations: 0 },
  { id: 2, name: 'Ana García',    email: 'ana.garcia@plai.edu.mx',    role: 'Colaborador',    status: 'Activo',   lastLogin: '2026-09-21', reservations: 5 },
  { id: 3, name: 'Carlos López',  email: 'carlos.lopez@plai.edu.mx',  role: 'Colaborador',    status: 'Activo',   lastLogin: '2026-09-20', reservations: 3 },
  { id: 4, name: 'María Torres',  email: 'maria.torres@plai.edu.mx',  role: 'Colaborador',    status: 'Activo',   lastLogin: '2026-09-19', reservations: 8 },
  { id: 5, name: 'Pedro Sánchez', email: 'pedro.sanchez@plai.edu.mx', role: 'Usuario Final',  status: 'Activo',   lastLogin: '2026-09-18', reservations: 1 },
  { id: 6, name: 'Lucía Ramírez', email: 'lucia.ramirez@plai.edu.mx', role: 'Usuario Final',  status: 'Inactivo', lastLogin: '2026-08-05', reservations: 2 },
];

const roleConfig: Record<UserRole, { bg: string; color: string; icon: React.ReactNode }> = {
  Administrador: { bg: 'rgba(168,30,113,0.12)', color: '#a81e71',   icon: <RiShieldUserLine /> },
  Colaborador:   { bg: 'rgba(99,102,241,0.12)', color: '#4F46E5',   icon: <RiUserSettingsLine /> },
  'Usuario Final': { bg: 'rgba(107,114,128,0.12)', color: '#6B7280', icon: <RiUserLine /> },
};

function RoleBadge({ value }: { value: UserRole }) {
  const cfg = roleConfig[value];
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
  const [data, setData] = useState<User[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<User | null>(null);

  const admins = data.filter(u => u.role === 'Administrador').length;
  const colaboradores = data.filter(u => u.role === 'Colaborador').length;
  const activos = data.filter(u => u.status === 'Activo').length;

  const handleAdd = () => { setEditingItem(null); setIsModalOpen(true); };
  const handleEdit = (item: User) => { setEditingItem(item); setIsModalOpen(true); };
  const handleDelete = (item: User) => {
    if (item.role === 'Administrador') {
      alert('No puedes eliminar una cuenta de Administrador.');
      return;
    }
    if (confirm(`¿Desactivar la cuenta de "${item.name}"?`)) {
      setData(data.map(u => u.id === item.id ? { ...u, status: 'Inactivo' } : u));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (editingItem) {
      setData(data.map(u => u.id === editingItem.id ? {
        ...u,
        name: fd.get('name') as string,
        email: fd.get('email') as string,
        role: fd.get('role') as UserRole,
        status: fd.get('status') as UserStatus,
      } : u));
    } else {
      const newUser: User = {
        id: Date.now(),
        name: fd.get('name') as string,
        email: fd.get('email') as string,
        role: fd.get('role') as UserRole,
        status: 'Activo',
        lastLogin: '—',
        reservations: 0,
      };
      setData([...data, newUser]);
    }
    setIsModalOpen(false);
  };

  const columns: Column[] = [
    {
      key: 'name',
      label: 'Usuario',
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a81e71] to-[#c42585] text-sm font-bold text-white">
            {value.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold text-navy">{value}</div>
            <div className="text-xs text-plai-muted">{item.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'role', label: 'Rol', render: (value) => <RoleBadge value={value} /> },
    { key: 'status', label: 'Estado', render: (value) => <StatusDot value={value} /> },
    { key: 'reservations', label: 'Reservaciones', render: (v) => <span className="font-semibold">{v}</span> },
    { key: 'lastLogin', label: 'Último Acceso' },
  ];

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">Gestión de Usuarios</h1>
          <p className="text-sm text-plai-muted md:text-base">Administra los usuarios y permisos del sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Usuarios" value={data.length} icon={<RiUserLine />} variant="primary" />
        <StatCard title="Activos" value={activos} icon={<RiUserLine />} variant="success" />
        <StatCard title="Administradores" value={admins} icon={<RiShieldUserLine />} variant="warning" />
        <StatCard title="Colaboradores" value={colaboradores} icon={<RiUserSettingsLine />} variant="primary" />
      </div>

      <DataTable
        title="Usuarios Registrados"
        columns={columns}
        data={data}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addActionLabel="Agregar Usuario"
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-pop-in" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-[500px] rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl md:p-8" onClick={e => e.stopPropagation()}>
            <h2 className="mb-6 font-heading text-xl font-bold text-navy md:text-2xl">
              {editingItem ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">Nombre completo</label>
                <input type="text" name="name" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.name} required />
              </div>
              <div className="mb-4 flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">Correo electrónico</label>
                <input type="email" name="email" className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.email} required />
              </div>
              <div className="mb-4 flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">Rol</label>
                <select name="role" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.role || 'Colaborador'}>
                  <option value="Administrador">Administrador</option>
                  <option value="Colaborador">Colaborador</option>
                  <option value="Usuario Final">Usuario Final</option>
                </select>
              </div>
              {editingItem && (
                <div className="mb-4 flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-navy">Estado</label>
                  <select name="status" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.status}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              )}
              <div className="my-4 rounded-xl border border-black/[0.06] bg-gray-50 p-3.5 text-xs text-gray-600">
                <div className="mb-1 font-bold text-navy">Descripción de roles:</div>
                <div className="flex flex-col gap-1">
                  <div><strong>Administrador:</strong> Acceso total al sistema, gestiona recursos y usuarios.</div>
                  <div><strong>Colaborador:</strong> Consulta y solicita reservaciones, gestión limitada.</div>
                  <div><strong>Usuario Final:</strong> Solo consulta información pública.</div>
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
    </div>
  );
}
