import React from 'react';
import styles from './DataTable.module.css';
import { RiEdit2Line, RiDeleteBinLine, RiAddLine } from 'react-icons/ri';

/* eslint-disable @typescript-eslint/no-explicit-any --
   Tabla genérica: las páginas admin pasan filas de distintas interfaces.
   Pendiente tipar con genéricos al integrar la capa de datos real. */
export type Column = {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
};

type DataTableProps = {
  title: string;
  columns: Column[];
  data: any[];
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  addActionLabel?: string;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function DataTable({ 
  title, 
  columns, 
  data, 
  onAdd, 
  onEdit, 
  onDelete,
  addActionLabel = 'Agregar'
}: DataTableProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {onAdd && (
          <button className={styles.primaryBtn} onClick={onAdd}>
            <RiAddLine /> {addActionLabel}
          </button>
        )}
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              {(onEdit || onDelete) && <th style={{ width: '100px', textAlign: 'center' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id || index}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      {onEdit && (
                        <button 
                          className={styles.actionBtn} 
                          onClick={() => onEdit(item)}
                          title="Editar"
                        >
                          <RiEdit2Line />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`} 
                          onClick={() => onDelete(item)}
                          title="Eliminar / Dar de baja"
                        >
                          <RiDeleteBinLine />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} style={{ textAlign: 'center', padding: '2rem' }}>
                  No hay datos disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
