import React from 'react';
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
    <div className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-plai-sm">
      <div className="flex items-center justify-between border-b border-black/[0.08] p-6">
        <h3 className="font-heading text-xl font-bold text-navy">{title}</h3>
        {onAdd && (
          <button
            className="flex items-center gap-2 rounded-lg bg-plai px-4 py-2 font-heading font-semibold text-white transition-all duration-[250ms] hover:-translate-y-px hover:bg-plai-hover"
            onClick={onAdd}
          >
            <RiAddLine /> {addActionLabel}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="border-b border-black/[0.08] bg-[#F4F6F9] px-6 py-4 font-heading text-xs font-semibold uppercase tracking-[0.05em] text-plai-muted"
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="w-[100px] border-b border-black/[0.08] bg-[#F4F6F9] px-6 py-4 text-center font-heading text-xs font-semibold uppercase tracking-[0.05em] text-plai-muted">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.id || index}
                className="transition-colors duration-[250ms] hover:bg-black/[0.02] last:[&>td]:border-b-0"
              >
                {columns.map((col) => (
                  <td key={col.key} className="border-b border-black/[0.08] px-6 py-4 text-sm text-plai-gray">
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="border-b border-black/[0.08] px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      {onEdit && (
                        <button 
                          className="cursor-pointer rounded p-1 text-xl text-plai-muted transition-colors duration-[250ms] hover:bg-plai/10 hover:text-plai" 
                          onClick={() => onEdit(item)}
                          title="Editar"
                        >
                          <RiEdit2Line />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          className="cursor-pointer rounded p-1 text-xl text-plai-muted transition-colors duration-[250ms] hover:bg-red-500/10 hover:text-red-500" 
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
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="p-8 text-center text-sm text-plai-muted"
                >
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
