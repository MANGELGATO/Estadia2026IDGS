"use client";

import React, { useState, useEffect } from 'react';
import { RiVideoLine, RiSave3Line } from 'react-icons/ri';

const categories = [
  { id: 'realidad-virtual', name: 'Realidad Virtual' },
  { id: 'robotica', name: 'Robótica' },
  { id: 'fabricacion-digital', name: 'Fabricación Digital' },
  { id: 'drones', name: 'Drones' },
  { id: 'computo-multimedia', name: 'Cómputo / Multimedia' }
];

const readSavedVideo = (categoryId: string): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(`category_video_${categoryId}`) || '';
};

export default function CategoriasConfigPage() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [videoUrl, setVideoUrl] = useState('');
  const [savedMessage, setSavedMessage] = useState(false);

  // Carga inicial desde localStorage (solo cliente, diferida para evitar setState síncrono en el efecto)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setVideoUrl(readSavedVideo(categories[0].id));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setVideoUrl(readSavedVideo(categoryId));
    setSavedMessage(false);
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`category_video_${selectedCategory}`, videoUrl);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    }
  };

  return (
    <div className="flex animate-pop-in flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="mb-1 font-heading text-3xl font-extrabold text-navy">Configuración de Categorías</h1>
          <p className="text-sm text-plai-muted md:text-base">Gestiona el contenido multimedia de las categorías de PLAi</p>
        </div>
      </div>

      <div className="max-w-3xl">
        <div className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-5 flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-navy">Selecciona una Categoría</label>
            <select 
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-5 flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-navy">
              <RiVideoLine className="text-base text-plai" /> URL del Video (YouTube)
            </label>
            <input 
              type="text" 
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-800 transition-all focus:border-plai focus:outline-none focus:ring-2 focus:ring-plai/20" 
              placeholder="Ej: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <p className="text-xs text-plai-muted">Ingresa el enlace del video de YouTube que quieres mostrar en la sección &quot;Casos de Éxito Destacados&quot;.</p>
          </div>

          <button className="flex cursor-pointer items-center gap-2 rounded-lg bg-plai px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-plai-dark" onClick={handleSave}>
            <RiSave3Line /> Guardar Cambios
          </button>
          
          {savedMessage && <p className="mt-3 animate-pop-in text-sm font-semibold text-emerald-600">¡Configuración guardada exitosamente!</p>}

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h3 className="mb-4 font-heading text-lg font-bold text-navy">Vista Previa</h3>
            {videoUrl ? (
              <div className="aspect-video w-full overflow-hidden rounded-xl shadow-md">
                <iframe
                  width="100%"
                  height="100%"
                  src={videoUrl.includes('watch?v=') ? videoUrl.replace("watch?v=", "embed/") : videoUrl}
                  title="Vista previa del video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-plai-muted">
                <p>Ingresa una URL de YouTube para ver la vista previa.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
