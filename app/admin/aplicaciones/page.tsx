"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import DataTable, { Column } from '../../components/admin/DataTable';

type Application = {
  id: number;
  name: string;
  version: string;
  category: string;
  licenses: number;
};

const initialData: Application[] = [
  { id: 1, name: 'AutoCAD 2024', version: '24.1.0', category: 'Diseño 3D', licenses: 15 },
  { id: 2, name: 'Unity Hub', version: '3.6.1', category: 'Desarrollo de Videojuegos', licenses: 30 },
  { id: 3, name: 'Visual Studio Code', version: '1.93.0', category: 'Desarrollo', licenses: 100 },
  { id: 4, name: 'Adobe Creative Cloud', version: '2024', category: 'Diseño Gráfico', licenses: 10 },
  { id: 5, name: 'Blender', version: '4.0.2', category: 'Diseño 3D', licenses: 50 },
];

export default function AplicacionesPage() {
  const [data, setData] = useState<Application[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Application | null>(null);

  const columns: Column[] = [
    { key: 'name', label: 'Nombre de Aplicación' },
    { key: 'version', label: 'Versión' },
    { key: 'category', label: 'Categoría' },
    { 
      key: 'licenses', 
      label: 'Licencias Disponibles',
      render: (value: number) => {
        let bg = 'rgba(16, 185, 129, 0.1)';
        let color = '#10B981';
        
        if (value < 15) {
          bg = 'rgba(245, 158, 11, 0.1)';
          color = '#F59E0B';
        } 
        if (value === 0) {
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
            backgroundColor: bg,
            color: color
          }}>
            {value} {value === 1 ? 'Licencia' : 'Licencias'}
          </span>
        );
      }
    }
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Application) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: Application) => {
    if (confirm(`¿Estás seguro de querer eliminar la aplicación "${item.name}" del catálogo?`)) {
      setData(data.filter(d => d.id !== item.id));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: Application = {
      id: editingItem ? editingItem.id : Date.now(),
      name: formData.get('name') as string,
      version: formData.get('version') as string,
      category: formData.get('category') as string,
      licenses: parseInt(formData.get('licenses') as string, 10),
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
          <h1 className={styles.title}>Catálogo de Aplicaciones</h1>
          <p className={styles.subtitle}>Gestiona el software disponible en el laboratorio</p>
        </div>
      </div>

      <DataTable 
        title="Aplicaciones Registradas"
        columns={columns}
        data={data}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addActionLabel="Agregar Aplicación"
      />

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>
              {editingItem ? 'Modificar Aplicación' : 'Agregar Nueva Aplicación'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre de la Aplicación</label>
                <input 
                  type="text" 
                  name="name" 
                  className={styles.input} 
                  defaultValue={editingItem?.name} 
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Versión</label>
                <input 
                  type="text" 
                  name="version" 
                  className={styles.input} 
                  defaultValue={editingItem?.version} 
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
                <label className={styles.label}>Licencias Disponibles</label>
                <input 
                  type="number" 
                  name="licenses" 
                  className={styles.input} 
                  defaultValue={editingItem?.licenses || 1} 
                  min="0"
                  required 
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  {editingItem ? 'Guardar Cambios' : 'Agregar al Catálogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
