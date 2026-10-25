"use client";

import React, { useState } from 'react';
import DataTable, { Column } from '../../components/admin/DataTable';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

type Equipment = {
  id: number;
  name: string;
  category: string;
  status: 'Activo' | 'En mantenimiento' | 'Inactivo';
  dateAdded: string;
};

const initialData: Equipment[] = [
  { id: 1, name: 'Impresora 3D Ender 3', category: 'Impresoras 3D', status: 'Activo', dateAdded: '2023-01-15' },
  { id: 2, name: 'Lentes Meta Quest 3', category: 'Realidad Virtual', status: 'En mantenimiento', dateAdded: '2023-05-20' },
  { id: 3, name: 'Brazo Robótico Dobot', category: 'Robótica', status: 'Inactivo', dateAdded: '2022-11-10' },
  { id: 4, name: 'Laptop Dell XPS 15', category: 'Cómputo', status: 'Activo', dateAdded: '2024-02-01' },
  { id: 5, name: 'Kit Arduino Uno', category: 'Electrónica', status: 'Activo', dateAdded: '2023-08-11' },
];

export default function InventarioPage() {
  const [data, setData] = useState<Equipment[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);

  const columns: Column[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'category', label: 'Categoría' },
    { key: 'dateAdded', label: 'Fecha de Registro' },
    { 
      key: 'status', 
      label: 'Estado',
      render: (value: string) => {
        let bg = 'rgba(16, 185, 129, 0.1)';
        let color = '#10B981';
        
        if (value === 'En mantenimiento') {
          bg = 'rgba(245, 158, 11, 0.1)';
          color = '#F59E0B';
        } else if (value === 'Inactivo') {
          bg = 'rgba(239, 68, 68, 0.1)';
          color = '#EF4444';
        }

        return (
          <span style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            backgroundColor: bg,
            color: color
          }}>
            {value}
          </span>
        );
      }
    }
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Equipment) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: Equipment) => {
    setDeletingEquipment(item);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: Equipment = {
      id: editingItem ? editingItem.id : Date.now(),
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      status: formData.get('status') as 'Activo' | 'En mantenimiento' | 'Inactivo',
      dateAdded: editingItem ? editingItem.dateAdded : new Date().toISOString().split('T')[0],
    };

    if (editingItem) {
      setData(data.map(d => d.id === editingItem.id ? newItem : d));
    } else {
      setData([...data, newItem]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">Gestión de Inventario</h1>
          <p className="text-sm text-plai-muted md:text-base">Administra los recursos tecnológicos del laboratorio</p>
        </div>
      </div>

      <DataTable 
        title="Todos los Equipos"
        columns={columns}
        data={data}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addActionLabel="Registrar Recurso"
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-pop-in">
          <div className="w-full max-w-[500px] rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl md:p-8">
            <h2 className="mb-6 font-heading text-xl font-bold text-navy md:text-2xl">
              {editingItem ? 'Modificar Recurso' : 'Registrar Nuevo Recurso'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">Nombre del Equipo</label>
                <input 
                  type="text" 
                  name="name" 
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" 
                  defaultValue={editingItem?.name} 
                  required 
                />
              </div>
              <div className="mb-4 flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">Categoría</label>
                <input 
                  type="text" 
                  name="category" 
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" 
                  defaultValue={editingItem?.category} 
                  required 
                />
              </div>
              <div className="mb-4 flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-navy">Estado</label>
                <select name="status" className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" defaultValue={editingItem?.status || 'Activo'}>
                  <option value="Activo">Activo</option>
                  <option value="En mantenimiento">En mantenimiento</option>
                  <option value="Inactivo">Inactivo (Dado de baja)</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="rounded-lg bg-plai px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-plai-dark">
                  {editingItem ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deletingEquipment}
        title="¿Dar de baja equipo?"
        description={`El equipo "${deletingEquipment?.name}" será retirado del inventario activo de PLAi.`}
        confirmText="Dar de baja"
        onConfirm={() => {
          if (deletingEquipment) {
            setData(data.filter(d => d.id !== deletingEquipment.id));
          }
        }}
        onClose={() => setDeletingEquipment(null)}
      />
    </div>
  );
}
