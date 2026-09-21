"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import DataTable, { Column } from '../../components/admin/DataTable';

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
    if (confirm(`¿Estás seguro de querer dar de baja el equipo "${item.name}"?`)) {
      setData(data.filter(d => d.id !== item.id));
    }
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
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gestión de Inventario</h1>
          <p className={styles.subtitle}>Administra los recursos tecnológicos del laboratorio</p>
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
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>
              {editingItem ? 'Modificar Recurso' : 'Registrar Nuevo Recurso'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre del Equipo</label>
                <input 
                  type="text" 
                  name="name" 
                  className={styles.input} 
                  defaultValue={editingItem?.name} 
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Categoría</label>
                <input 
                  type="text" 
                  name="category" 
                  className={styles.input} 
                  defaultValue={editingItem?.category} 
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Estado</label>
                <select name="status" className={styles.select} defaultValue={editingItem?.status || 'Activo'}>
                  <option value="Activo">Activo</option>
                  <option value="En mantenimiento">En mantenimiento</option>
                  <option value="Inactivo">Inactivo (Dado de baja)</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  {editingItem ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
